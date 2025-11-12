import glob
import json
import logging
import os
from typing import Any

from langchain_aws import BedrockEmbeddings
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_core.documents import Document
from semantic_chunker.core import SemanticChunker

from app.core.settings import Settings

settings = Settings()


def load_documents(data_dir: str = settings.DATA_DIR) -> list[Document]:
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

    logging.info(f" Loaded {len(docs)} raw documents from '{data_dir}'")
    return docs


def build_semantic_chunks_per_doc(
    all_docs: list[Document],
    max_tokens: int = settings.SEMANTIC_MAX_TOKENS,
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

    logging.info(f" SemanticChunker produced {len(split_docs)} merged chunks (per-doc)")
    return split_docs


def save_chunks_and_embeddings(
    split_docs: list[Document],
    embeddings: BedrockEmbeddings,
    output_dir: str = settings.OUTPUT_DIR,
    save_chunks_txt: bool = True,
    save_embeddings_json: bool = True,
) -> dict[str, Any]:
    """
    Save chunks, embeddings and metadata to disk for debugging/inspection.
    Returns metadata dict.
    """
    os.makedirs(output_dir, exist_ok=True)

    # Save chunks txt
    if save_chunks_txt:
        chunks_file = os.path.join(output_dir, "chunks.txt")
        with open(chunks_file, "w", encoding="utf-8") as f:
            for i, doc in enumerate(split_docs):
                f.write(f"--- Chunk {i} ---\n")
                f.write(doc.page_content + "\n\n")
        logging.info(f"{len(split_docs)} chunks saved to {chunks_file}")

    metadata = {
        "total_chunks": len(split_docs),
        "embedding_model": settings.EMBED_MODEL,
        "max_tokens": settings.SEMANTIC_MAX_TOKENS,
        "collection_name": settings.WEAVIATE_COLLECTION_NAME,
    }

    if save_embeddings_json:
        embedded_chunks = []
        for i, doc in enumerate(split_docs):
            emb_vector = embeddings.embed_query(doc.page_content)
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
        logging.info(f" Embeddings saved to {embeddings_file}")

    metadata_file = os.path.join(output_dir, "metadata.json")
    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    logging.info(f" Metadata saved to {metadata_file}")

    return metadata
