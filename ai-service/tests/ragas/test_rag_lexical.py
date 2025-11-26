"""
Lexical (non-LLM) RAG evaluation tests using BLEU, ROUGE, and exact match metrics.

Run these tests with Docker services running:
    POSTGRES_HOST=localhost WEAVIATE_HOST=localhost uv run pytest tests/ragas/test_rag_lexical.py -v

These tests are fast (~25s), free (no AWS costs), and don't require AWS credentials.
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

    Only applies to answer-type questions (not entities or boolean).

    Note: Uses lexical_test_responses to avoid redundant API calls.
    """
    # Filter for answer-type questions only
    answer_responses = [
        item for item in lexical_test_responses if item.get("test_type") == "answer"
    ]

    if not answer_responses:
        pytest.skip("No answer-type questions in test data")

    scores = []

    for item in answer_responses:
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
    print(f"Test cases: {len(scores)} (answer-type only)")
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

    Only applies to answer-type questions (not entities or boolean).

    Note: Uses lexical_test_responses to avoid redundant API calls.
    """
    # Filter for answer-type questions only
    answer_responses = [
        item for item in lexical_test_responses if item.get("test_type") == "answer"
    ]

    if not answer_responses:
        pytest.skip("No answer-type questions in test data")

    scores = []

    for item in answer_responses:
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
    print(f"Test cases: {len(scores)} (answer-type only)")
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
async def test_boolean_answer(
    lexical_test_responses: list[dict[str, Any]],
    lexical_config: dict[str, Any],
) -> None:
    """
    Test boolean answer accuracy using exact match.

    For yes/no questions, checks if the RAG system correctly returns
    "yes" or "no" in the boolean_answer field.

    Exact match: score = 1.0 if response == reference, else 0.0

    Note: Uses lexical_test_responses to avoid redundant API calls.
    """
    # Filter for boolean-type questions only
    boolean_responses = [
        item for item in lexical_test_responses if item.get("test_type") == "boolean"
    ]

    if not boolean_responses:
        pytest.skip("No boolean-type questions in test data")

    scores = []

    for item in boolean_responses:
        reference = item["reference"].strip().lower()
        response = item["response"].strip().lower()

        # Exact match for boolean answers
        score = 1.0 if reference == response else 0.0
        scores.append(score)

    avg_score = sum(scores) / len(scores)

    print(f"\n{'='*60}")
    print("RAG LEXICAL EVALUATION - BOOLEAN ANSWER")
    print(f"{'='*60}")
    print(f"Test cases: {len(scores)}")
    print(f"Average boolean match: {avg_score:.3f}")
    print(f"Min boolean match: {min(scores):.3f}")
    print(f"Max boolean match: {max(scores):.3f}")
    print(f"{'='*60}\n")

    threshold = lexical_config.get("boolean_match_threshold", 1.0)
    assert avg_score >= threshold, (
        f"Boolean match score {avg_score:.3f} below threshold {threshold}. "
        "Some yes/no questions are answered incorrectly."
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_entity_extraction(
    lexical_test_responses: list[dict[str, Any]],
    lexical_config: dict[str, Any],
) -> None:
    """
    Test entity extraction accuracy using subset matching.

    For entity-based questions, checks if all expected entities are present
    in the response (doesn't penalize extra entities).

    Subset matching: score = found_count / expected_count
    - Reference: {"15 days", "Deliverable"}
    - Response: {"15 days", "Deliverable", "Client"}
    - Score: 2/2 = 1.0 ✅ (all expected entities found)

    Note: Uses lexical_test_responses to avoid redundant API calls.
    """
    # Filter for entity-type questions only
    entity_responses = [
        item for item in lexical_test_responses if item.get("test_type") == "entities"
    ]

    if not entity_responses:
        pytest.skip("No entity-type questions in test data")

    scores = []

    for item in entity_responses:
        # Parse reference entities (comma-separated)
        reference_text = item["reference"]
        response_text = item["response"]

        # Convert to sets (lowercase, trimmed)
        ref_entities = {e.strip().lower() for e in reference_text.split(",") if e.strip()}
        resp_entities = {e.strip().lower() for e in response_text.split(",") if e.strip()}

        # Subset matching: how many reference entities were found?
        found_entities = ref_entities & resp_entities
        expected_count = len(ref_entities)
        found_count = len(found_entities)

        # Score: ratio of found entities to expected entities
        score = found_count / expected_count if expected_count > 0 else 0.0
        scores.append(score)

    avg_score = sum(scores) / len(scores)

    print(f"\n{'='*60}")
    print("RAG LEXICAL EVALUATION - ENTITY EXTRACTION")
    print(f"{'='*60}")
    print(f"Test cases: {len(scores)}")
    print(f"Average entity match: {avg_score:.3f}")
    print(f"Min entity match: {min(scores):.3f}")
    print(f"Max entity match: {max(scores):.3f}")
    print(f"{'='*60}\n")

    threshold = lexical_config.get("entity_match_threshold", 1.0)
    assert avg_score >= threshold, (
        f"Entity match score {avg_score:.3f} below threshold {threshold}. "
        "Some expected entities are missing from responses."
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

    Applies the appropriate metric based on test_type:
    - "answer" → BLEU and ROUGE (n-gram overlap)
    - "entities" → Entity subset matching
    - "boolean" → Exact match

    Fast (seconds), free ($0), no LLM required.

    Note: Uses lexical_test_responses to avoid redundant API calls.
    """
    results: dict[str, list[float]] = {
        "bleu": [],
        "rouge": [],
        "entity_match": [],
        "boolean_match": [],
    }

    # Filter responses by test type
    answer_responses = [
        item for item in lexical_test_responses if item.get("test_type") == "answer"
    ]
    entity_responses = [
        item for item in lexical_test_responses if item.get("test_type") == "entities"
    ]
    boolean_responses = [
        item for item in lexical_test_responses if item.get("test_type") == "boolean"
    ]

    # Calculate BLEU/ROUGE for answer-type questions only
    for item in answer_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )
        results["bleu"].append(await bleu_scorer.single_turn_ascore(sample))
        results["rouge"].append(await rouge_scorer.single_turn_ascore(sample))

    # Calculate entity matching for entity-type questions only
    for item in entity_responses:
        reference_text = item["reference"]
        response_text = item["response"]

        # Convert to sets (lowercase, trimmed)
        ref_entities = {e.strip().lower() for e in reference_text.split(",") if e.strip()}
        resp_entities = {e.strip().lower() for e in response_text.split(",") if e.strip()}

        # Subset matching
        found_entities = ref_entities & resp_entities
        expected_count = len(ref_entities)
        found_count = len(found_entities)

        score = found_count / expected_count if expected_count > 0 else 0.0
        results["entity_match"].append(score)

    # Calculate boolean matching for boolean-type questions only
    for item in boolean_responses:
        reference = item["reference"].strip().lower()
        response = item["response"].strip().lower()

        # Exact match for boolean answers
        score = 1.0 if reference == response else 0.0
        results["boolean_match"].append(score)

    # Calculate averages (only for metrics that have data)
    avg_results = {
        metric: sum(scores) / len(scores) for metric, scores in results.items() if scores
    }

    # Print comprehensive results
    print(f"\n{'='*60}")
    print("RAG COMPREHENSIVE LEXICAL EVALUATION")
    print(f"{'='*60}")
    print(f"Answer-type questions: {len(answer_responses)}")
    print(f"Entity-type questions: {len(entity_responses)}")
    print(f"Boolean-type questions: {len(boolean_responses)}")
    print(f"Total test cases: {len(lexical_test_responses)}")
    print(f"{'='*60}")

    all_passed = True
    metric_configs = {
        "bleu": "bleu_threshold",
        "rouge": "rouge_threshold",
        "entity_match": "entity_match_threshold",
        "boolean_match": "boolean_match_threshold",
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
