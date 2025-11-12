# src/app/services/rag_service.py

import logging

from langchain_aws import BedrockEmbeddings, ChatBedrockConverse
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_weaviate import WeaviateVectorStore
import weaviate

from app.core.settings import Settings
from app.domain.ingestion_operations import (
    build_semantic_chunks_per_doc,
    load_documents,
    save_chunks_and_embeddings,
)
from app.infrastructure.weaviate.collection import ensure_weaviate_collection


def create_llm_by_bedrock(
    model_name: str,
    temperature: float,
    max_tokens: int,
    region_name: str,
    settings: Settings,
) -> ChatBedrockConverse:

    return ChatBedrockConverse(
        model=model_name,
        region_name=region_name,
        temperature=temperature,
        max_tokens=max_tokens,
    )


def build_rag_chain(vectorstore: WeaviateVectorStore, settings: Settings):
    retriever = vectorstore.as_retriever(k=5)

    llm = create_llm_by_bedrock(
        settings.LLM_MODEL,
        temperature=0.3,
        max_tokens=512,
        region_name=settings.BEDROCK_REGION,
        settings=settings,
    )

    template = """
    You are a helpful assistant. Use ONLY the context below to answer the question.
    If the answer is not in the context, say you don't know. You can answer greeting and closing sentences.

    Context:
    {context}

    Question:
    {question}

    Answer in a clear and concise way.
    """

    prompt = ChatPromptTemplate.from_template(template)

    rag_chain = (
        RunnableParallel(
            context=retriever,
            question=RunnablePassthrough(),
        )
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain


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
