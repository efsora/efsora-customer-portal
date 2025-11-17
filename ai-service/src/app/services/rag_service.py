# src/app/services/rag_service.py

from langchain_aws import BedrockEmbeddings, ChatBedrockConverse
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnableParallel, RunnableSerializable
from langchain_weaviate import WeaviateVectorStore
import weaviate

from app.core.context import Context
from app.core.settings import Settings
from app.domain.ingestion_operations import (
    build_semantic_chunks_per_doc,
    load_documents,
    save_chunks_and_embeddings,
)
from app.infrastructure.weaviate.collection import ensure_weaviate_collection

# Configuration constants
RETRIEVER_K = 5  # Number of documents to retrieve


def format_documents(docs: list[Document]) -> str:
    """Format retrieved documents for prompt context."""
    return "\n\n".join(doc.page_content for doc in docs)


def build_rag_chain(
    vectorstore: WeaviateVectorStore,
    llm: ChatBedrockConverse,
) -> RunnableSerializable[dict[str, str], str]:
    """
    Build RAG chain with document retrieval and LLM generation.

    Args:
        vectorstore: Weaviate vector store for retrieval
        llm: Bedrock LLM for generation

    Returns:
        Runnable chain that accepts question and history
    """
    # Create retriever with proper search_kwargs
    retriever = vectorstore.as_retriever(search_kwargs={"k": RETRIEVER_K})

    # Simple prompt template with basic history support
    template = """You are a helpful assistant. Use the retrieved context to answer the question.
If the answer is not in the context, say you don't know. You can acknowledge greetings naturally.

Conversation history:
{history}

Retrieved context:
{context}

Current question:
{question}

Answer in a clear and concise way."""

    prompt = ChatPromptTemplate.from_template(template)

    # Input extractors
    question_input = RunnableLambda(lambda x: x["question"])
    history_input = RunnableLambda(lambda x: x.get("history", ""))

    # Build RAG chain with document formatting
    rag_chain = (
        RunnableParallel(
            context=question_input | retriever | RunnableLambda(format_documents),
            question=question_input,
            history=history_input,
        )
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain


async def build_vectorstore(
    ctx: Context,
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
    ctx.logger.info("Starting document ingestion pipeline...")

    # Load documents
    all_docs = load_documents(ctx, settings.DATA_DIR)

    # Build semantic chunks
    split_docs = build_semantic_chunks_per_doc(
        ctx,
        all_docs,
        settings.SEMANTIC_MAX_TOKENS,
    )

    # Generate embeddings ONCE for all documents
    ctx.logger.info(f"Generating embeddings for {len(split_docs)} documents...")
    embedding_vectors: list[list[float]] = []
    for i, doc in enumerate(split_docs):
        embedding_vector = embeddings.embed_query(doc.page_content)
        embedding_vectors.append(embedding_vector)

        if (i + 1) % 10 == 0:
            ctx.logger.info(f"Generated embeddings for {i + 1}/{len(split_docs)} documents")

    ctx.logger.info(f"✅ Generated {len(embedding_vectors)} embeddings")

    # Save chunks and embeddings to disk for debugging (reusing pre-computed vectors)
    save_chunks_and_embeddings(  # write file to outputs.
        ctx,
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
        ctx,
        weaviate_client,
        settings.WEAVIATE_COLLECTION_NAME,
    )

    # Store embeddings in Weaviate (reusing pre-computed vectors)
    collection = weaviate_client.collections.get(settings.WEAVIATE_COLLECTION_NAME)

    ctx.logger.info(f"Inserting {len(split_docs)} documents into Weaviate...")

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
            ctx.logger.info(f"Inserted {i + 1}/{len(split_docs)} documents")

    ctx.logger.info(f"✅ Successfully inserted {len(split_docs)} documents into Weaviate")

    return split_docs
