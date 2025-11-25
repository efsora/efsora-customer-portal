from enum import Enum

from pydantic import BaseModel, Field


class HelloResponse(BaseModel):
    message: str


class CreateUserResponse(BaseModel):
    user_name: str
    user_surname: str
    email: str


class EmbedResponse(BaseModel):
    text: str
    collection: str
    uuid: str


class SearchResult(BaseModel):
    uuid: str
    text: str
    distance: float | None = None
    properties: dict[str, object] | None = None


class SearchResponse(BaseModel):
    query: str
    collection: str
    results: list[SearchResult]
    count: int


class ChatResponse(BaseModel):
    question: str
    answer: str


class EmbedDocumentStage(str, Enum):
    """Stages of document embedding process."""

    DOWNLOADING = "downloading"
    LOADING = "loading"
    CHUNKING = "chunking"
    EMBEDDING = "embedding"
    STORING = "storing"
    COMPLETED = "completed"
    ERROR = "error"


class EmbedDocumentProgressEvent(BaseModel):
    """Progress event for document embedding SSE stream."""

    stage: EmbedDocumentStage = Field(
        ...,
        description="Current stage of the embedding process",
    )
    progress_percent: int = Field(
        ...,
        ge=0,
        le=100,
        description="Overall progress percentage",
    )
    message: str = Field(
        ...,
        description="Human-readable status message",
    )
    chunks_processed: int = Field(
        default=0,
        ge=0,
        description="Number of chunks processed so far",
    )
    total_chunks: int = Field(
        default=0,
        ge=0,
        description="Total number of chunks to process",
    )
    document_id: str | None = Field(
        default=None,
        description="Document identifier (set on completion)",
    )
    error_code: str | None = Field(
        default=None,
        description="Error code (set on error)",
    )
