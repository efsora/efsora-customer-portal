from typing import Annotated

from fastapi import APIRouter, Depends, Request, status

from app.api.schemas.base_response import AppResponse
from app.api.schemas.request import (
    CreateUserRequest,
    EmbedRequest,
    SearchRequest,
)
from app.api.schemas.response import (
    CreateUserResponse,
    EmbedResponse,
    HelloResponse,
    SearchResponse,
)
from app.services.user_service import UserService
from app.services.weaviate_service import WeaviateService

router = APIRouter(prefix="/api/v1", tags=["v1"])

UserServiceDep = Annotated[UserService, Depends()]


def get_weaviate_service() -> WeaviateService:
    """Dependency to get Weaviate service instance."""
    return WeaviateService(host="weaviate", port=8080)


WeaviateServiceDep = Annotated[WeaviateService, Depends(get_weaviate_service)]


@router.get("/hello", response_model=AppResponse[HelloResponse])
async def hello(request: Request) -> AppResponse[HelloResponse]:
    trace_id = getattr(request.state, "trace_id", None)
    return AppResponse.ok(HelloResponse(message="Hello, World!"), trace_id=trace_id)


@router.post(
    "/users", response_model=AppResponse[CreateUserResponse], status_code=status.HTTP_201_CREATED
)
async def create_user(
    request: Request,
    payload: CreateUserRequest,
    user_service: UserServiceDep,
) -> AppResponse[CreateUserResponse]:
    trace_id = getattr(request.state, "trace_id", None)

    user_entity = await user_service.create_user(payload.user_name, payload.user_surname)

    user = CreateUserResponse(
        user_name=user_entity.user_name,
        user_surname=payload.user_surname,
        email=user_entity.email.value,
    )

    return AppResponse.ok(user, message="User created", trace_id=trace_id)


@router.post(
    "/weaviate/embed",
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

    try:
        result = await weaviate_service.embed_text(payload.text, payload.collection)
        embed_response = EmbedResponse(
            text=result["text"],
            collection=result["collection"],
            uuid=result["uuid"],
        )
        return AppResponse.ok(
            embed_response, message="Text embedded successfully", trace_id=trace_id
        )
    except ValueError as e:
        return AppResponse.fail(
            code="WEAVIATE_ERROR",
            message="Failed to embed text",
            detail=str(e),
            trace_id=trace_id,
        )


@router.post("/weaviate/search", response_model=AppResponse[SearchResponse])
async def search_weaviate(
    request: Request,
    payload: SearchRequest,
    weaviate_service: WeaviateServiceDep,
) -> AppResponse[SearchResponse]:
    """Search for similar objects in Weaviate using BM25 search."""
    trace_id = getattr(request.state, "trace_id", None)

    try:
        result = await weaviate_service.search(payload.query, payload.collection, payload.limit)
        search_response = SearchResponse(
            query=result["query"],
            collection=result["collection"],
            results=result["results"],
            count=result["count"],
        )
        return AppResponse.ok(search_response, message="Search completed", trace_id=trace_id)
    except ValueError as e:
        return AppResponse.fail(
            code="WEAVIATE_ERROR",
            message="Failed to search",
            detail=str(e),
            trace_id=trace_id,
        )
