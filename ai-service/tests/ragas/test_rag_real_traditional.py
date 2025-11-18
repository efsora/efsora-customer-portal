"""
Real RAG Traditional evaluation tests using non-LLM Ragas metrics.

This test suite evaluates the ACTUAL RAG system using fast, free traditional
NLP metrics that don't require LLM API calls. These tests call the real
/api/v1/chat/stream endpoint and evaluate responses using lexical matching.

Metrics evaluated:
- Exact Match: Exact string matching for factual answers
- BLEU Score: N-gram overlap precision
- ROUGE Score: Recall-oriented n-gram overlap
- String Similarity: Levenshtein distance similarity
- String Presence: Substring containment check

Prerequisites:
- Weaviate running and populated with documents
- Update REAL_TRADITIONAL_TEST_DATA with factual questions about your documents
- No AWS credentials needed (these are free, non-LLM metrics)

When to use: Fast testing of your production RAG system for simple factual
questions, configuration values, commands - answers that can be evaluated
with lexical matching.
"""

from typing import Any

import pytest
from ragas.dataset_schema import SingleTurnSample
from ragas.metrics import ExactMatch, BleuScore, RougeScore, NonLLMStringSimilarity, StringPresence

from tests.ragas.fixtures.real_traditional_data import REAL_TRADITIONAL_TEST_DATA


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_traditional_exact_match(
    cached_traditional_responses: list[dict[str, Any]],
    exact_match_scorer: ExactMatch,
    traditional_evaluation_config: dict[str, Any],
) -> None:
    """
    Test exact string matching for factual answers from real RAG system.

    Perfect for testing responses that should be precisely correct:
    - Configuration values (ports, paths, names)
    - Command outputs
    - Factual data (dates, numbers, codes)

    Note: Uses cached_traditional_responses to avoid redundant API calls.
    """
    scores = []

    for item in cached_traditional_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )

        score = await exact_match_scorer.single_turn_ascore(sample)
        scores.append(score)

        # Debug: print actual vs expected
        print(f"\nQuestion: {item['user_input']}")
        print(f"Expected: {item['reference']}")
        print(f"Actual:   {item['response']}")
        print(f"Match: {'✓' if score == 1.0 else '✗'}")

    # Calculate average exact match rate
    avg_score = sum(scores) / len(scores)

    print(f"\n{'='*60}")
    print(f"REAL RAG TRADITIONAL EXACT MATCH TEST")
    print(f"{'='*60}")
    print(f"Test cases: {len(scores)}")
    print(f"Exact matches: {sum(s == 1.0 for s in scores)}")
    print(f"Accuracy: {avg_score:.3f}")
    print(f"{'='*60}\n")

    threshold = traditional_evaluation_config["exact_match_threshold"]
    assert avg_score >= threshold, (
        f"Exact match accuracy {avg_score:.3f} below threshold {threshold}. "
        f"Only {sum(s == 1.0 for s in scores)}/{len(scores)} responses matched exactly."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_traditional_bleu_score(
    cached_traditional_responses: list[dict[str, Any]],
    bleu_scorer: BleuScore,
    traditional_evaluation_config: dict[str, Any],
) -> None:
    """
    Test BLEU score for n-gram overlap from real RAG system.

    Good for testing responses that should be similar but allow
    some variation in wording. BLEU measures precision of n-grams.

    Note: Uses cached_traditional_responses to avoid redundant API calls.
    """
    scores = []

    for item in cached_traditional_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )

        score = await bleu_scorer.single_turn_ascore(sample)
        scores.append(score)

    avg_score = sum(scores) / len(scores)

    print(f"\n{'='*60}")
    print(f"REAL RAG TRADITIONAL BLEU SCORE TEST")
    print(f"{'='*60}")
    print(f"Test cases: {len(scores)}")
    print(f"Average BLEU: {avg_score:.3f}")
    print(f"Min BLEU: {min(scores):.3f}")
    print(f"Max BLEU: {max(scores):.3f}")
    print(f"{'='*60}\n")

    threshold = traditional_evaluation_config["bleu_threshold"]
    assert avg_score >= threshold, (
        f"BLEU score {avg_score:.3f} below threshold {threshold}. "
        "Responses have insufficient n-gram overlap with references."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_traditional_rouge_score(
    cached_traditional_responses: list[dict[str, Any]],
    rouge_scorer: RougeScore,
    traditional_evaluation_config: dict[str, Any],
) -> None:
    """
    Test ROUGE score for recall-oriented overlap from real RAG system.

    ROUGE-L measures longest common subsequence F-measure.
    Good for checking if key information is present in response.

    Note: Uses cached_traditional_responses to avoid redundant API calls.
    """
    scores = []

    for item in cached_traditional_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )

        score = await rouge_scorer.single_turn_ascore(sample)
        scores.append(score)

    avg_score = sum(scores) / len(scores)

    print(f"\n{'='*60}")
    print(f"REAL RAG TRADITIONAL ROUGE SCORE TEST (ROUGE-L)")
    print(f"{'='*60}")
    print(f"Test cases: {len(scores)}")
    print(f"Average ROUGE: {avg_score:.3f}")
    print(f"Min ROUGE: {min(scores):.3f}")
    print(f"Max ROUGE: {max(scores):.3f}")
    print(f"{'='*60}\n")

    threshold = traditional_evaluation_config["rouge_threshold"]
    assert avg_score >= threshold, (
        f"ROUGE score {avg_score:.3f} below threshold {threshold}. "
        "Responses may be missing key information from references."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_traditional_string_similarity(
    cached_traditional_responses: list[dict[str, Any]],
    string_similarity_scorer: NonLLMStringSimilarity,
    traditional_evaluation_config: dict[str, Any],
) -> None:
    """
    Test Levenshtein string similarity from real RAG system.

    Measures character-level edit distance between response and reference.
    Good for testing responses that should be similar in structure.

    Note: Uses cached_traditional_responses to avoid redundant API calls.
    """
    scores = []

    for item in cached_traditional_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )

        score = await string_similarity_scorer.single_turn_ascore(sample)
        scores.append(score)

    avg_score = sum(scores) / len(scores)

    print(f"\n{'='*60}")
    print(f"REAL RAG TRADITIONAL STRING SIMILARITY TEST")
    print(f"{'='*60}")
    print(f"Test cases: {len(scores)}")
    print(f"Average similarity: {avg_score:.3f}")
    print(f"Min similarity: {min(scores):.3f}")
    print(f"Max similarity: {max(scores):.3f}")
    print(f"{'='*60}\n")

    threshold = traditional_evaluation_config["string_similarity_threshold"]
    assert avg_score >= threshold, (
        f"String similarity {avg_score:.3f} below threshold {threshold}. "
        "Responses differ significantly from expected format."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_traditional_string_presence(
    cached_traditional_responses: list[dict[str, Any]],
    string_presence_scorer: StringPresence,
    traditional_evaluation_config: dict[str, Any],
) -> None:
    """
    Test if reference strings are present in real RAG responses.

    Checks if the response contains the reference text as a substring.
    Useful for ensuring critical information is included.

    Note: Uses cached_traditional_responses to avoid redundant API calls.
    """
    scores = []

    for item in cached_traditional_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )

        score = await string_presence_scorer.single_turn_ascore(sample)
        scores.append(score)

    avg_score = sum(scores) / len(scores)
    present_count = sum(s == 1.0 for s in scores)

    print(f"\n{'='*60}")
    print(f"REAL RAG TRADITIONAL STRING PRESENCE TEST")
    print(f"{'='*60}")
    print(f"Test cases: {len(scores)}")
    print(f"References present: {present_count}/{len(scores)}")
    print(f"Presence rate: {avg_score:.3f}")
    print(f"{'='*60}\n")

    threshold = traditional_evaluation_config["string_presence_threshold"]
    assert avg_score >= threshold, (
        f"String presence rate {avg_score:.3f} below threshold {threshold}. "
        f"Only {present_count}/{len(scores)} responses contain the reference text."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_real_traditional_comprehensive_evaluation(
    cached_traditional_responses: list[dict[str, Any]],
    exact_match_scorer: ExactMatch,
    bleu_scorer: BleuScore,
    rouge_scorer: RougeScore,
    string_similarity_scorer: NonLLMStringSimilarity,
    traditional_evaluation_config: dict[str, Any],
) -> None:
    """
    Comprehensive traditional evaluation of real RAG system using all metrics.

    Runs all traditional metrics together for complete quality assessment.
    Fast (seconds), free ($0), no LLM required.

    Note: Uses cached_traditional_responses to avoid redundant API calls.
    """
    results = {
        "exact_match": [],
        "bleu": [],
        "rouge": [],
        "string_similarity": [],
    }

    # Collect all metrics for each test case
    for item in cached_traditional_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )

        # Calculate all metrics
        results["exact_match"].append(
            await exact_match_scorer.single_turn_ascore(sample)
        )
        results["bleu"].append(
            await bleu_scorer.single_turn_ascore(sample)
        )
        results["rouge"].append(
            await rouge_scorer.single_turn_ascore(sample)
        )
        results["string_similarity"].append(
            await string_similarity_scorer.single_turn_ascore(sample)
        )

    # Calculate averages
    avg_results = {
        metric: sum(scores) / len(scores)
        for metric, scores in results.items()
    }

    # Print comprehensive results
    print(f"\n{'='*60}")
    print("REAL RAG COMPREHENSIVE TRADITIONAL EVALUATION")
    print(f"{'='*60}")

    all_passed = True
    metric_configs = {
        "exact_match": "exact_match_threshold",
        "bleu": "bleu_threshold",
        "rouge": "rouge_threshold",
        "string_similarity": "string_similarity_threshold",
    }

    for metric_name, score in avg_results.items():
        threshold_key = metric_configs.get(metric_name)
        if threshold_key and threshold_key in traditional_evaluation_config:
            threshold = traditional_evaluation_config[threshold_key]
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
    print(f"Execution: Fast (seconds)")
    print(f"Cost: $0.00")
    print(f"{'='*60}\n")
