"""
Lexical test data for non-LLM Ragas evaluation of RAG system.

This module contains simple factual questions about YOUR ACTUAL DOCUMENTS.
These will be sent to the production /api/v1/chat/stream endpoint for evaluation
using lexical/statistical metrics (BLEU, ROUGE, exact match, etc.).

IMPORTANT: Update these questions based on the documents you've loaded into Weaviate!

Test Types:
- "answer": Test the answer field (full text response) with BLEU/ROUGE
- "boolean": Test the boolean_answer field (yes/no) with exact match
- "entities": Test the entities field (list of key facts) with set comparison
"""

from typing import Any

# Factual questions for testing the real RAG system with lexical metrics
LEXICAL_TEST_CASES: list[dict[str, Any]] = [
    {
        "user_input": "What is the MVP Scope & Feature List deliverable about?",
        "reference": "Comprehensive definition of MVP features, grouped by priority with clear success boundaries and measurable success metrics (e.g., MVP validation goals, user flow coverage).",
        "test_type": "answer",
    },
    {
        "user_input": "What does the User Stories & Acceptance Criteria deliverable contain?",
        "reference": "High-level user stories with clear acceptance criteria that define what functionality must be delivered and how success will be measured.",
        "test_type": "answer",
    },
    {
        "user_input": "What are the focus areas for Week 2 and Week 3 in the operating model?",
        "reference": "Week 2 focuses on MVP scope validation and user story drafting. Week 3 focuses on final MVP scope review and sign-off preparation.",
        "test_type": "answer",
    },
    {
        "user_input": "Who is responsible and accountable for the Week 2 deliverables?",
        "reference": "Duygu Efsora PM is both responsible and accountable for Week 2, with George and Faran consulted, and Hennie Habib informed.",
        "test_type": "answer",
    },
    {
        "user_input": "Is the MVP Scope & Feature List deliverable jointly owned?",
        "reference": "yes",
        "test_type": "boolean",
    },
    {
        "user_input": "What are the two key deliverable types mentioned in section 3?",
        "reference": "MVP Scope & Feature List, User Stories & Acceptance Criteria",
        "test_type": "entities",
    },
    {
        "user_input": "Which weeks are mentioned in the Architecture planning phase?",
        "reference": "Week 2, Week 3",
        "test_type": "entities",
    },
]
