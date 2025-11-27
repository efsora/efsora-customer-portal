"""
Document Embedding Service.

Handles the complete document embedding pipeline with progress streaming.
Downloads document from S3, chunks it, generates embeddings, and stores in Weaviate.
"""

from collections.abc import AsyncGenerator
import os
from pathlib import Path
import uuid

from langchain_aws import BedrockEmbeddings
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_core.documents import Document
from semantic_chunker.core import SemanticChunker
import weaviate

from app.api.schemas.response import EmbedDocumentProgressEvent, EmbedDocumentStage
from app.core.context import Context
from app.core.settings import Settings
from app.infrastructure.s3.client import download_file_from_s3
from app.infrastructure.weaviate.collection import ensure_weaviate_collection


def load_single_document(file_path: Path) -> list[Document]:
    """Load a single document file (.txt or .pdf) into LangChain Documents."""
    docs: list[Document] = []
    suffix = file_path.suffix.lower()

    if suffix == ".txt":
        txt_loader = TextLoader(str(file_path), encoding="utf-8")
        docs.extend(txt_loader.load())
    elif suffix == ".pdf":
        pdf_loader = PyPDFLoader(str(file_path))
        docs.extend(pdf_loader.load())
    else:
        raise ValueError(f"Unsupported file type: {suffix}. Only .txt and .pdf are supported.")

    return docs


def chunk_document(
    docs: list[Document],
    max_tokens: int,
    source_name: str,
) -> list[Document]:
    """Chunk documents using semantic chunker."""
    chunker = SemanticChunker(max_tokens=max_tokens)
    split_docs: list[Document] = []

    for doc in docs:
        primitive = [
            {
                "text": doc.page_content,
                "metadata": doc.metadata if hasattr(doc, "metadata") else {},
            }
        ]

        merged_chunks = chunker.chunk(primitive)

        for merged in merged_chunks:
            split_docs.append(
                Document(
                    page_content=merged["text"],
                    metadata={"source": source_name},
                )
            )

    return split_docs


