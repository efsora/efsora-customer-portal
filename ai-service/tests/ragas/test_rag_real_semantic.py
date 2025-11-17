"""
Real RAG Semantic evaluation tests using LLM-based Ragas metrics.

This test suite evaluates the ACTUAL RAG system using AWS Bedrock Claude Sonnet 4
for semantic understanding. These tests call the real /api/v1/chat/stream endpoint
and evaluate actual responses from your vectorstore + LLM pipeline.

Metrics evaluated:
- Faithfulness: No hallucination (response grounded in context)
- Answer Relevancy: On-topic responses to user questions
- Context Precision: Quality of retrieved contexts
- Context Recall: Completeness of retrieved information
- Answer Similarity: Semantic similarity to reference
- Answer Correctness: Factual accuracy combined with similarity

Prerequisites:
- Weaviate running and populated with documents
- AWS credentials for Bedrock (for both RAG and evaluation)
- Update REAL_SEMANTIC_TEST_DATA with questions about your actual documents

When to use: Testing your production RAG system with complex questions requiring
semantic understanding and contextual reasoning.
"""

from typing import Any

import pytest
from ragas import EvaluationDataset, evaluate
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
    answer_similarity,
    answer_correctness,
)

from tests.ragas.fixtures.real_semantic_data import REAL_SEMANTIC_TEST_DATA


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_semantic_faithfulness(
    real_rag_system: Any,
    ragas_llm: LangchainLLMWrapper,
    semantic_evaluation_config: dict[str, Any],
) -> None:
    """
    Test that real RAG responses are faithful to retrieved contexts (no hallucination).

    Uses Claude Sonnet 4 to evaluate if the response can be inferred
    from the provided contexts. High scores indicate the RAG system
    is not making up information.

    Note: Currently skips if endpoint doesn't return retrieved_contexts.
    """
    # Collect responses from real RAG system
    test_data = []
    for item in REAL_SEMANTIC_TEST_DATA:
        rag_output = await real_rag_system.retrieve_and_generate(item["user_input"])

        test_data.append({
            "user_input": rag_output["query"],
            "retrieved_contexts": rag_output["retrieved_contexts"],
            "response": rag_output["response"],
            "reference": item["reference"],
        })

    # Check if we have contexts (required for faithfulness)
    if not test_data[0]["retrieved_contexts"]:
        pytest.skip(
            "Skipping faithfulness test: endpoint doesn't return retrieved_contexts. "
            "Modify /api/v1/chat/stream to return contexts for proper evaluation."
        )

    dataset = EvaluationDataset.from_list(test_data)

    # Configure metric with Claude LLM
    metric = faithfulness
    metric.llm = ragas_llm

    result = evaluate(dataset, metrics=[metric])

    threshold = semantic_evaluation_config["faithfulness_threshold"]
    score = result["faithfulness"]

    print(f"\n{'='*60}")
    print(f"REAL RAG SEMANTIC FAITHFULNESS TEST")
    print(f"{'='*60}")
    print(f"Score: {score:.3f}")
    print(f"Threshold: {threshold}")
    print(f"Status: {'✓ PASS' if score >= threshold else '✗ FAIL'}")
    print(f"{'='*60}\n")

    assert score >= threshold, (
        f"Faithfulness score {score:.3f} below threshold {threshold}. "
        "Responses may contain hallucinated information not present in contexts."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_semantic_answer_relevancy(
    real_rag_system: Any,
    ragas_llm: LangchainLLMWrapper,
    ragas_embeddings: LangchainEmbeddingsWrapper,
    semantic_evaluation_config: dict[str, Any],
) -> None:
    """
    Test that real RAG responses are relevant to user questions.

    Evaluates how well the response addresses the user's actual question.
    Low relevancy indicates responses may be off-topic or incomplete.
    """
    # Collect responses from real RAG system
    test_data = []
    for item in REAL_SEMANTIC_TEST_DATA:
        rag_output = await real_rag_system.retrieve_and_generate(item["user_input"])

        test_data.append({
            "user_input": rag_output["query"],
            "response": rag_output["response"],
            "reference": item["reference"],
        })

    dataset = EvaluationDataset.from_list(test_data)

    metric = answer_relevancy
    metric.llm = ragas_llm
    metric.embeddings = ragas_embeddings

    result = evaluate(dataset, metrics=[metric])

    threshold = semantic_evaluation_config["answer_relevancy_threshold"]
    score = result["answer_relevancy"]

    print(f"\n{'='*60}")
    print(f"REAL RAG SEMANTIC ANSWER RELEVANCY TEST")
    print(f"{'='*60}")
    print(f"Score: {score:.3f}")
    print(f"Threshold: {threshold}")
    print(f"Status: {'✓ PASS' if score >= threshold else '✗ FAIL'}")
    print(f"{'='*60}\n")

    assert score >= threshold, (
        f"Answer relevancy {score:.3f} below threshold {threshold}. "
        "Responses may not properly address user questions."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_semantic_context_precision(
    real_rag_system: Any,
    ragas_llm: LangchainLLMWrapper,
    semantic_evaluation_config: dict[str, Any],
) -> None:
    """
    Test the precision of context retrieval in real RAG system.

    Measures how much of the retrieved context is actually relevant.
    High precision means low noise in retrieval results.

    Note: Requires endpoint to return retrieved_contexts.
    """
    # Collect responses from real RAG system
    test_data = []
    for item in REAL_SEMANTIC_TEST_DATA:
        rag_output = await real_rag_system.retrieve_and_generate(item["user_input"])

        test_data.append({
            "user_input": rag_output["query"],
            "retrieved_contexts": rag_output["retrieved_contexts"],
            "response": rag_output["response"],
            "reference": item["reference"],
        })

    # Check if we have contexts
    if not test_data[0]["retrieved_contexts"]:
        pytest.skip(
            "Skipping context precision test: endpoint doesn't return retrieved_contexts."
        )

    dataset = EvaluationDataset.from_list(test_data)

    metric = context_precision
    metric.llm = ragas_llm

    result = evaluate(dataset, metrics=[metric])

    threshold = semantic_evaluation_config["context_precision_threshold"]
    score = result["context_precision"]

    print(f"\n{'='*60}")
    print(f"REAL RAG SEMANTIC CONTEXT PRECISION TEST")
    print(f"{'='*60}")
    print(f"Score: {score:.3f}")
    print(f"Threshold: {threshold}")
    print(f"Status: {'✓ PASS' if score >= threshold else '✗ FAIL'}")
    print(f"{'='*60}\n")

    assert score >= threshold, (
        f"Context precision {score:.3f} below threshold {threshold}. "
        "Retrieved contexts may contain too much irrelevant information."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_semantic_context_recall(
    real_rag_system: Any,
    ragas_llm: LangchainLLMWrapper,
    semantic_evaluation_config: dict[str, Any],
) -> None:
    """
    Test the recall of context retrieval in real RAG system.

    Measures how much of the relevant information was actually retrieved.
    High recall means the system finds all necessary context.

    Note: Requires endpoint to return retrieved_contexts.
    """
    # Collect responses from real RAG system
    test_data = []
    for item in REAL_SEMANTIC_TEST_DATA:
        rag_output = await real_rag_system.retrieve_and_generate(item["user_input"])

        test_data.append({
            "user_input": rag_output["query"],
            "retrieved_contexts": rag_output["retrieved_contexts"],
            "response": rag_output["response"],
            "reference": item["reference"],
        })

    # Check if we have contexts
    if not test_data[0]["retrieved_contexts"]:
        pytest.skip(
            "Skipping context recall test: endpoint doesn't return retrieved_contexts."
        )

    dataset = EvaluationDataset.from_list(test_data)

    metric = context_recall
    metric.llm = ragas_llm

    result = evaluate(dataset, metrics=[metric])

    threshold = semantic_evaluation_config["context_recall_threshold"]
    score = result["context_recall"]

    print(f"\n{'='*60}")
    print(f"REAL RAG SEMANTIC CONTEXT RECALL TEST")
    print(f"{'='*60}")
    print(f"Score: {score:.3f}")
    print(f"Threshold: {threshold}")
    print(f"Status: {'✓ PASS' if score >= threshold else '✗ FAIL'}")
    print(f"{'='*60}\n")

    assert score >= threshold, (
        f"Context recall {score:.3f} below threshold {threshold}. "
        "System may not be retrieving all relevant information."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_semantic_answer_similarity(
    real_rag_system: Any,
    ragas_llm: LangchainLLMWrapper,
    ragas_embeddings: LangchainEmbeddingsWrapper,
    semantic_evaluation_config: dict[str, Any],
) -> None:
    """
    Test semantic similarity between real RAG responses and reference answers.

    Measures how semantically close the response is to the reference answer.
    This is useful when you have ground truth answers for your documents.
    """
    # Collect responses from real RAG system
    test_data = []
    for item in REAL_SEMANTIC_TEST_DATA:
        rag_output = await real_rag_system.retrieve_and_generate(item["user_input"])

        test_data.append({
            "user_input": rag_output["query"],
            "response": rag_output["response"],
            "reference": item["reference"],
        })

    dataset = EvaluationDataset.from_list(test_data)

    metric = answer_similarity
    metric.llm = ragas_llm
    metric.embeddings = ragas_embeddings

    result = evaluate(dataset, metrics=[metric])

    threshold = semantic_evaluation_config["answer_similarity_threshold"]
    score = result["answer_similarity"]

    print(f"\n{'='*60}")
    print(f"REAL RAG SEMANTIC ANSWER SIMILARITY TEST")
    print(f"{'='*60}")
    print(f"Score: {score:.3f}")
    print(f"Threshold: {threshold}")
    print(f"Status: {'✓ PASS' if score >= threshold else '✗ FAIL'}")
    print(f"{'='*60}\n")

    assert score >= threshold, (
        f"Answer similarity {score:.3f} below threshold {threshold}. "
        "Responses may not be semantically similar to expected answers."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_semantic_answer_correctness(
    real_rag_system: Any,
    ragas_llm: LangchainLLMWrapper,
    ragas_embeddings: LangchainEmbeddingsWrapper,
    semantic_evaluation_config: dict[str, Any],
) -> None:
    """
    Test factual correctness of real RAG responses.

    Combines both semantic similarity and factual accuracy to evaluate
    if the response is correct relative to the reference answer.
    """
    # Collect responses from real RAG system
    test_data = []
    for item in REAL_SEMANTIC_TEST_DATA:
        rag_output = await real_rag_system.retrieve_and_generate(item["user_input"])

        test_data.append({
            "user_input": rag_output["query"],
            "response": rag_output["response"],
            "reference": item["reference"],
        })

    dataset = EvaluationDataset.from_list(test_data)

    metric = answer_correctness
    metric.llm = ragas_llm
    metric.embeddings = ragas_embeddings

    result = evaluate(dataset, metrics=[metric])

    threshold = semantic_evaluation_config["answer_correctness_threshold"]
    score = result["answer_correctness"]

    print(f"\n{'='*60}")
    print(f"REAL RAG SEMANTIC ANSWER CORRECTNESS TEST")
    print(f"{'='*60}")
    print(f"Score: {score:.3f}")
    print(f"Threshold: {threshold}")
    print(f"Status: {'✓ PASS' if score >= threshold else '✗ FAIL'}")
    print(f"{'='*60}\n")

    assert score >= threshold, (
        f"Answer correctness {score:.3f} below threshold {threshold}. "
        "Responses may contain factual errors or inaccuracies."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_semantic_comprehensive_evaluation(
    real_rag_system: Any,
    ragas_llm: LangchainLLMWrapper,
    ragas_embeddings: LangchainEmbeddingsWrapper,
    semantic_evaluation_config: dict[str, Any],
) -> None:
    """
    Comprehensive semantic evaluation of real RAG system using all metrics.

    Runs all semantic metrics together for a complete RAG quality assessment.
    This is the most thorough but also slowest and most expensive test.

    Note: Context-based metrics (faithfulness, precision, recall) will be skipped
    if endpoint doesn't return retrieved_contexts.
    """
    # Collect responses from real RAG system
    test_data = []
    for item in REAL_SEMANTIC_TEST_DATA:
        rag_output = await real_rag_system.retrieve_and_generate(item["user_input"])

        test_data.append({
            "user_input": rag_output["query"],
            "retrieved_contexts": rag_output["retrieved_contexts"],
            "response": rag_output["response"],
            "reference": item["reference"],
        })

    dataset = EvaluationDataset.from_list(test_data)

    # Determine which metrics to use based on whether we have contexts
    has_contexts = bool(test_data[0]["retrieved_contexts"])

    if has_contexts:
        # Use all metrics
        metrics = [
            faithfulness,
            answer_relevancy,
            context_precision,
            context_recall,
            answer_similarity,
            answer_correctness,
        ]
    else:
        # Skip context-dependent metrics
        metrics = [
            answer_relevancy,
            answer_similarity,
            answer_correctness,
        ]
        print("\nNote: Skipping context-dependent metrics (faithfulness, precision, recall)")
        print("      Endpoint doesn't return retrieved_contexts\n")

    # Configure all metrics
    for metric in metrics:
        if hasattr(metric, "llm"):
            metric.llm = ragas_llm
        if hasattr(metric, "embeddings"):
            metric.embeddings = ragas_embeddings

    result = evaluate(dataset, metrics=metrics)

    # Print comprehensive results
    print(f"\n{'='*60}")
    print("REAL RAG COMPREHENSIVE SEMANTIC EVALUATION")
    print(f"{'='*60}")

    all_passed = True
    for metric_name, score in result.items():
        threshold_key = f"{metric_name}_threshold"
        if threshold_key in semantic_evaluation_config:
            threshold = semantic_evaluation_config[threshold_key]
            passed = score >= threshold
            status = "✓" if passed else "✗"
            all_passed = all_passed and passed

            print(f"{status} {metric_name.replace('_', ' ').title():<25} "
                  f"Score: {score:.3f}  Threshold: {threshold}")

            # Assert individual metrics
            assert score >= threshold, (
                f"{metric_name} score {score:.3f} below threshold {threshold}"
            )

    print(f"{'='*60}")
    print(f"Overall: {'✓ ALL TESTS PASSED' if all_passed else '✗ SOME TESTS FAILED'}")
    print(f"{'='*60}\n")
