from collections import deque
from collections.abc import AsyncGenerator

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
import structlog

from app.api.schemas.request import ChatRequest

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

logger = structlog.get_logger()

MAX_HISTORY_MESSAGES = 10


def format_history(history: deque[dict[str, str]]) -> str:
    if not history:
        return "No previous conversation history."
    return "\n".join(f"{item['role'].capitalize()}: {item['content']}" for item in history)


@router.post("/stream")
async def chat_stream(
    request: Request,
    payload: ChatRequest,
) -> StreamingResponse:
    """
    Stream chat responses from the RAG chain as Server-Sent Events (SSE).
    """

    rag_chain = getattr(request.app.state, "rag_chain", None)
    if rag_chain is None:
        raise HTTPException(status_code=500, detail="RAG chain is not initialized")

    chat_memory = getattr(request.app.state, "chat_memory", None)
    if chat_memory is None:
        chat_memory = {}
        request.app.state.chat_memory = chat_memory

    session_id = payload.session_id or "default"

    # Get or create conversation history for this session
    conversation_history = chat_memory.setdefault(
        session_id,
        deque(maxlen=MAX_HISTORY_MESSAGES * 2),  # define max length of the history
    )
    history_context = format_history(conversation_history)

    trace_id = getattr(request.state, "trace_id", None)
    logger.info(
        "Chat stream request received",
        trace_id=trace_id,
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
                    logger.warning(
                        "Client disconnected during chat stream",
                        trace_id=trace_id,
                    )
                    client_disconnected = True
                    break
                text = chunk if isinstance(chunk, str) else str(chunk)
                assistant_chunks.append(text)
                yield f"data: {text}\n\n"
        except Exception as exc:
            logger.exception(
                "Error in chat stream",
                trace_id=trace_id,
                error=str(exc),
            )
            yield f"data: [Error] {str(exc)}\n\n"
        else:
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
        finally:
            chat_memory[session_id] = conversation_history

    return StreamingResponse(event_generator(), media_type="text/event-stream")