async def embed_document_with_progress(
    ctx: Context,
    settings: Settings,
    weaviate_client: weaviate.WeaviateAsyncClient,
    embeddings: BedrockEmbeddings,
    s3_key: str,
    collection_name: str | None,
    project_id: int,
) -> AsyncGenerator[EmbedDocumentProgressEvent, None]:
    """
    Embed a document from S3 with streaming progress updates.

    Args:
        ctx: Application context
        settings: Application settings
        weaviate_client: Async Weaviate client
        embeddings: BedrockEmbeddings instance
        s3_key: S3 object key of the document
        collection_name: Weaviate collection name (or None for default)
        project_id: Project ID for metadata

    Yields:
        EmbedDocumentProgressEvent for each stage of processing
    """
    # Use default collection if not provided
    target_collection = collection_name or settings.WEAVIATE_COLLECTION_NAME
    document_id = str(uuid.uuid4())
    temp_file_path: Path | None = None

    try:
        # Stage 1: Downloading (0-10%)
        yield EmbedDocumentProgressEvent(
            stage=EmbedDocumentStage.DOWNLOADING,
            progress_percent=0,
            message="Downloading document from S3...",
        )

        temp_file_path = await download_file_from_s3(ctx, settings, s3_key)

        yield EmbedDocumentProgressEvent(
            stage=EmbedDocumentStage.DOWNLOADING,
            progress_percent=10,
            message="Document downloaded successfully",
        )

        # Stage 2: Loading (10-20%)
        yield EmbedDocumentProgressEvent(
            stage=EmbedDocumentStage.LOADING,
            progress_percent=10,
            message="Loading and parsing document...",
        )

        docs = load_single_document(temp_file_path)
        source_name = Path(s3_key).name

        ctx.logger.info(
            f"Loaded {len(docs)} pages/sections from document",
            s3_key=s3_key,
            doc_count=len(docs),
        )

        yield EmbedDocumentProgressEvent(
            stage=EmbedDocumentStage.LOADING,
            progress_percent=20,
            message=f"Loaded {len(docs)} pages/sections",
        )

        # Stage 3: Chunking (20-30%)
        yield EmbedDocumentProgressEvent(
            stage=EmbedDocumentStage.CHUNKING,
            progress_percent=20,
            message="Splitting document into semantic chunks...",
        )

        split_docs = chunk_document(docs, settings.SEMANTIC_MAX_TOKENS, source_name)
        total_chunks = len(split_docs)

        ctx.logger.info(
            f"Created {total_chunks} chunks from document",
            s3_key=s3_key,
            total_chunks=total_chunks,
        )

        yield EmbedDocumentProgressEvent(
            stage=EmbedDocumentStage.CHUNKING,
            progress_percent=30,
            message=f"Created {total_chunks} chunks",
            total_chunks=total_chunks,
        )

        # Stage 4: Embedding (30-90%)
        yield EmbedDocumentProgressEvent(
            stage=EmbedDocumentStage.EMBEDDING,
            progress_percent=30,
            message="Generating embeddings...",
            total_chunks=total_chunks,
        )

        embedding_vectors: list[list[float]] = []
        for i, doc in enumerate(split_docs):
            embedding_vector = embeddings.embed_query(doc.page_content)
            embedding_vectors.append(embedding_vector)

            # Calculate progress within embedding stage (30-90%)
            embedding_progress = 30 + int((i + 1) / total_chunks * 60)

            # Yield progress every few chunks or on the last one
            if (i + 1) % 5 == 0 or i == total_chunks - 1:
                yield EmbedDocumentProgressEvent(
                    stage=EmbedDocumentStage.EMBEDDING,
                    progress_percent=embedding_progress,
                    message=f"Generated embeddings for {i + 1}/{total_chunks} chunks",
                    chunks_processed=i + 1,
                    total_chunks=total_chunks,
                )

        ctx.logger.info(
            f"Generated {len(embedding_vectors)} embeddings",
            s3_key=s3_key,
            embedding_count=len(embedding_vectors),
        )

        # Stage 5: Storing (90-100%)
        yield EmbedDocumentProgressEvent(
            stage=EmbedDocumentStage.STORING,
            progress_percent=90,
            message="Storing embeddings in vector database...",
            chunks_processed=total_chunks,
            total_chunks=total_chunks,
        )

        # Ensure collection exists
        await ensure_weaviate_collection(ctx, weaviate_client, target_collection)

        # Get collection and insert documents
        collection = weaviate_client.collections.get(target_collection)

        for doc, embedding_vector in zip(split_docs, embedding_vectors, strict=False):
            await collection.data.insert(
                properties={
                    "content": doc.page_content,
                    "source": doc.metadata.get("source", s3_key),
                },
                vector=embedding_vector,
            )

        ctx.logger.info(
            f"Successfully stored {total_chunks} chunks in Weaviate",
            s3_key=s3_key,
            collection=target_collection,
            total_chunks=total_chunks,
        )

        # Stage 6: Completed (100%)
        yield EmbedDocumentProgressEvent(
            stage=EmbedDocumentStage.COMPLETED,
            progress_percent=100,
            message="Document embedded successfully",
            chunks_processed=total_chunks,
            total_chunks=total_chunks,
            document_id=document_id,
        )

    except Exception as e:
        ctx.logger.error(
            f"Error embedding document: {s3_key}",
            s3_key=s3_key,
            error=str(e),
        )

        # Determine error code based on exception type
        error_code = "EMBED_ERROR"
        if "S3" in str(e) or "download" in str(e).lower():
            error_code = "S3_DOWNLOAD_ERROR"
        elif "Unsupported file type" in str(e):
            error_code = "UNSUPPORTED_FILE_TYPE"
        elif "weaviate" in str(e).lower():
            error_code = "WEAVIATE_ERROR"

        yield EmbedDocumentProgressEvent(
            stage=EmbedDocumentStage.ERROR,
            progress_percent=0,
            message=str(e),
            error_code=error_code,
        )

    finally:
        # Clean up temporary file
        if temp_file_path and temp_file_path.exists():
            try:
                os.unlink(temp_file_path)
                ctx.logger.debug(f"Cleaned up temp file: {temp_file_path}")
            except Exception as cleanup_error:
                ctx.logger.warning(
                    f"Failed to clean up temp file: {temp_file_path}",
                    error=str(cleanup_error),
                )
