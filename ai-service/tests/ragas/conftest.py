"""
Pytest fixtures for Ragas-based RAG evaluation tests.

This module provides fixtures for:
- AWS Bedrock Claude LLM and embedding models for LLM-judged evaluation
- Ragas lexical (non-LLM) metric calculators
- RAG system integration via FastAPI test client
- JSON extraction and structured validation helpers
"""

from collections.abc import AsyncGenerator
import json
import os
import re
from typing import Any

from httpx import AsyncClient
import pytest
import pytest_asyncio
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.llms import LangchainLLMWrapper

# ============================================================================
# STRUCTURED JSON HELPERS (for extracting and validating structured responses)
# ============================================================================


def extract_json(response_text: str) -> dict[str, Any] | None:
    """
    Extract JSON object from LLM response text.

    The LLM may return JSON in various formats:
    1. Plain JSON: {"answer": "...", ...}
    2. Markdown code block: ```json\n{...}\n```
    3. With extra text: "Here's the answer: {...}"

    Args:
        response_text: Raw response text from LLM

    Returns:
        Parsed JSON dict or None if parsing fails

    Example:
        >>> extract_json('```json\\n{"answer": "test"}\\n```')
        {'answer': 'test'}
    """
    if not response_text or not isinstance(response_text, str):
        return None

    # Remove leading/trailing whitespace
    text = response_text.strip()

    # Try 1: Extract from markdown code block
    if "```json" in text:
        match = re.search(r"```json\s*\n(.*?)\n```", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

    # Try 2: Extract from code block without language specifier
    if "```" in text:
        match = re.search(r"```\s*\n(.*?)\n```", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

    # Try 3: Find JSON object with curly braces
    match = re.search(r"\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    # Try 4: Parse entire text as JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    return None


def validate_json_schema(response_json: dict[str, Any]) -> bool:
    """
    Validate that response JSON has the expected structure.

    Expected structure:
    {
        "answer": str,
        "entities": list[str],
        "boolean_answer": "yes" | "no" | "",
        "confidence": "high" | "medium" | "low"
    }

    Args:
        response_json: Parsed JSON from response

    Returns:
        True if structure is valid, False otherwise
    """
    if not isinstance(response_json, dict):
        return False

    # Check required fields exist
    required_fields = {"answer", "entities", "boolean_answer", "confidence"}
    if not required_fields.issubset(response_json.keys()):
        return False

    # Validate field types and values
    if not isinstance(response_json["answer"], str):
        return False

    if not isinstance(response_json["entities"], list):
        return False

    if response_json["boolean_answer"] not in ["yes", "no", ""]:
        return False

    if response_json["confidence"] not in ["high", "medium", "low"]:
        return False

    return True


def score_json_response(
    response: dict[str, Any],
    reference: dict[str, Any],
) -> dict[str, float]:
    """
    Compare structured response against reference and return detailed scores.

    Args:
        response: Parsed JSON response from LLM
        reference: Expected structured reference

    Returns:
        Dictionary with comparison scores:
        - answer_match: 1.0 if substring match, 0.0 otherwise
        - entities_overlap: Jaccard similarity of entity sets
        - boolean_match: 1.0 if boolean answers match, 0.0 otherwise
        - confidence_match: 1.0 if confidence levels match, 0.0 otherwise
        - overall_score: Weighted average of all scores
    """
    scores = {}

    # 1. Answer match (substring or semantic similarity)
    ref_answer = reference.get("answer", "").lower()
    resp_answer = response.get("answer", "").lower()
    scores["answer_match"] = 1.0 if ref_answer in resp_answer or resp_answer in ref_answer else 0.0

    # 2. Entities overlap (Jaccard similarity)
    ref_entities = {e.lower() for e in reference.get("entities", [])}
    resp_entities = {e.lower() for e in response.get("entities", [])}

    if ref_entities or resp_entities:
        intersection = len(ref_entities & resp_entities)
        union = len(ref_entities | resp_entities)
        scores["entities_overlap"] = intersection / union if union > 0 else 0.0
    else:
        scores["entities_overlap"] = 1.0  # Both empty is a match

    # 3. Boolean answer match
    ref_bool = reference.get("boolean_answer", "")
    resp_bool = response.get("boolean_answer", "")
    scores["boolean_match"] = 1.0 if ref_bool == resp_bool else 0.0

    # 4. Confidence match (optional, less critical)
    ref_conf = reference.get("confidence", "")
    resp_conf = response.get("confidence", "")
    scores["confidence_match"] = 1.0 if ref_conf == resp_conf else 0.0

    # 5. Overall score (weighted average)
    # Weight: answer (40%), entities (30%), boolean (20%), confidence (10%)
    scores["overall_score"] = (
        0.4 * scores["answer_match"]
        + 0.3 * scores["entities_overlap"]
        + 0.2 * scores["boolean_match"]
        + 0.1 * scores["confidence_match"]
    )

    return scores


# ============================================================================
# AWS BEDROCK FIXTURES (for semantic/LLM-based evaluation)
# ============================================================================


@pytest.fixture(scope="session")
def aws_credentials() -> tuple[str, str, str]:
    """
    Get AWS credentials from environment.

    Returns:
        Tuple of (access_key_id, secret_access_key, region)
        Region defaults to 'us-east-1' if not specified in environment.

    Raises:
        pytest.skip: If AWS credentials are not set
    """
    access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
    secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    region = os.getenv("AWS_REGION") or os.getenv("BEDROCK_REGION") or "us-east-1"

    if not access_key_id or not secret_access_key:
        pytest.skip(
            "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY not set, " "skipping semantic Ragas tests"
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

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return LangchainEmbeddingsWrapper(embeddings)


# ============================================================================
# LEXICAL METRICS FIXTURES (Ragas non-LLM metrics - fast and free)
# ============================================================================


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


# ============================================================================
# EVALUATION CONFIGURATION FIXTURES
# ============================================================================


@pytest.fixture
def llm_judged_config() -> dict[str, Any]:
    """
    Configuration for LLM-judged evaluation thresholds.
    """
    return {
        # Answer quality metrics
        "answer_relevancy_threshold": 0.7,  # On-topic response
        "answer_correctness_threshold": 0.7,  # Factual correctness
    }


@pytest.fixture
def lexical_config() -> dict[str, Any]:
    """
    Configuration for lexical (non-LLM) evaluation thresholds.
    """
    return {
        # N-gram overlap metrics
        "bleu_threshold": 0.4,  # BLEU score
        "rouge_threshold": 0.5,  # ROUGE-L F-measure
    }


# ============================================================================
# REAL RAG SYSTEM FIXTURES (for integration testing with actual RAG pipeline)
# ============================================================================


def parse_sse_stream(response_text: str) -> str:
    """
    Parse SSE (Server-Sent Events) response and extract clean text.

    SSE format has each chunk prefixed with "data: " and separated by "\n\n".
    This function removes the SSE formatting to get the actual response text.

    Args:
        response_text: Raw SSE response with "data: " prefixes

    Returns:
        Clean combined text without SSE formatting artifacts

    Example:
        Input:  "data: Hello\n\ndata:  world\n\ndata: !\n\n"
        Output: "Hello world!"
    """
    chunks = response_text.split("\n\n")
    cleaned_chunks = []

    for chunk in chunks:
        chunk = chunk.strip()
        if chunk and chunk.startswith("data: "):
            # Remove "data: " prefix (6 characters)
            cleaned_chunks.append(chunk[6:])

    return "".join(cleaned_chunks)


@pytest_asyncio.fixture(scope="module")
async def rag_client() -> AsyncGenerator[AsyncClient, None]:
    """
    Create AsyncClient for making requests to the real RAG system.

    This assumes your FastAPI app is already running on localhost:8000.
    If not, start it with: make run (or uvicorn app.main:app --reload)

    Use this client to test the actual /api/v1/chat/stream endpoint.

    Scope: module - shared across all tests in a module to enable response caching.
    """
    async with AsyncClient(base_url="http://localhost:8000", timeout=30.0) as client:
        yield client


@pytest_asyncio.fixture(scope="module")
async def rag_system(rag_client: AsyncClient) -> Any:
    """
    Real RAG system fixture that provides a consistent interface for testing.

    This fixture wraps the real RAG API endpoint to provide the same interface
    as the mock_rag_system fixture, making it easy to test real vs mock.

    Scope: module - shared across all tests in a module to enable response caching.

    Returns:
        Object with retrieve_and_generate() method that calls the real RAG API
    """

    class RealRAGSystem:
        """Wrapper around the real RAG system for testing."""

        def __init__(self, client: AsyncClient) -> None:
            self.client = client

        async def retrieve_and_generate(
            self, query: str, top_k: int = 5  # Default matches RAG chain's retriever k=5
        ) -> dict[str, Any]:
            """
            Call the real RAG system via /api/v1/chat/stream endpoint (SSE streaming).

            Tests the PRODUCTION streaming endpoint to ensure streaming logic
            (smart spacing, SSE formatting, chunk accumulation) works correctly.

            Args:
                query: User question
                top_k: Number of contexts to retrieve (currently not configurable in endpoint)

            Returns:
                Dict with query, retrieved_contexts, and response
            """
            # Call the streaming chat endpoint (production code path)
            response = await self.client.post("/api/v1/chat/stream", json={"message": query})

            # Check if request was successful
            if response.status_code != 200:
                raise Exception(
                    f"RAG endpoint returned status {response.status_code}: {response.text}"
                )

            # Parse SSE response to extract clean text
            response_text = parse_sse_stream(response.text)

            # Note: Retrieved contexts are not currently returned by the API.
            # This causes 3 ragas metrics to auto-skip:
            # - Faithfulness (hallucination detection)
            # - Context Precision (retrieval quality)
            # - Context Recall (retrieval completeness)
            #
            # To enable these metrics, modify the endpoint to return retrieved contexts.
            # See tests/ragas/RAG_API_REQUIREMENTS.md for implementation options.
            return {
                "query": query,
                "retrieved_contexts": [],  # Empty until API returns contexts
                "response": response_text,
            }

    return RealRAGSystem(rag_client)


# ============================================================================
# CACHED RESPONSES FIXTURES (to avoid redundant API calls in tests)
# ============================================================================


@pytest_asyncio.fixture(scope="module")
async def lexical_test_responses(rag_system: Any) -> list[dict[str, Any]]:
    """
    Cache RAG responses for traditional tests to avoid redundant API calls.

    Makes API requests ONCE for all questions in LEXICAL_TEST_CASES,
    then all 6 traditional test functions reuse these cached responses.

    Without caching: 6 tests × 5 questions = 30 API requests
    With caching: 5 questions = 5 API requests (6x faster!)

    If RAG returns JSON responses, extracts the "answer" field for lexical matching.
    If RAG returns plain text, uses it directly.

    Returns:
        List of dicts with 'user_input', 'response', 'reference' for each question
    """
    from tests.ragas.fixtures.lexical_data import LEXICAL_TEST_CASES

    cached_responses = []

    for item in LEXICAL_TEST_CASES:
        # Make API call once
        rag_output = await rag_system.retrieve_and_generate(item["user_input"])

        # Extract answer from JSON if present, otherwise use raw response
        response_text = rag_output["response"]
        response_json = extract_json(response_text)
        if response_json and "answer" in response_json:
            # RAG returned JSON - extract just the answer field for lexical matching
            final_response = response_json["answer"]
        else:
            # RAG returned plain text - use as is
            final_response = response_text

        # Cache the result
        cached_responses.append(
            {
                "user_input": rag_output["query"],
                "response": final_response,
                "reference": item["reference"],
                "retrieved_contexts": rag_output["retrieved_contexts"],
            }
        )

    return cached_responses


@pytest_asyncio.fixture(scope="module")
async def llm_judged_test_responses(rag_system: Any) -> list[dict[str, Any]]:
    """
    Cache RAG responses for semantic tests to avoid redundant API calls.

    Makes API requests ONCE for all questions in LLM_JUDGED_TEST_CASES,
    then all 7 semantic test functions reuse these cached responses.

    Without caching: 7 tests × 5 questions = 35 API requests
    With caching: 5 questions = 5 API requests (7x faster!)

    If RAG returns JSON responses, extracts the "answer" field for LLM evaluation.
    If RAG returns plain text, uses it directly.

    Returns:
        List of dicts with 'user_input', 'response', 'reference', 'retrieved_contexts'
    """
    from tests.ragas.fixtures.llm_judged_data import LLM_JUDGED_TEST_CASES

    cached_responses = []

    for item in LLM_JUDGED_TEST_CASES:
        # Make API call once
        rag_output = await rag_system.retrieve_and_generate(item["user_input"])

        # Extract answer from JSON if present, otherwise use raw response
        response_text = rag_output["response"]
        response_json = extract_json(response_text)
        if response_json and "answer" in response_json:
            # RAG returned JSON - extract just the answer field for LLM evaluation
            final_response = response_json["answer"]
        else:
            # RAG returned plain text - use as is
            final_response = response_text

        # Cache the result
        cached_responses.append(
            {
                "user_input": rag_output["query"],
                "response": final_response,
                "reference": item["reference"],
                "retrieved_contexts": rag_output["retrieved_contexts"],
            }
        )

    return cached_responses
