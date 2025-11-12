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
    embeddings: BedrockEmbeddings,
    save_chunks_txt: bool = True,
    save_embeddings_json: bool = True,
) -> list[Document]:
    """
    Build vectorstore using async Weaviate client from DI container.

    Args:
        weaviate_client: Async Weaviate client from dependency injection
        settings: Settings from dependency injection
        embeddings: Bedrock embeddings model from dependency injection
        save_chunks_txt: Whether to save chunks to disk for debugging
        save_embeddings_json: Whether to save embeddings to disk for debugging

    Returns:
        List of chunked documents that were embedded
    """
    logging.info("Starting document ingestion pipeline...")

    # Load documents
    all_docs = load_documents(settings.DATA_DIR)

    # Build semantic chunks
    split_docs = build_semantic_chunks_per_doc(
        all_docs,
        settings.SEMANTIC_MAX_TOKENS,
    )

    # Generate embeddings ONCE for all documents
    logging.info(f"Generating embeddings for {len(split_docs)} documents...")
    embedding_vectors: list[list[float]] = []
    for i, doc in enumerate(split_docs):
        embedding_vector = embeddings.embed_query(doc.page_content)
        embedding_vectors.append(embedding_vector)

        if (i + 1) % 10 == 0:
            logging.info(f"Generated embeddings for {i + 1}/{len(split_docs)} documents")

    logging.info(f"✅ Generated {len(embedding_vectors)} embeddings")

    # Save chunks and embeddings to disk for debugging (reusing pre-computed vectors)
    save_chunks_and_embeddings(
        split_docs,
        embedding_vectors,
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

    # Store embeddings in Weaviate (reusing pre-computed vectors)
    collection = weaviate_client.collections.get(settings.WEAVIATE_COLLECTION_NAME)

    logging.info(f"Inserting {len(split_docs)} documents into Weaviate...")

    # Batch insert documents with pre-computed embeddings
    for i, (doc, embedding_vector) in enumerate(zip(split_docs, embedding_vectors, strict=False)):
        # Insert with pre-computed vector
        await collection.data.insert(
            properties={
                "content": doc.page_content,
                "source": doc.metadata.get("source", "unknown"),
            },
            vector=embedding_vector,
        )

        if (i + 1) % 10 == 0:
            logging.info(f"Inserted {i + 1}/{len(split_docs)} documents")

    logging.info(f"✅ Successfully inserted {len(split_docs)} documents into Weaviate")

    return split_docs
