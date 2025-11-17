"""
Pytest fixtures for Ragas-based RAG evaluation tests.

This module provides fixtures for:
- AWS Bedrock Claude LLM and embedding models for semantic evaluation
- Ragas traditional (non-LLM) metric calculators
- Real RAG system integration via FastAPI test client
"""

import os
from typing import Any
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from fastapi import FastAPI
from ragas import EvaluationDataset
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper


# ============================================================================
# AWS BEDROCK FIXTURES (for semantic/LLM-based evaluation)
# ============================================================================

@pytest.fixture(scope="session")
def aws_credentials() -> tuple[str, str, str]:
    """
    Get AWS credentials from environment.

    Returns:
        Tuple of (access_key_id, secret_access_key, region)

    Raises:
        pytest.skip: If AWS credentials are not set
    """
    access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
    secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    region = os.getenv("AWS_REGION")

    if not access_key_id or not secret_access_key:
        pytest.skip(
            "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY not set, "
            "skipping semantic Ragas tests"
        )
    return access_key_id, secret_access_key, region


@pytest.fixture(scope="session")
def ragas_llm(aws_credentials: tuple[str, str, str]) -> LangchainLLMWrapper:
    """
    Create AWS Bedrock Claude LLM wrapper for Ragas evaluation.

    Uses Claude Sonnet 4 via AWS Bedrock for accurate semantic evaluation.
    Temperature set to 0 for deterministic evaluation.
    """
    from langchain_aws import ChatBedrockConverse

    access_key_id, secret_access_key, region = aws_credentials

    llm = ChatBedrockConverse(
        model="anthropic.claude-sonnet-4-20250514-v1:0",
        temperature=0,
        max_tokens=4096,
        region_name=region,
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
    )
    return LangchainLLMWrapper(llm)


@pytest.fixture(scope="session")
def ragas_embeddings() -> LangchainEmbeddingsWrapper:
    """
    Create embeddings wrapper for Ragas evaluation.

    Uses sentence-transformers (local, free) for semantic similarity.
    No AWS credentials required for this fixture.
    """
    from langchain_community.embeddings import HuggingFaceEmbeddings

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    return LangchainEmbeddingsWrapper(embeddings)


# ============================================================================
# TRADITIONAL METRICS FIXTURES (Ragas non-LLM metrics - fast and free)
# ============================================================================

@pytest.fixture
def exact_match_scorer() -> Any:
    """
    Ragas Exact Match metric (non-LLM).

    Checks if response exactly matches reference text.
    Returns: 1.0 (match) or 0.0 (no match)
    """
    from ragas.metrics import ExactMatch

    return ExactMatch()


@pytest.fixture
def bleu_scorer() -> Any:
    """
    Ragas BLEU Score metric (non-LLM).

    Measures n-gram precision between response and reference.
    Range: 0.0 to 1.0 (higher is better)
    """
    from ragas.metrics import BleuScore

    return BleuScore()


@pytest.fixture
def rouge_scorer() -> Any:
    """
    Ragas ROUGE Score metric (non-LLM).

    Measures recall-oriented overlap between response and reference.
    Default: ROUGE-L with F-measure
    Range: 0.0 to 1.0 (higher is better)
    """
    from ragas.metrics import RougeScore

    # Using ROUGE-L with F-measure (balanced precision and recall)
    return RougeScore(rouge_type="rougeL", mode="fmeasure")


@pytest.fixture
def string_similarity_scorer() -> Any:
    """
    Ragas Non-LLM String Similarity metric.

    Measures similarity using Levenshtein distance algorithm.
    Range: 0.0 to 1.0 (higher is better, 1.0 = identical strings)
    """
    from ragas.metrics import NonLLMStringSimilarity, DistanceMeasure

    return NonLLMStringSimilarity(distance_measure=DistanceMeasure.LEVENSHTEIN)


@pytest.fixture
def string_presence_scorer() -> Any:
    """
    Ragas String Presence metric (non-LLM).

    Checks if response contains the reference text.
    Returns: 1.0 (contains) or 0.0 (doesn't contain)
    """
    from ragas.metrics import StringPresence

    return StringPresence()


# ============================================================================
# EVALUATION CONFIGURATION FIXTURES
# ============================================================================

