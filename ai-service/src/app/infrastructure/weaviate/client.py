import weaviate
from weaviate.connect import ConnectionParams

from app.core.settings import Settings


def create_weaviate_client(settings: Settings) -> weaviate.WeaviateAsyncClient:
    """Create and return an async Weaviate client instance for Docker container."""
    try:
        client = weaviate.WeaviateAsyncClient(
            connection_params=ConnectionParams.from_params(
                http_host=settings.WEAVIATE_HOST,
                http_port=settings.WEAVIATE_PORT,
                http_secure=False,
                grpc_host=settings.WEAVIATE_HOST,
                grpc_port=settings.WEAVIATE_GRPC_PORT,
                grpc_secure=False,
            )
        )
        return client
    except Exception as e:
        raise ValueError(f"Failed to create Weaviate async client: {str(e)}") from e


def create_weaviate_sync_client(settings: Settings) -> weaviate.WeaviateClient:
    """Create and return a sync Weaviate client instance for LangChain retrieval."""
    try:
        from weaviate import connect_to_local

        client = connect_to_local(
            host=settings.WEAVIATE_HOST,
            port=settings.WEAVIATE_PORT,
            grpc_port=settings.WEAVIATE_GRPC_PORT,
            headers=None,
        )
        return client
    except Exception as e:
        raise ValueError(f"Failed to create Weaviate sync client: {str(e)}") from e
