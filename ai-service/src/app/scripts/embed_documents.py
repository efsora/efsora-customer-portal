"""
Document embedding entry point using dependency injection.

This script uses the DI container to get async Weaviate client and settings,
ensuring consistency with the FastAPI application.
"""

import asyncio
import logging

from app.dependency_injection.container import Container
from app.services.rag_service import build_vectorstore

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


async def embed_documents() -> None:
    """
    Embeds documents and saves them into the vector database using DI container.

    Full pipeline:
      1) Load and preprocess documents
      2) Semantic chunking
      3) Generate embeddings
      4) Store embeddings in Weaviate (Docker container)
    """
    # Initialize DI container
    container = Container()

    # Get dependencies from container
    settings = container.settings()
    weaviate_client = container.weaviate_async_client()
    embeddings = container.embeddings()

    try:
        # Connect to Weaviate
        await weaviate_client.connect()
        logging.info("✅ Connected to Weaviate")

        # Run the embedding pipeline
        split_docs = await build_vectorstore(
            weaviate_client=weaviate_client,
            settings=settings,
            embeddings=embeddings,
            save_chunks_txt=True,
            save_embeddings_json=True,
        )

        logging.info(f"✅ Successfully processed {len(split_docs)} document chunks")

    except Exception as e:
        logging.error(f"❌ Error during document embedding: {str(e)}")
        raise
    finally:
        # Close Weaviate client connection
        try:
            await weaviate_client.close()
            logging.info("✅ Weaviate client connection closed")
        except Exception as e:
            logging.warning(f"⚠️ Could not close Weaviate client cleanly: {str(e)}")


if __name__ == "__main__":
    asyncio.run(embed_documents())
    logging.info("🎉 Document embedding complete!")