@pytest.fixture
def semantic_evaluation_config() -> dict[str, Any]:
    """
    Configuration for semantic (LLM-based) evaluation thresholds.

    These metrics use Claude Sonnet 4 for evaluation (costs API credits).
    """
    return {
        # Core RAG metrics
        "faithfulness_threshold": 0.7,           # No hallucination
        "answer_relevancy_threshold": 0.7,       # On-topic response
        "context_precision_threshold": 0.6,      # Quality of retrieval
        "context_recall_threshold": 0.6,         # Completeness of retrieval

        # Answer quality metrics
        "answer_similarity_threshold": 0.7,      # Semantic similarity
        "answer_correctness_threshold": 0.7,     # Factual correctness
    }


@pytest.fixture
def traditional_evaluation_config() -> dict[str, Any]:
    """
    Configuration for traditional (non-LLM) evaluation thresholds.

    These metrics are fast and free (no API calls).
    """
    return {
        # Exact matching (binary)
        "exact_match_threshold": 1.0,            # Exact string match

        # N-gram overlap metrics
        "bleu_threshold": 0.4,                   # BLEU score
        "rouge_threshold": 0.5,                  # ROUGE-L F-measure

        # String similarity
        "string_similarity_threshold": 0.7,      # Levenshtein similarity

        # Substring matching
        "string_presence_threshold": 1.0,        # Contains reference
    }


# ============================================================================
# REAL RAG SYSTEM FIXTURES (for integration testing with actual RAG pipeline)
# ============================================================================

@pytest_asyncio.fixture
async def real_rag_client() -> AsyncGenerator[AsyncClient, None]:
    """
    Create AsyncClient for making requests to the real RAG system.

    This assumes your FastAPI app is already running on localhost:8000.
    If not, start it with: make run (or uvicorn app.main:app --reload)

    Use this client to test the actual /api/v1/chat/stream endpoint.
    """
    async with AsyncClient(base_url="http://localhost:8000", timeout=30.0) as client:
        yield client


async def collect_sse_response(response_text: str) -> str:
    """
    Helper function to collect and combine SSE streaming chunks.

    Args:
        response_text: Raw SSE response text with chunks

    Returns:
        Combined text from all chunks
    """
    # SSE format: each chunk ends with \n\n
    chunks = response_text.split("\n\n")
    # Filter out empty chunks and combine
    combined = "".join(chunk.strip() for chunk in chunks if chunk.strip())
    return combined


@pytest_asyncio.fixture
async def real_rag_system(real_rag_client: AsyncClient) -> Any:
    """
    Real RAG system fixture that provides a consistent interface for testing.

    This fixture wraps the real RAG API endpoint to provide the same interface
    as the mock_rag_system fixture, making it easy to test real vs mock.

    Returns:
        Object with retrieve_and_generate() method that calls the real RAG API
    """
    class RealRAGSystem:
        """Wrapper around the real RAG system for testing."""

        def __init__(self, client: AsyncClient) -> None:
            self.client = client

        async def retrieve_and_generate(
            self,
            query: str,
            top_k: int = 5  # Default matches RAG chain's retriever k=5
        ) -> dict[str, Any]:
            """
            Call the real RAG system via /api/v1/chat/stream endpoint.

            Args:
                query: User question
                top_k: Number of contexts to retrieve (currently not configurable in endpoint)

            Returns:
                Dict with query, retrieved_contexts, and response
            """
            # Call the real chat endpoint
            response = await self.client.post(
                "/api/v1/chat/stream",
                json={"message": query}
            )

            # Check if request was successful
            if response.status_code != 200:
                raise Exception(
                    f"RAG endpoint returned status {response.status_code}: {response.text}"
                )

            # Collect streaming response
            response_text = response.text
            combined_response = await collect_sse_response(response_text)

            # Note: The current endpoint doesn't return retrieved_contexts separately
            # For now, we'll return empty contexts. To get actual contexts, the endpoint
            # would need to be modified to return them.
            return {
                "query": query,
                "retrieved_contexts": [],  # TODO: Modify endpoint to return contexts
                "response": combined_response,
            }

    return RealRAGSystem(real_rag_client)
