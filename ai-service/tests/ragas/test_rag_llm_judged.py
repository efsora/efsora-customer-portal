"""
LLM-judged RAG evaluation tests using Claude as a semantic judge.

Run these tests with Docker services running and AWS credentials:
    POSTGRES_HOST=localhost WEAVIATE_HOST=localhost \\
    AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy \\
    uv run pytest tests/ragas/test_rag_llm_judged.py -v

These tests require AWS credentials for Bedrock (Claude LLM + Titan embeddings).
"""

from typing import Any

import pytest
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.llms import LangchainLLMWrapper
from ragas.metrics import (
    answer_correctness,
    answer_relevancy,
    context_precision,
    context_recall,
    faithfulness,
)

from ragas import EvaluationDataset, evaluate


@pytest.mark.asyncio
@pytest.mark.integration
async def test_answer_relevancy(
    llm_judged_test_responses: list[dict[str, Any]],
    ragas_llm: LangchainLLMWrapper,
    ragas_embeddings: LangchainEmbeddingsWrapper,
    llm_judged_config: dict[str, Any],
) -> None:
    """
    Test that RAG responses are relevant to user questions.

    Evaluates how well the response addresses the user's actual question.
    Low relevancy indicates responses may be off-topic or incomplete.

    Note: Uses llm_judged_test_responses to avoid redundant API calls.
    """
    test_data = llm_judged_test_responses
    dataset = EvaluationDataset.from_list(test_data)

    metric = answer_relevancy
    metric.llm = ragas_llm
    metric.embeddings = ragas_embeddings

    result = evaluate(dataset, metrics=[metric])

    threshold = llm_judged_config["answer_relevancy_threshold"]
    score = result["answer_relevancy"]
    print(f"\n{'='*60}")
    print("RAG LLM-JUDGED EVALUATION - ANSWER RELEVANCY")
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
async def test_answer_correctness(
    llm_judged_test_responses: list[dict[str, Any]],
    ragas_llm: LangchainLLMWrapper,
    ragas_embeddings: LangchainEmbeddingsWrapper,
    llm_judged_config: dict[str, Any],
) -> None:
    """
    Test factual correctness of RAG responses.

    Combines both semantic similarity and factual accuracy to evaluate
    if the response is correct relative to the reference answer.

    Note: Uses llm_judged_test_responses to avoid redundant API calls.
    """
    test_data = llm_judged_test_responses
    dataset = EvaluationDataset.from_list(test_data)

    metric = answer_correctness
    metric.llm = ragas_llm
    metric.embeddings = ragas_embeddings

    result = evaluate(dataset, metrics=[metric])

    threshold = llm_judged_config["answer_correctness_threshold"]
    score = result["answer_correctness"]
    print(f"\n{'='*60}")
    print("RAG LLM-JUDGED EVALUATION - ANSWER CORRECTNESS")
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
async def test_faithfulness(
    llm_judged_test_responses: list[dict[str, Any]],
    ragas_llm: LangchainLLMWrapper,
    llm_judged_config: dict[str, Any],
) -> None:
    """
    Test that RAG responses are faithful to the retrieved contexts.

    Detects hallucinations by verifying all claims in the response
    are supported by the retrieved contexts.

    Requires retrieved_contexts to be populated (uses rag_system_with_retriever).

    Note: Uses llm_judged_test_responses to avoid redundant API calls.
    """
    # Check if contexts are available
    has_contexts = any(item.get("retrieved_contexts") for item in llm_judged_test_responses)
    if not has_contexts:
        pytest.skip("No retrieved contexts available - faithfulness test requires contexts")

    test_data = llm_judged_test_responses
    dataset = EvaluationDataset.from_list(test_data)

    metric = faithfulness
    metric.llm = ragas_llm

    result = evaluate(dataset, metrics=[metric])

    threshold = llm_judged_config.get("faithfulness_threshold", 0.7)
    score = result["faithfulness"]
    print(f"\n{'='*60}")
    print("RAG LLM-JUDGED EVALUATION - FAITHFULNESS")
    print(f"{'='*60}")
    print(f"Score: {score:.3f}")
    print(f"Threshold: {threshold}")
    print(f"Status: {'✓ PASS' if score >= threshold else '✗ FAIL'}")
    print(f"{'='*60}\n")

    assert score >= threshold, (
        f"Faithfulness {score:.3f} below threshold {threshold}. "
        "Responses may contain hallucinations not supported by context."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_context_precision(
    llm_judged_test_responses: list[dict[str, Any]],
    ragas_llm: LangchainLLMWrapper,
    llm_judged_config: dict[str, Any],
) -> None:
    """
    Test that retrieved contexts are relevant to the question.

    Measures retrieval quality by checking if relevant contexts
    are ranked higher than irrelevant ones.

    Requires retrieved_contexts to be populated (uses rag_system_with_retriever).

    Note: Uses llm_judged_test_responses to avoid redundant API calls.
    """
    # Check if contexts are available
    has_contexts = any(item.get("retrieved_contexts") for item in llm_judged_test_responses)
    if not has_contexts:
        pytest.skip("No retrieved contexts available - context_precision test requires contexts")

    test_data = llm_judged_test_responses
    dataset = EvaluationDataset.from_list(test_data)

    metric = context_precision
    metric.llm = ragas_llm

    result = evaluate(dataset, metrics=[metric])

    threshold = llm_judged_config.get("context_precision_threshold", 0.6)
    score = result["context_precision"]
    print(f"\n{'='*60}")
    print("RAG LLM-JUDGED EVALUATION - CONTEXT PRECISION")
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
async def test_context_recall(
    llm_judged_test_responses: list[dict[str, Any]],
    ragas_llm: LangchainLLMWrapper,
    llm_judged_config: dict[str, Any],
) -> None:
    """
    Test that all relevant information is retrieved.

    Measures retrieval completeness by checking if all information
    needed to answer the question is present in retrieved contexts.

    Requires retrieved_contexts to be populated (uses rag_system_with_retriever).

    Note: Uses llm_judged_test_responses to avoid redundant API calls.
    """
    # Check if contexts are available
    has_contexts = any(item.get("retrieved_contexts") for item in llm_judged_test_responses)
    if not has_contexts:
        pytest.skip("No retrieved contexts available - context_recall test requires contexts")

    test_data = llm_judged_test_responses
    dataset = EvaluationDataset.from_list(test_data)

    metric = context_recall
    metric.llm = ragas_llm

    result = evaluate(dataset, metrics=[metric])

    threshold = llm_judged_config.get("context_recall_threshold", 0.6)
    score = result["context_recall"]
    print(f"\n{'='*60}")
    print("RAG LLM-JUDGED EVALUATION - CONTEXT RECALL")
    print(f"{'='*60}")
    print(f"Score: {score:.3f}")
    print(f"Threshold: {threshold}")
    print(f"Status: {'✓ PASS' if score >= threshold else '✗ FAIL'}")
    print(f"{'='*60}\n")

    assert score >= threshold, (
        f"Context recall {score:.3f} below threshold {threshold}. "
        "Retrieved contexts may be missing relevant information."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_comprehensive_evaluation(
    llm_judged_test_responses: list[dict[str, Any]],
    ragas_llm: LangchainLLMWrapper,
    ragas_embeddings: LangchainEmbeddingsWrapper,
    llm_judged_config: dict[str, Any],
) -> None:
    """
    Comprehensive LLM-judged evaluation of RAG system using all available metrics.

    Runs answer-based metrics (answer_relevancy, answer_correctness) always.
    Additionally runs context-based metrics (faithfulness, context_precision,
    context_recall) when retrieved_contexts are available.

    Note: Uses llm_judged_test_responses to avoid redundant API calls.
    """
    test_data = llm_judged_test_responses
    dataset = EvaluationDataset.from_list(test_data)

    # Check if contexts are available
    has_contexts = any(item.get("retrieved_contexts") for item in llm_judged_test_responses)

    # Core metrics (always available)
    metrics = [
        answer_relevancy,
        answer_correctness,
    ]

    # Add context-based metrics if contexts are available
    if has_contexts:
        metrics.extend(
            [
                faithfulness,
                context_precision,
                context_recall,
            ]
        )

    # Configure all metrics
    for metric in metrics:
        if hasattr(metric, "llm"):
            metric.llm = ragas_llm
        if hasattr(metric, "embeddings"):
            metric.embeddings = ragas_embeddings

    result = evaluate(dataset, metrics=metrics)

    # Print comprehensive results
    print(f"\n{'='*60}")
    print("RAG COMPREHENSIVE LLM-JUDGED EVALUATION")
    print(f"{'='*60}")
    print(f"Contexts available: {'Yes' if has_contexts else 'No'}")
    print(f"Metrics evaluated: {len(metrics)}")
    print(f"{'='*60}")

    all_passed = True
    for metric_name, score in result.items():
        threshold_key = f"{metric_name}_threshold"
        if threshold_key in llm_judged_config:
            threshold = llm_judged_config[threshold_key]
            passed = score >= threshold
            status = "✓" if passed else "✗"
            all_passed = all_passed and passed

            print(
                f"{status} {metric_name.replace('_', ' ').title():<25} "
                f"Score: {score:.3f}  Threshold: {threshold}"
            )

            # Assert individual metrics
            assert (
                score >= threshold
            ), f"{metric_name} score {score:.3f} below threshold {threshold}"

    print(f"{'='*60}")
    print(f"Overall: {'✓ ALL TESTS PASSED' if all_passed else '✗ SOME TESTS FAILED'}")
    print(f"{'='*60}\n")
