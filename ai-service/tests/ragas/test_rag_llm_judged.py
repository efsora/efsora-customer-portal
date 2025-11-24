from typing import Any

import pytest
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.llms import LangchainLLMWrapper
from ragas.metrics import answer_correctness, answer_relevancy

from ragas import EvaluationDataset, evaluate


@pytest.mark.asyncio
@pytest.mark.integration
async def test_answer_relevancy(
    llm_judged_test_responses: list[dict[str, Any]],
    ragas_llm: LangchainLLMWrapper,  # type: ignore[valid-type]
    ragas_embeddings: LangchainEmbeddingsWrapper,  # type: ignore[valid-type]
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
    score = result["answer_relevancy"]  # type: ignore[index]

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
    ragas_llm: LangchainLLMWrapper,  # type: ignore[valid-type]
    ragas_embeddings: LangchainEmbeddingsWrapper,  # type: ignore[valid-type]
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
    score = result["answer_correctness"]  # type: ignore[index]

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
async def test_comprehensive_evaluation(
    llm_judged_test_responses: list[dict[str, Any]],
    ragas_llm: LangchainLLMWrapper,  # type: ignore[valid-type]
    ragas_embeddings: LangchainEmbeddingsWrapper,  # type: ignore[valid-type]
    llm_judged_config: dict[str, Any],
) -> None:
    """
    Comprehensive LLM-judged evaluation of RAG system using core metrics.

    Runs answer_relevancy and answer_correctness together for complete
    quality assessment using Claude as an LLM judge.

    Note: Uses llm_judged_test_responses to avoid redundant API calls.
    """
    test_data = llm_judged_test_responses
    dataset = EvaluationDataset.from_list(test_data)

    # Use core metrics that don't require retrieved_contexts
    metrics = [
        answer_relevancy,
        answer_correctness,
    ]

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

    all_passed = True
    for metric_name, score in result.items():  # type: ignore[union-attr]
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
