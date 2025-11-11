import logging

from langchain_weaviate import WeaviateVectorStore

from app.services.rag_service import build_vectorstore

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def embed_documents() -> WeaviateVectorStore:
    """
    Embeds documents and saves them into the vector database.
    Returns the vectorstore instance for later use (no CLI / RAG loop).
    """

    """
    Full pipeline:
      1) Load and preprocess documents
      2) Semantic chunking
      3) Generate embeddings
      4) Store embeddings in Weaviate (or other vector DB)
    """

    vectorstore, client = build_vectorstore()

    logging.info(" Documents embedded successfully.")
    logging.info(f"   Vectorstore type: {type(vectorstore).__name__}")
    logging.info(f"   Client: {client.__class__.__name__ if client else 'None'}")

    try:
        # Close Weaviate client connection before production deployment
        client.close()
        logging.info("Weaviate client connection closed.")
    except Exception:
        logging.info(" Could not close Weaviate client cleanly.")

    return vectorstore


if __name__ == "__main__":
    store = embed_documents()
    logging.info("Vectorstore ready to use for RAG or testing.")
