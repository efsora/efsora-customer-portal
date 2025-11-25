from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import StreamingResponse
from langchain_aws import BedrockEmbeddings
import weaviate

from app.api.dependencies import get_context, get_embeddings, get_settings, get_weaviate_client
from app.api.schemas.base_response import AppResponse
from app.api.schemas.errors import ErrorCode
from app.api.schemas.request import EmbedDocumentRequest, EmbedRequest, SearchRequest
from app.api.schemas.response import EmbedResponse, SearchResponse
from app.core.context import Context
from app.core.settings import Settings
from app.services.document_embedding_service import embed_document_with_progress
from app.services.weaviate_service import WeaviateService

router = APIRouter(prefix="/api/v1/weaviate", tags=["weaviate"])

WeaviateServiceDep = Annotated[WeaviateService, Depends()]
ContextDep = Annotated[Context, Depends(get_context)]
SettingsDep = Annotated[Settings, Depends(get_settings)]
WeaviateClientDep = Annotated[weaviate.WeaviateAsyncClient, Depends(get_weaviate_client)]
EmbeddingsDep = Annotated[BedrockEmbeddings, Depends(get_embeddings)]


@router.post(
    "/embed",
    response_model=AppResponse[EmbedResponse],
    status_code=status.HTTP_201_CREATED,
)
async def embed_text(
    request: Request,
    payload: EmbedRequest,
    weaviate_service: WeaviateServiceDep,
) -> AppResponse[EmbedResponse]:
    """Embed text into Weaviate vector database."""
    trace_id = getattr(request.state, "trace_id", None)
    weaviate_service.ctx.logger.info(
        f"Embedding text into collection '{payload.collection}' ({len(payload.text)} chars)",
        trace_id=trace_id,
        collection=payload.collection,
        text_length=len(payload.text),
    )

    try:
        result = await weaviate_service.embed_text(payload.text, payload.collection)
        embed_response = EmbedResponse(
            text=result["text"],
            collection=result["collection"],
            uuid=result["uuid"],
        )
        weaviate_service.ctx.logger.info(
            f"Text embedded successfully in '{payload.collection}': {result['uuid']}",
            trace_id=trace_id,
            collection=payload.collection,
            uuid=result["uuid"],
        )
        return AppResponse.ok(
            embed_response, message="Text embedded successfully", trace_id=trace_id
        )
    except ValueError as e:
        weaviate_service.ctx.logger.error(
            f"Failed to embed text in '{payload.collection}': {str(e)}",
            trace_id=trace_id,
            collection=payload.collection,
            error=str(e),
        )
        return AppResponse.fail(
            code=ErrorCode.WEAVIATE_ERROR,
            message="Failed to embed text",
            detail=str(e),
            trace_id=trace_id,
        )


@router.post("/search", response_model=AppResponse[SearchResponse])
async def search_weaviate(
    request: Request,
    payload: SearchRequest,
    weaviate_service: WeaviateServiceDep,
) -> AppResponse[SearchResponse]:
    """Search for similar objects in Weaviate using BM25 search."""
    trace_id = getattr(request.state, "trace_id", None)
    weaviate_service.ctx.logger.info(
        f"Searching in collection '{payload.collection}' for: '{payload.query}' (limit: {payload.limit})",
        trace_id=trace_id,
        collection=payload.collection,
        query=payload.query,
        limit=payload.limit,
    )

    try:
        result = await weaviate_service.search(payload.query, payload.collection, payload.limit)
        search_response = SearchResponse(
            query=result["query"],
            collection=result["collection"],
            results=result["results"],
            count=result["count"],
        )
        weaviate_service.ctx.logger.info(
            f"Search completed in '{payload.collection}': found {result['count']} result(s)",
            trace_id=trace_id,
            collection=payload.collection,
            query=payload.query,
            results_count=result["count"],
        )
        return AppResponse.ok(search_response, message="Search completed", trace_id=trace_id)
    except ValueError as e:
        weaviate_service.ctx.logger.error(
            f"Search failed in '{payload.collection}' for '{payload.query}': {str(e)}",
            trace_id=trace_id,
            collection=payload.collection,
            query=payload.query,
            error=str(e),
        )
        return AppResponse.fail(
            code=ErrorCode.WEAVIATE_ERROR,
            message="Failed to search",
            detail=str(e),
            trace_id=trace_id,
        )


@router.post(
    "/embed-document",
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "SSE stream of embedding progress events",
            "content": {"text/event-stream": {}},
        }
    },
)
async def embed_document(
    request: Request,
    payload: EmbedDocumentRequest,
    ctx: ContextDep,
    settings: SettingsDep,
    weaviate_client: WeaviateClientDep,
    embeddings: EmbeddingsDep,
) -> StreamingResponse:
    """
    Embed a document from S3 into Weaviate vector database.

    This endpoint streams progress events via Server-Sent Events (SSE).
    The document is downloaded from S3, chunked, embedded, and stored in Weaviate.

    Progress stages:
    - downloading (0-10%): Downloading file from S3
    - loading (10-20%): Loading and parsing document
    - chunking (20-30%): Semantic chunking
    - embedding (30-90%): Generating embeddings
    - storing (90-100%): Storing in Weaviate
    - completed (100%): Done
    - error: Failed with error message
    """
    trace_id = getattr(request.state, "trace_id", None)

    ctx.logger.info(
        f"Starting document embedding: {payload.s3_key}",
        trace_id=trace_id,
        s3_key=payload.s3_key,
        project_id=payload.project_id,
        collection_name=payload.collection_name,
    )

    async def event_generator() -> AsyncGenerator[str, None]:
        """Generate SSE events from the embedding progress."""
        async for progress_event in embed_document_with_progress(
            ctx=ctx,
            settings=settings,
            weaviate_client=weaviate_client,
            embeddings=embeddings,
            s3_key=payload.s3_key,
            collection_name=payload.collection_name,
            project_id=payload.project_id,
        ):
            # Format as SSE event
            event_data = progress_event.model_dump_json()
            yield f"data: {event_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
