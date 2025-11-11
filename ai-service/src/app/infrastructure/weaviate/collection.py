import logging

import weaviate
from weaviate.classes.config import Configure, DataType, Property


def ensure_weaviate_collection(client: weaviate.WeaviateClient, name: str) -> None:
    """Create collection if it does not exist."""
    collections = client.collections.list_all()
    existing = list(collections.keys())

    if name not in existing:
        client.collections.create(
            name=name,
            description="Efsora document collection",
            properties=[
                Property(name="content", data_type=DataType.TEXT),
                Property(name="source", data_type=DataType.TEXT),
            ],
            vectorizer_config=Configure.Vectorizer.none(),
        )
        logging.info(f"🆕 Created collection: {name}")
    else:
        logging.info(f"ℹ️ Collection '{name}' already exists.")
