from typing import Annotated, Any

from fastapi import Depends
from langchain_aws import BedrockEmbeddings
import weaviate

from app.api.dependencies import get_context, get_embeddings, get_weaviate_client
from app.core.context import Context
from app.db_ops.weaviate_db_ops import embed_text_in_weaviate, search_in_weaviate

ContextDep = Annotated[Context, Depends(get_context)]
WeaviateClientDep = Annotated[weaviate.WeaviateAsyncClient, Depends(get_weaviate_client)]
EmbeddingsDep = Annotated[BedrockEmbeddings, Depends(get_embeddings)]


class WeaviateService:
    """Service layer for Weaviate operations with vector embeddings."""

    def __init__(
        self,
        ctx: ContextDep,
        weaviate_client: WeaviateClientDep,
        embeddings: EmbeddingsDep,
    ) -> None:
        self._ctx = ctx
        self._client = weaviate_client
        self._embeddings = embeddings

    @property
    def ctx(self) -> Context:
        """Expose context for accessing logger, db_session, etc."""
        return self._ctx

    @property
    def client(self) -> weaviate.WeaviateAsyncClient:
        """Expose Weaviate client for advanced operations."""
        return self._client

    @property
    def embeddings(self) -> BedrockEmbeddings:
        """Expose embeddings model."""
        return self._embeddings

    async def embed_text(self, text: str, collection: str) -> dict[str, Any]:
        """Embed text into Weaviate vector database with semantic vectors."""
        return await embed_text_in_weaviate(
            self._ctx, self._client, text, collection, self._embeddings
        )

    async def search(self, query: str, collection: str, limit: int = 10) -> dict[str, Any]:
        """Search for similar objects in Weaviate using vector similarity."""
        return await search_in_weaviate(
            self._ctx, self._client, query, collection, self._embeddings, limit
        )
