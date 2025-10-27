from typing import Any

import weaviate
from weaviate.classes.query import MetadataQuery


class WeaviateService:
    _instance: "WeaviateService | None" = None
    _initialized: bool = False

    def __new__(cls, host: str = "weaviate", port: int = 8080) -> "WeaviateService":
        """Singleton pattern to reuse client connection."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, host: str = "weaviate", port: int = 8080) -> None:
        if self._initialized:
            return

        self.host = host
        self.port = port
        try:
            self.client = weaviate.connect_to_local(
                host=host,
                port=port,
                grpc_port=50051,
            )
            self._initialized = True
        except Exception as e:
            raise ValueError(f"Failed to connect to Weaviate: {str(e)}") from e

    async def embed_text(self, text: str, collection: str) -> dict[str, Any]:
        """
        Embed text in Weaviate without using a vectorizer.
        Note: You must provide vectors manually or use a custom vectorizer.
        This example stores the text as a property.
        """
        try:
            col = self.client.collections.get(collection)

            # Create object with text property
            uuid = col.data.insert(
                properties={"text": text},
            )

            return {
                "text": text,
                "collection": collection,
                "uuid": str(uuid),
            }
        except Exception as e:
            raise ValueError(f"Failed to embed text: {str(e)}") from e

    async def search(self, query: str, collection: str, limit: int = 10) -> dict[str, Any]:
        """
        Search for similar objects in Weaviate using BM25.
        Falls back to BM25 since no vectorizer is configured.
        """
        try:
            col = self.client.collections.get(collection)

            # Use BM25 search since no vectorizer is configured
            response = col.query.bm25(
                query=query,
                limit=limit,
                return_metadata=MetadataQuery(distance=True),
            )

            results = []
            if response.objects:
                for obj in response.objects:
                    results.append(
                        {
                            "uuid": str(obj.uuid),
                            "text": obj.properties.get("text", ""),
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

    def close(self) -> None:
        """Close the Weaviate client connection."""
        if self.client:
            self.client.close()
