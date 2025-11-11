from app.services.rag_service import build_vectorstore

def embed_documents():
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

    # 🔹 Build and return vectorstore only
    vectorstore, client = build_vectorstore()

    # Optionally, verify a sample entry
    print(" Documents embedded successfully.")
    print(f"   Vectorstore type: {type(vectorstore).__name__}")
    print(f"   Client: {client.__class__.__name__ if client else 'None'}")

    try:
        client.close()
        print("Weaviate client connection closed.")
    except Exception:
        print(" Could not close Weaviate client cleanly.")

    return vectorstore


if __name__ == "__main__":
    store = embed_documents()
    print("Vectorstore ready to use for RAG or testing.")
