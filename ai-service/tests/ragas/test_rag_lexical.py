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


def _truncate(text: str, max_len: int = 80) -> str:
    """Truncate text for display, adding ellipsis if needed."""
    if max_len == 0 or len(text) <= max_len:
        return text
    return text[: max_len - 3] + "..."


def _wrap_text(text: str, width: int = 70, indent: str = "             ") -> str:
    """Wrap text to multiple lines with indentation for readability."""
    if len(text) <= width:
        return text

    lines = []
    current_line = ""
    words = text.split()

    for word in words:
        if len(current_line) + len(word) + 1 <= width:
            current_line += (" " if current_line else "") + word
        else:
            if current_line:
                lines.append(current_line)
            current_line = word

    if current_line:
        lines.append(current_line)

    return ("\n" + indent).join(lines)


def _print_question_result(
    idx: int,
    total: int,
    question: str,
    score: float,
    threshold: float,
    reference: str | None = None,
    response: str | None = None,
) -> None:
    """Print per-question result with details for failing questions."""
    passed = score >= threshold
    status = "✓" if passed else "✗"
    print(f"\n  {status} Q{idx}/{total}: {_truncate(question, 70)}")
    print(f"       Score: {score:.3f} (threshold: {threshold})")

    # Show reference and response for failing questions to help AI team debug
    if not passed and reference and response:
        print(f"       Expected: {_truncate(reference, 60)}")
        print(f"       Got:      {_truncate(response, 60)}")


