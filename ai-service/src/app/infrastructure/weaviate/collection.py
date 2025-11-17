import weaviate
from weaviate.classes.config import Configure, DataType, Property, VectorDistances

from app.core.context import Context


async def ensure_weaviate_collection(
    ctx: Context, client: weaviate.WeaviateAsyncClient, name: str
) -> None:
    """Create collection if it does not exist (async)."""
    collections = await client.collections.list_all()
    existing = list(collections.keys())

    if name not in existing:
        await client.collections.create(
            name=name,
            description="Efsora document collection with vector embeddings",
            properties=[
                Property(name="content", data_type=DataType.TEXT),
                Property(name="source", data_type=DataType.TEXT),
            ],
            vectorizer_config=Configure.Vectorizer.none(),
            vector_index_config=Configure.VectorIndex.hnsw(distance_metric=VectorDistances.COSINE),
        )
        ctx.logger.info(f"🆕 Created collection: {name}")
    else:
        ctx.logger.info(f"ℹ️ Collection '{name}' already exists.")
