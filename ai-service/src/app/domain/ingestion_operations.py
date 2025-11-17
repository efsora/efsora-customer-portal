import glob
import json
import os
from typing import Any

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_core.documents import Document
from semantic_chunker.core import SemanticChunker

from app.core.context import Context


def load_documents(ctx: Context, data_dir: str) -> list[Document]:
    """Load all .txt and .pdf files from data_dir into LangChain Documents."""
    docs: list[Document] = []

    # Load .txt files
    for file_path in glob.glob(os.path.join(data_dir, "*.txt")):
        txt_loader = TextLoader(file_path, encoding="utf-8")
        docs.extend(txt_loader.load())

    # Load .pdf files
    for file_path in glob.glob(os.path.join(data_dir, "*.pdf")):
        pdf_loader = PyPDFLoader(file_path)
        docs.extend(pdf_loader.load())

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
    os.makedirs(output_dir, exist_ok=True)

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
