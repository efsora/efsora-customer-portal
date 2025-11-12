from typing import Any

from langchain_aws import BedrockEmbeddings
import weaviate
from weaviate.classes.query import MetadataQuery


async def embed_text_in_weaviate(
    client: weaviate.WeaviateAsyncClient,
    text: str,
    collection: str,
    embeddings: BedrockEmbeddings,
    source: str = "api",
) -> dict[str, Any]:
    """
    Embed text in Weaviate with vector embeddings.

    Args:
        client: Async Weaviate client
        text: Text to embed
        collection: Collection name
        embeddings: Bedrock embeddings model for generating vectors
        source: Source identifier for the document

    Returns:
        Dictionary with embedded text metadata
    """
    try:
        col = client.collections.get(collection)

        # Generate embedding vector
        embedding_vector = embeddings.embed_query(text)

        # Create object with content and source properties (matching schema)
        uuid = await col.data.insert(
            properties={"content": text, "source": source},
            vector=embedding_vector,
        )

        return {
            "text": text,
            "collection": collection,
            "uuid": str(uuid),
            "source": source,
        }
    except Exception as e:
        raise ValueError(f"Failed to embed text: {str(e)}") from e


async def search_in_weaviate(
    client: weaviate.WeaviateAsyncClient,
    query: str,
    collection: str,
    embeddings: BedrockEmbeddings,
    limit: int = 10,
) -> dict[str, Any]:
    """
    Search for similar objects in Weaviate using vector similarity.

    Args:
        client: Async Weaviate client
        query: Search query text
        collection: Collection name
        embeddings: Bedrock embeddings model for generating query vector
        limit: Maximum number of results

    Returns:
        Dictionary with search results
    """
    try:
        col = client.collections.get(collection)

        # Generate query embedding vector
        query_vector = embeddings.embed_query(query)

        # Use vector similarity search
        response = await col.query.near_vector(
            near_vector=query_vector,
            limit=limit,
            return_metadata=MetadataQuery(distance=True),
        )

        results = []
        if response.objects:
            for obj in response.objects:
                results.append(
                    {
                        "uuid": str(obj.uuid),
                        "text": obj.properties.get("content", ""),
                        "source": obj.properties.get("source", ""),
                        "distance": obj.metadata.distance,
                        "properties": obj.properties,
                    }
                )

        return {
            "query": query,
            "collection": collection,
            "results": results,
            "count": len(results),
        }
    except Exception as e:
        raise ValueError(f"Failed to search: {str(e)}") from e
