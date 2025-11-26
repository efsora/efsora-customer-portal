import glob
import json
import os
from pathlib import Path
from typing import Any

from langchain_aws import ChatBedrock
from langchain_core.documents import Document
from semantic_chunker.core import SemanticChunker

from app.core.context import Context
from app.core.settings import Settings
from app.domain.extract_images import (
    build_bedrock_vision_client,
    build_image_docs_from_pdf_with_ai,
    resolve_image_output_dir,
)
from app.domain.extract_table import extract_tables_and_text_in_order


def _ensure_output_dir(path: str) -> str:
    """Create output dir if missing; return normalized string path."""
    output_dir = Path(path)
    output_dir.mkdir(parents=True, exist_ok=True)
    return str(output_dir)


def ingest_pdf(
    pdf_path: str,
    output_dir: str | Path | None = None,
    llm: ChatBedrock | None = None,
) -> list[Document]:
    """Extract tables + AI-image captions for a PDF; returns Documents ready for RAG."""
    if llm is None:
        llm = build_bedrock_vision_client()

    base_output = resolve_image_output_dir(output_dir)

    docs: list[Document] = []

    ordered_docs = extract_tables_and_text_in_order(
        pdf_path,
        llm=llm,
        reconstruct_with_llm=True,
    )
    docs.extend(ordered_docs)

    image_docs = build_image_docs_from_pdf_with_ai(
        pdf_path=pdf_path,
        image_output_dir=base_output,
        llm=llm,
    )
    docs.extend(image_docs)

    return docs


def load_documents(
    ctx: Context,
    data_dir: str,
    settings: Settings | None = None,
    vision_llm: ChatBedrock | None = None,
) -> list[Document]:
    """Load PDFs and enrich them with ordered table/text docs plus AI image captions."""
    docs: list[Document] = []

    for file_path in glob.glob(os.path.join(data_dir, "*.pdf")):
        try:
            enriched_docs = ingest_pdf(
                pdf_path=file_path,
                output_dir=settings.OUTPUT_DIR if settings else None,
                llm=vision_llm,
            )
            docs.extend(enriched_docs)
            ctx.logger.info(
                f"Enriched '{file_path}' with {len(enriched_docs)} table/text/image documents"
            )
        except Exception as exc:
            ctx.logger.error(f"Failed to load/enrich '{file_path}': {exc}")

    ctx.logger.info(f" Loaded {len(docs)} raw documents from '{data_dir}'")
    return docs


def build_semantic_chunks_per_doc(
    ctx: Context,
    all_docs: list[Document],
    max_tokens: int,
) -> list[Document]:
    """
    Use SemanticChunker (advanced-chunker) to merge/split docs semantically
    and return a new list of LangChain Documents.
    """
    # 1) Convert to primitive format for SemanticChunker
    """
      Chunk each document separately with SemanticChunker.
      This prevents chunks from different files being merged together
      and keeps 'source' metadata clean.
      """
    chunker = SemanticChunker(max_tokens=max_tokens)
    split_docs: list[Document] = []

    for doc in all_docs:
        # Advanced-chunker expects a list of {text, metadata}
        primitive = [
            {
                "text": doc.page_content,
                "metadata": doc.metadata if hasattr(doc, "metadata") else {},
            }
        ]

        merged_chunks = chunker.chunk(primitive)

        for merged in merged_chunks:
            # Here we FORCE the source to be this doc's source
            src = doc.metadata.get("source", "unknown") if hasattr(doc, "metadata") else "unknown"
            split_docs.append(Document(page_content=merged["text"], metadata={"source": src}))

    ctx.logger.info(f" SemanticChunker produced {len(split_docs)} merged chunks (per-doc)")
    return split_docs


def save_chunks_and_embeddings(
    ctx: Context,
    split_docs: list[Document],
    embedding_vectors: list[list[float]],
    output_dir: str,
    collection_name: str,
    embed_model: str,
    max_tokens: int,
    save_chunks_txt: bool = True,
    save_embeddings_json: bool = True,
) -> dict[str, Any]:
    """
    Save chunks, embeddings and metadata to disk for debugging/inspection.

    Args:
        split_docs: List of chunked documents
        embedding_vectors: Pre-computed embedding vectors (one per document)
        output_dir: Directory to save outputs
        collection_name: Name of the Weaviate collection
        embed_model: Model ID used for embeddings
        max_tokens: Max tokens per chunk
        save_chunks_txt: Whether to save chunks text file
        save_embeddings_json: Whether to save embeddings JSON file

    Returns:
        Metadata dictionary
    """
    output_dir = _ensure_output_dir(output_dir)

    # Save chunks txt
    if save_chunks_txt:
        chunks_file = os.path.join(output_dir, "chunks.txt")
        with open(chunks_file, "w", encoding="utf-8") as f:
            for i, doc in enumerate(split_docs):
                f.write(f"--- Chunk {i} ---\n")
                f.write(doc.page_content + "\n\n")
        ctx.logger.info(f"{len(split_docs)} chunks saved to {chunks_file}")

    metadata = {
        "total_chunks": len(split_docs),
        "embedding_model": embed_model,
        "max_tokens": max_tokens,
        "collection_name": collection_name,
    }

    if save_embeddings_json:
        embedded_chunks = []
        for i, (doc, emb_vector) in enumerate(zip(split_docs, embedding_vectors, strict=False)):
            embedded_chunks.append(
                {
                    "doc_name": f"merged_chunk_{i}",
                    "chunk_index": i,
                    "text": doc.page_content,
                    "embedding": emb_vector,
                }
            )

        embeddings_file = os.path.join(output_dir, "embeddings.json")
        with open(embeddings_file, "w", encoding="utf-8") as f:
            json.dump(embedded_chunks, f, indent=2, ensure_ascii=False)
        ctx.logger.info(f" Embeddings saved to {embeddings_file}")

    metadata_file = os.path.join(output_dir, "metadata.json")
    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    ctx.logger.info(f" Metadata saved to {metadata_file}")

    return metadata


def save_raw_documents(
    ctx: Context,
    docs: list[Document],
    output_dir: str,
    filename: str = "raw_docs.txt",
) -> str:
    """Save documents before chunking for debugging/inspection."""
    output_dir = _ensure_output_dir(output_dir)
    path = os.path.join(output_dir, filename)

    with open(path, "w", encoding="utf-8") as f:
        for i, doc in enumerate(docs):
            f.write(f"--- Raw Document {i} ---\n")
            f.write(f"metadata: {json.dumps(doc.metadata, ensure_ascii=False)}\n")
            f.write(doc.page_content + "\n\n")

    ctx.logger.info(f" Saved {len(docs)} raw documents to {path}")
    return path
