"""
RAG Lexical Evaluation Tests - Fast, Free, Non-LLM Metrics

This test suite evaluates the RAG system using fast, free lexical/statistical
NLP metrics that don't require LLM API calls. Automatically extracts the "answer"
field from JSON responses for evaluation.

Metrics evaluated:
- BLEU Score: N-gram overlap precision
- ROUGE Score: Recall-oriented n-gram overlap

Prerequisites:
- Weaviate running and populated with documents
- Update LEXICAL_TEST_CASES with factual questions about your documents
- No AWS credentials needed (these are free, non-LLM metrics)

When to use: Fast testing of your production RAG system for factual questions.
"""

from typing import Any

import pytest
from ragas.dataset_schema import SingleTurnSample
from ragas.metrics import BleuScore, RougeScore


@pytest.mark.asyncio
@pytest.mark.integration
async def test_bleu_score(
    lexical_test_responses: list[dict[str, Any]],
    bleu_scorer: BleuScore,
    lexical_config: dict[str, Any],
) -> None:
    """
    Test BLEU score for n-gram overlap from RAG system.

    Good for testing responses that should be similar but allow
    some variation in wording. BLEU measures precision of n-grams.

    Note: Uses lexical_test_responses to avoid redundant API calls.
    """
    scores = []

    for item in lexical_test_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )

        score = await bleu_scorer.single_turn_ascore(sample)
        scores.append(score)

    avg_score = sum(scores) / len(scores)

    print(f"\n{'='*60}")
    print("RAG LEXICAL EVALUATION - BLEU SCORE")
    print(f"{'='*60}")
    print(f"Test cases: {len(scores)}")
    print(f"Average BLEU: {avg_score:.3f}")
    print(f"Min BLEU: {min(scores):.3f}")
    print(f"Max BLEU: {max(scores):.3f}")
    print(f"{'='*60}\n")

    threshold = lexical_config["bleu_threshold"]
    assert avg_score >= threshold, (
        f"BLEU score {avg_score:.3f} below threshold {threshold}. "
        "Responses have insufficient n-gram overlap with references."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_rouge_score(
    lexical_test_responses: list[dict[str, Any]],
    rouge_scorer: RougeScore,
    lexical_config: dict[str, Any],
) -> None:
    """
    Test ROUGE score for recall-oriented overlap from RAG system.

    ROUGE-L measures longest common subsequence F-measure.
    Good for checking if key information is present in response.

    Note: Uses lexical_test_responses to avoid redundant API calls.
    """
    scores = []

    for item in lexical_test_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )

        score = await rouge_scorer.single_turn_ascore(sample)
        scores.append(score)

    avg_score = sum(scores) / len(scores)

    print(f"\n{'='*60}")
    print("RAG LEXICAL EVALUATION - ROUGE SCORE (ROUGE-L)")
    print(f"{'='*60}")
    print(f"Test cases: {len(scores)}")
    print(f"Average ROUGE: {avg_score:.3f}")
    print(f"Min ROUGE: {min(scores):.3f}")
    print(f"Max ROUGE: {max(scores):.3f}")
    print(f"{'='*60}\n")

    threshold = lexical_config["rouge_threshold"]
    assert avg_score >= threshold, (
        f"ROUGE score {avg_score:.3f} below threshold {threshold}. "
        "Responses may be missing key information from references."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_comprehensive_evaluation(
    lexical_test_responses: list[dict[str, Any]],
    bleu_scorer: BleuScore,
    rouge_scorer: RougeScore,
    lexical_config: dict[str, Any],
) -> None:
    """
    Comprehensive lexical evaluation of RAG system using all metrics.

    Runs BLEU and ROUGE metrics together for complete quality assessment.
    Fast (seconds), free ($0), no LLM required.

    Note: Uses lexical_test_responses to avoid redundant API calls.
    """
    results = {
        "bleu": [],
        "rouge": [],
    }

    # Collect all metrics for each test case
    for item in lexical_test_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )

        # Calculate all metrics
        results["bleu"].append(await bleu_scorer.single_turn_ascore(sample))
        results["rouge"].append(await rouge_scorer.single_turn_ascore(sample))

    # Calculate averages
    avg_results = {metric: sum(scores) / len(scores) for metric, scores in results.items()}

    # Print comprehensive results
    print(f"\n{'='*60}")
    print("RAG COMPREHENSIVE LEXICAL EVALUATION")
    print(f"{'='*60}")

    all_passed = True
    metric_configs = {
        "bleu": "bleu_threshold",
        "rouge": "rouge_threshold",
    }

    for metric_name, score in avg_results.items():
        threshold_key = metric_configs.get(metric_name)
        if threshold_key and threshold_key in lexical_config:
            threshold = lexical_config[threshold_key]
            passed = score >= threshold
            status = "✓" if passed else "✗"
            all_passed = all_passed and passed

            print(
                f"{status} {metric_name.upper():<25} " f"Score: {score:.3f}  Threshold: {threshold}"
            )

            # Assert individual metrics
            assert (
                score >= threshold
            ), f"{metric_name} score {score:.3f} below threshold {threshold}"

    print(f"{'='*60}")
    print(f"Overall: {'✓ ALL TESTS PASSED' if all_passed else '✗ SOME TESTS FAILED'}")
    print("Execution: Fast (seconds)")
    print("Cost: $0.00")
    print(f"{'='*60}\n")
