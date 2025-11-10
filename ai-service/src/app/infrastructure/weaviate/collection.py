from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import TextLoader, PyPDFLoader

from semantic_chunker.core import SemanticChunker

import weaviate
from weaviate.classes.config import Property, DataType, Configure
from langchain_weaviate import WeaviateVectorStore

def ensure_weaviate_collection(client: weaviate.WeaviateClient, name: str) -> None:
    """Create collection if it does not exist."""
    collections = client.collections.list_all()
    existing = list(collections.keys())

    if name not in existing:
        client.collections.create(
            name=name,
            description="Efsora document collection",
            properties=[
                Property(name="content", data_type=DataType.TEXT),
                Property(name="source", data_type=DataType.TEXT),
            ],
            vectorizer_config=Configure.Vectorizer.none(),
        )
        print(f"🆕 Created collection: {name}")
    else:
        print(f"ℹ️ Collection '{name}' already exists.")
