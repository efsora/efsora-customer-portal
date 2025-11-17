from collections import deque
from collections.abc import AsyncGenerator
from typing import Annotated

from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from langchain_core.runnables import RunnableSerializable

from app.api.dependencies import get_context
from app.api.schemas.request import ChatRequest
from app.core.context import Context
from app.dependency_injection.container import Container

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

ContextDep = Annotated[Context, Depends(get_context)]

MAX_HISTORY_MESSAGES = 5  # Keep last 5 exchanges (10 messages total)


def format_history(history: deque[dict[str, str]]) -> str:
    """Format conversation history for prompt."""
    if not history:
        return "No previous conversation."
    return "\n".join(f"{item['role'].capitalize()}: {item['content']}" for item in history)


@router.post("/stream")
@inject
async def chat_stream(
    request: Request,
    payload: ChatRequest,
    ctx: ContextDep,
    rag_chain: RunnableSerializable[dict[str, str], str] = Depends(  # noqa: B008
        Provide[Container.rag_chain]
    ),
) -> StreamingResponse:
    """
    Stream chat responses from the RAG chain as Server-Sent Events (SSE).
    Supports simple session-based history management.
    """
    # Lazy initialization of chat memory
    chat_memory = getattr(request.app.state, "chat_memory", None)
    if chat_memory is None:
        chat_memory = {}
        request.app.state.chat_memory = chat_memory

    session_id = payload.session_id or "default"

    # Get or create conversation history for this session
    conversation_history = chat_memory.setdefault(
        session_id,
        deque(maxlen=MAX_HISTORY_MESSAGES * 2),  # user + assistant pairs
    )
    history_context = format_history(conversation_history)

    trace_id = getattr(request.state, "trace_id", None)
    ctx.logger.info(
        "Chat stream request received",
        trace_id=trace_id,
        session_id=session_id,
        message=payload.message,
    )

    async def event_generator() -> AsyncGenerator[str, None]:
        assistant_chunks: list[str] = []
        client_disconnected = False
        try:
            async for chunk in rag_chain.astream(
                {
                    "question": payload.message,
                    "history": history_context,
                }
            ):
                if await request.is_disconnected():
                    ctx.logger.warning(
                        "Client disconnected during chat stream",
                        trace_id=trace_id,
                        session_id=session_id,
                    )
                    client_disconnected = True
                    break

                # Extract text from chunk (ChatBedrock returns strings with StrOutputParser)
                text = chunk if isinstance(chunk, str) else str(chunk)

                # Smart spacing: ChatBedrock splits words mid-token
                # Add space if there's no whitespace between alphanumeric boundaries
                if text and assistant_chunks:
                    prev_chunk = assistant_chunks[-1]
                    if prev_chunk:
                        prev_char = prev_chunk[-1]
                        curr_char = text[0]

                        # Add space if both boundaries are alphanumeric (word continuation)
                        if prev_char.isalnum() and curr_char.isalnum():
                            text = " " + text

                # Stream the chunk
                if text:  # Only send non-empty chunks
                    assistant_chunks.append(text)
                    yield f"data: {text}\n\n"

        except Exception as exc:
            ctx.logger.exception(
                "Error in chat stream",
                trace_id=trace_id,
                session_id=session_id,
                error=str(exc),
            )
            # Proper SSE format for errors
            yield f"data: [Error] {str(exc)}\n\n"
        else:
            # Only update history if we got a complete response
            if assistant_chunks and not client_disconnected:
                response_text = "".join(assistant_chunks)
                conversation_history.append(
                    {
                        "role": "user",
                        "content": payload.message,
                    }
                )
                conversation_history.append(
                    {
                        "role": "assistant",
                        "content": response_text,
                    }
                )
                ctx.logger.info(
                    "Chat stream completed",
                    trace_id=trace_id,
                    session_id=session_id,
                    chunks_sent=len(assistant_chunks),
                )

    return StreamingResponse(event_generator(), media_type="text/event-stream")
