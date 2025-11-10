# src/app/services/rag_service.py

from typing import Tuple
from langchain_weaviate import WeaviateVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from app.core.settings import Settings
from app.domain.ingestion_operations import *
from app.infrastructure.weaviate.client import create_embedded_weaviate_client
from app.infrastructure.weaviate.collection import ensure_weaviate_collection
import weaviate
from weaviate.classes.config import Property, DataType, Configure
from langchain_weaviate import WeaviateVectorStore
from langchain_aws import BedrockEmbeddings
from langchain_aws import ChatBedrockConverse


settings = Settings()

def build_vectorstore(
    save_chunks_txt: bool = True,
    save_embeddings_json: bool = True,
) -> Tuple[WeaviateVectorStore, weaviate.WeaviateClient]:

    all_docs = load_documents(settings.DATA_DIR)

    embeddings = BedrockEmbeddings(
        model_id=settings.EMBED_MODEL,
        region_name="us-east-1",
    )

    split_docs = build_semantic_chunks_per_doc(
        all_docs,
        settings.SEMANTIC_MAX_TOKENS,
    )

    save_chunks_and_embeddings(
        split_docs,
        embeddings,
        settings.OUTPUT_DIR,
        save_chunks_txt,
        save_embeddings_json,
    )

    client = create_embedded_weaviate_client(settings)

    ensure_weaviate_collection(
        client,
        settings.WEAVIATE_COLLECTION_NAME,
    )

    vectorstore = WeaviateVectorStore.from_documents(
        split_docs,
        embeddings,
        client=client,
        index_name=settings.WEAVIATE_COLLECTION_NAME,
        text_key="content",
    )

    return vectorstore, client
