import weaviate

from app.core.settings import Settings


def create_weaviate_client(settings: Settings) -> weaviate.WeaviateClient:
    """Create and return a Weaviate client instance."""
    try:
        client = weaviate.connect_to_local(
            host=settings.WEAVIATE_HOST,
            port=settings.WEAVIATE_PORT,
            grpc_port=settings.WEAVIATE_GRPC_PORT,
        )
        return client
    except Exception as e:
        raise ValueError(f"Failed to connect to Weaviate: {str(e)}") from e
