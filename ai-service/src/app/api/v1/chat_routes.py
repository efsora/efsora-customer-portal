from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
import structlog

from app.api.schemas.request import ChatRequest

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

logger = structlog.get_logger()


@router.post("/stream")
async def chat_stream(
    request: Request,
    payload: ChatRequest,
):
    """
    Stream chat responses from the RAG chain as Server-Sent Events (SSE).
    """

    rag_chain = getattr(request.app.state, "rag_chain", None)
    if rag_chain is None:
        raise HTTPException(status_code=500, detail="RAG chain is not initialized")

    trace_id = getattr(request.state, "trace_id", None)
    logger.info(
        "Chat stream request received",
        trace_id=trace_id,
        message=payload.message,
    )

    async def event_generator():
        try:
            async for chunk in rag_chain.astream(payload.message):
                text = chunk if isinstance(chunk, str) else str(chunk)
                yield f"{text}\n\n"
        except Exception as exc:
            logger.exception(
                "Error in chat stream",
                trace_id=trace_id,
                error=str(exc),
            )
            yield f"data: [Error] {str(exc)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