@pytest.mark.asyncio
@pytest.mark.integration
async def test_bleu_score(
    lexical_test_responses: list[dict[str, Any]],
    bleu_scorer: BleuScore,
    lexical_config: dict[str, Any],
) -> None:
    """
    Test BLEU score for n-gram overlap from RAG system.
    Only applies to answer-type questions.
    """
    answer_responses = [
        item for item in lexical_test_responses if item.get("test_type") == "answer"
    ]

    if not answer_responses:
        pytest.skip("No answer-type questions in test data")

    threshold = lexical_config["bleu_threshold"]
    scores: list[tuple[dict[str, Any], float]] = []

    for item in answer_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )
        score = await bleu_scorer.single_turn_ascore(sample)
        scores.append((item, score))

    # Print results
    print(f"\n{'='*60}")
    print("BLEU SCORE (n-gram precision)")
    print(f"{'='*60}")

    failed_questions = []
    for idx, (item, score) in enumerate(scores, 1):
        passed = score >= threshold
        if not passed:
            failed_questions.append((item, score))
        _print_question_result(
            idx,
            len(scores),
            item["user_input"],
            score,
            threshold,
            item["reference"] if not passed else None,
            item["response"] if not passed else None,
        )

    avg_score = sum(s for _, s in scores) / len(scores)
    print(
        f"\n  Average: {avg_score:.3f} | Passed: {len(scores) - len(failed_questions)}/{len(scores)}"
    )
    print(f"{'='*60}")

    assert avg_score >= threshold, (
        f"BLEU avg {avg_score:.3f} < {threshold}. "
        f"Failed questions: {[q['user_input'][:50] for q, _ in failed_questions]}"
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
    Only applies to answer-type questions.
    """
    answer_responses = [
        item for item in lexical_test_responses if item.get("test_type") == "answer"
    ]

    if not answer_responses:
        pytest.skip("No answer-type questions in test data")

    threshold = lexical_config["rouge_threshold"]
    scores: list[tuple[dict[str, Any], float]] = []

    for item in answer_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )
        score = await rouge_scorer.single_turn_ascore(sample)
        scores.append((item, score))

    # Print results
    print(f"\n{'='*60}")
    print("ROUGE-L SCORE (recall-oriented overlap)")
    print(f"{'='*60}")

    failed_questions = []
    for idx, (item, score) in enumerate(scores, 1):
        passed = score >= threshold
        if not passed:
            failed_questions.append((item, score))
        _print_question_result(
            idx,
            len(scores),
            item["user_input"],
            score,
            threshold,
            item["reference"] if not passed else None,
            item["response"] if not passed else None,
        )

    avg_score = sum(s for _, s in scores) / len(scores)
    print(
        f"\n  Average: {avg_score:.3f} | Passed: {len(scores) - len(failed_questions)}/{len(scores)}"
    )
    print(f"{'='*60}")

    assert avg_score >= threshold, (
        f"ROUGE avg {avg_score:.3f} < {threshold}. "
        f"Failed questions: {[q['user_input'][:50] for q, _ in failed_questions]}"
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_boolean_answer(
    lexical_test_responses: list[dict[str, Any]],
    lexical_config: dict[str, Any],
) -> None:
    """
    Test boolean answer accuracy using exact match.
    For yes/no questions only.
    """
    boolean_responses = [
        item for item in lexical_test_responses if item.get("test_type") == "boolean"
    ]

    if not boolean_responses:
        pytest.skip("No boolean-type questions in test data")

    threshold = lexical_config.get("boolean_match_threshold", 1.0)
    scores: list[tuple[dict[str, Any], float]] = []

    for item in boolean_responses:
        reference = item["reference"].strip().lower()
        response = item["response"].strip().lower()
        score = 1.0 if reference == response else 0.0
        scores.append((item, score))

    # Print results
    print(f"\n{'='*60}")
    print("BOOLEAN MATCH (exact yes/no)")
    print(f"{'='*60}")

    failed_questions = []
    for idx, (item, score) in enumerate(scores, 1):
        passed = score >= threshold
        if not passed:
            failed_questions.append((item, score))
        _print_question_result(
            idx,
            len(scores),
            item["user_input"],
            score,
            threshold,
            f"Expected: {item['reference']}" if not passed else None,
            f"Got: {item['response']}" if not passed else None,
        )

    avg_score = sum(s for _, s in scores) / len(scores)
    print(
        f"\n  Average: {avg_score:.3f} | Passed: {len(scores) - len(failed_questions)}/{len(scores)}"
    )
    print(f"{'='*60}")

    assert avg_score >= threshold, (
        f"Boolean avg {avg_score:.3f} < {threshold}. "
        f"Failed questions: {[q['user_input'][:50] for q, _ in failed_questions]}"
    )


@pytest.mark.asyncio
@pytest.mark.integration
async def test_entity_extraction(
    lexical_test_responses: list[dict[str, Any]],
    lexical_config: dict[str, Any],
) -> None:
    """
    Test entity extraction accuracy using subset matching.
    For entity-type questions only.
    """
    entity_responses = [
        item for item in lexical_test_responses if item.get("test_type") == "entities"
    ]

    if not entity_responses:
        pytest.skip("No entity-type questions in test data")

    threshold = lexical_config.get("entity_match_threshold", 1.0)
    scores: list[tuple[dict[str, Any], float, set[str], set[str]]] = []

    for item in entity_responses:
        reference_text = item["reference"]
        response_text = item["response"]

        ref_entities = {e.strip().lower() for e in reference_text.split(",") if e.strip()}
        resp_entities = {e.strip().lower() for e in response_text.split(",") if e.strip()}

        found_entities = ref_entities & resp_entities
        expected_count = len(ref_entities)
        found_count = len(found_entities)

        score = found_count / expected_count if expected_count > 0 else 0.0
        scores.append((item, score, ref_entities, resp_entities))

    # Print results
    print(f"\n{'='*60}")
    print("ENTITY EXTRACTION (subset matching)")
    print(f"{'='*60}")

    failed_questions = []
    for idx, (item, score, ref_ent, resp_ent) in enumerate(scores, 1):
        passed = score >= threshold
        if not passed:
            failed_questions.append((item, score))
            missing = ref_ent - resp_ent
            print(f"\n  ✗ Q{idx}/{len(scores)}: {_truncate(item['user_input'], 70)}")
            print(f"       Score: {score:.3f} (threshold: {threshold})")
            print(f"       Expected: {ref_ent}")
            print(f"       Got:      {resp_ent}")
            print(f"       Missing:  {missing}")
        else:
            print(f"\n  ✓ Q{idx}/{len(scores)}: {_truncate(item['user_input'], 70)}")
            print(f"       Score: {score:.3f} (threshold: {threshold})")

    avg_score = sum(s for _, s, _, _ in scores) / len(scores)
    print(
        f"\n  Average: {avg_score:.3f} | Passed: {len(scores) - len(failed_questions)}/{len(scores)}"
    )
    print(f"{'='*60}")

    assert avg_score >= threshold, (
        f"Entity avg {avg_score:.3f} < {threshold}. "
        f"Failed questions: {[q['user_input'][:50] for q, _ in failed_questions]}"
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
    Comprehensive lexical evaluation with per-question failure details.
    Shows which specific questions failed for AI team debugging.
    """
    # Store per-question results for detailed output
    question_results: list[dict[str, Any]] = []

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

    # Evaluate answer-type questions (BLEU + ROUGE)
    for item in answer_responses:
        sample = SingleTurnSample(
            user_input=item["user_input"],
            response=item["response"],
            reference=item["reference"],
        )
        bleu = await bleu_scorer.single_turn_ascore(sample)
        rouge = await rouge_scorer.single_turn_ascore(sample)

        bleu_pass = bleu >= lexical_config["bleu_threshold"]
        rouge_pass = rouge >= lexical_config["rouge_threshold"]

        question_results.append(
            {
                "question": item["user_input"],
                "type": "answer",
                "reference": item["reference"],
                "response": item["response"],
                "scores": {"bleu": bleu, "rouge": rouge},
                "passed": bleu_pass and rouge_pass,
                "failures": [
                    (
                        f"BLEU {bleu:.3f} < {lexical_config['bleu_threshold']}"
                        if not bleu_pass
                        else None
                    ),
                    (
                        f"ROUGE {rouge:.3f} < {lexical_config['rouge_threshold']}"
                        if not rouge_pass
                        else None
                    ),
                ],
            }
        )

    # Evaluate entity-type questions
    for item in entity_responses:
        ref_entities = {e.strip().lower() for e in item["reference"].split(",") if e.strip()}
        resp_entities = {e.strip().lower() for e in item["response"].split(",") if e.strip()}
        found = ref_entities & resp_entities
        score = len(found) / len(ref_entities) if ref_entities else 0.0
        threshold = lexical_config.get("entity_match_threshold", 1.0)
        passed = score >= threshold

        question_results.append(
            {
                "question": item["user_input"],
                "type": "entities",
                "reference": ref_entities,
                "response": resp_entities,
                "missing": ref_entities - resp_entities,
                "scores": {"entity": score},
                "passed": passed,
                "failures": [f"Entity {score:.3f} < {threshold}"] if not passed else [],
            }
        )

    # Evaluate boolean-type questions
    for item in boolean_responses:
        ref = item["reference"].strip().lower()
        resp = item["response"].strip().lower()
        score = 1.0 if ref == resp else 0.0
        threshold = lexical_config.get("boolean_match_threshold", 1.0)
        passed = score >= threshold

        question_results.append(
            {
                "question": item["user_input"],
                "type": "boolean",
                "reference": ref,
                "response": resp,
                "scores": {"boolean": score},
                "passed": passed,
                "failures": [f"Expected '{ref}', got '{resp}'"] if not passed else [],
            }
        )

    # Print summary
    failed = [q for q in question_results if not q["passed"]]
    passed_count = len(question_results) - len(failed)

    print(f"\n{'='*60}")
    print("LEXICAL EVALUATION SUMMARY")
    print(f"{'='*60}")
    print(f"  Total: {len(question_results)} | Passed: {passed_count} | Failed: {len(failed)}")

    # Only show detailed output for failures
    if failed:
        print(f"\n{'─'*70}")
        print("FAILED QUESTIONS (for fine-tuning)")
        print(f"{'─'*70}")

        for idx, q in enumerate(failed, 1):
            print(f"\n  [{idx}] {q['type'].upper()}: {q['question']}")
            for failure in q["failures"]:
                if failure:
                    print(f"      ✗ {failure}")

            if q["type"] == "answer":
                print("\n      Reference:")
                print(f"        {_wrap_text(str(q['reference']), 65, '        ')}")
                print("\n      Got:")
                print(f"        {_wrap_text(str(q['response']), 65, '        ')}")
            elif q["type"] == "entities":
                print(f"      Expected: {q['reference']}")
                print(f"      Got:      {q['response']}")
                print(f"      Missing:  {q['missing']}")
            elif q["type"] == "boolean":
                print(f"      Expected: '{q['reference']}'")
                print(f"      Got:      '{q['response']}'")

    print(f"\n{'='*70}")

    # Assert all passed
    assert not failed, (
        f"{len(failed)} question(s) failed. "
        f"Questions: {[_truncate(q['question'], 40) for q in failed]}"
    )
