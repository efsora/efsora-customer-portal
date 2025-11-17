from typing import TypeAlias

from dependency_injector import containers, providers
from langchain_aws import BedrockEmbeddings, ChatBedrockConverse
from langchain_core.runnables import RunnableSerializable
from langchain_weaviate import WeaviateVectorStore
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker
import weaviate

from app.core.context import Context
from app.core.settings import Settings, get_settings
from app.infrastructure.db.engine import create_engine
from app.infrastructure.weaviate.client import (
    create_weaviate_client,
    create_weaviate_sync_client,
)

AsyncSessionMaker: TypeAlias = async_sessionmaker[AsyncSession]


def create_embeddings(settings: Settings) -> BedrockEmbeddings:
    """Create Bedrock embeddings model instance."""
    kwargs = {
        "model_id": settings.EMBED_MODEL,
        "region_name": settings.BEDROCK_REGION,
    }

    # Add credentials if provided in settings
    if settings.AWS_ACCESS_KEY_ID:
        kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
    if settings.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY

    return BedrockEmbeddings(**kwargs)  # type: ignore[arg-type]


def create_bedrock_llm(settings: Settings) -> ChatBedrockConverse:
    """Create Bedrock LLM instance for chat."""
    kwargs = {
        "model_id": settings.LLM_MODEL,
        "region_name": settings.BEDROCK_REGION,
        "temperature": 0.3,
        "max_tokens": 512,
    }

    # Add credentials if provided in settings
    if settings.AWS_ACCESS_KEY_ID:
        kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
    if settings.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY

    return ChatBedrockConverse(**kwargs)  # type: ignore[arg-type]


def create_vectorstore(
    weaviate_sync_client: weaviate.WeaviateClient,
    embeddings: BedrockEmbeddings,
    settings: Settings,
) -> WeaviateVectorStore:
    """Create WeaviateVectorStore for document retrieval."""
    return WeaviateVectorStore(
        client=weaviate_sync_client,
        index_name=settings.WEAVIATE_COLLECTION_NAME,
        text_key="content",
        embedding=embeddings,
    )


def create_rag_chain(
    vectorstore: WeaviateVectorStore,
    bedrock_llm: ChatBedrockConverse,
) -> RunnableSerializable[dict[str, str], str]:
    """Create RAG chain from vectorstore and LLM."""
    from app.services.rag_service import build_rag_chain

    return build_rag_chain(vectorstore, bedrock_llm)


class Container(containers.DeclarativeContainer):
    settings: providers.Singleton[Settings] = providers.Singleton(get_settings)

    # --- DB ---
    engine: providers.Singleton[AsyncEngine] = providers.Singleton(
        create_engine,
        settings=settings,
    )
    session_factory: providers.Singleton[AsyncSessionMaker] = providers.Singleton(
        async_sessionmaker,
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    # --- Context factory (session provided per request) ---
    context: providers.Factory[Context] = providers.Factory(
        Context,
        session_factory=session_factory,
    )

    # --- Weaviate ---
    weaviate_async_client: providers.Singleton[weaviate.WeaviateAsyncClient] = providers.Singleton(
        create_weaviate_client,
        settings=settings,
    )
    weaviate_sync_client: providers.Singleton[weaviate.WeaviateClient] = providers.Singleton(
        create_weaviate_sync_client,
        settings=settings,
    )

    # --- Embeddings & LLM ---
    embeddings: providers.Singleton[BedrockEmbeddings] = providers.Singleton(
        create_embeddings,
        settings=settings,
    )
    bedrock_llm: providers.Singleton[ChatBedrockConverse] = providers.Singleton(
        create_bedrock_llm,
        settings=settings,
    )

    # --- RAG Components ---
    vectorstore: providers.Singleton[WeaviateVectorStore] = providers.Singleton(
        create_vectorstore,
        weaviate_sync_client=weaviate_sync_client,
        embeddings=embeddings,
        settings=settings,
    )
    rag_chain: providers.Singleton[RunnableSerializable[dict[str, str], str]] = providers.Singleton(
        create_rag_chain,
        vectorstore=vectorstore,
        bedrock_llm=bedrock_llm,
    )
