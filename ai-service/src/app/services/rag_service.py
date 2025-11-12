# src/app/services/rag_service.py

import logging

from langchain_aws import BedrockEmbeddings
from langchain_core.documents import Document
import weaviate

from app.core.settings import Settings
from app.domain.ingestion_operations import (
    build_semantic_chunks_per_doc,
    load_documents,
    save_chunks_and_embeddings,
)
from app.infrastructure.weaviate.collection import ensure_weaviate_collection


async def build_vectorstore(
    weaviate_client: weaviate.WeaviateAsyncClient,
    settings: Settings,
    save_chunks_txt: bool = True,
    save_embeddings_json: bool = True,
) -> list[Document]:
    """
    Build vectorstore using async Weaviate client from DI container.

    Args:
        weaviate_client: Async Weaviate client from dependency injection
        settings: Settings from dependency injection
        save_chunks_txt: Whether to save chunks to disk for debugging
        save_embeddings_json: Whether to save embeddings to disk for debugging

    Returns:
        List of chunked documents that were embedded
    """
    logging.info("Starting document ingestion pipeline...")

    # Load documents
    all_docs = load_documents(settings.DATA_DIR)

    # Create embeddings model
    embeddings = BedrockEmbeddings(
        model_id=settings.EMBED_MODEL,
        region_name=settings.BEDROCK_REGION,
    )

    # Build semantic chunks
    split_docs = build_semantic_chunks_per_doc(
        all_docs,
        settings.SEMANTIC_MAX_TOKENS,
    )

    # Save chunks and embeddings to disk for debugging
    save_chunks_and_embeddings(
        split_docs,
        embeddings,
        settings.OUTPUT_DIR,
        settings.WEAVIATE_COLLECTION_NAME,
        settings.EMBED_MODEL,
        settings.SEMANTIC_MAX_TOKENS,
        save_chunks_txt,
        save_embeddings_json,
    )

    # Ensure collection exists
    await ensure_weaviate_collection(
        weaviate_client,
        settings.WEAVIATE_COLLECTION_NAME,
    )

    # Store embeddings in Weaviate
    collection = weaviate_client.collections.get(settings.WEAVIATE_COLLECTION_NAME)

    logging.info(f"Embedding {len(split_docs)} documents into Weaviate...")

    # Batch insert documents with embeddings
    for i, doc in enumerate(split_docs):
        # Generate embedding vector
        embedding_vector = embeddings.embed_query(doc.page_content)

        # Insert with vector
        await collection.data.insert(
            properties={
                "content": doc.page_content,
                "source": doc.metadata.get("source", "unknown"),
            },
            vector=embedding_vector,
        )

        if (i + 1) % 10 == 0:
            logging.info(f"Embedded {i + 1}/{len(split_docs)} documents")

    logging.info(f"✅ Successfully embedded {len(split_docs)} documents into Weaviate")

    return split_docs
