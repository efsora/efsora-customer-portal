"""
LLM-judged test data for semantic Ragas evaluation of RAG system.

This module contains complex questions about YOUR ACTUAL DOCUMENTS that require
semantic understanding and contextual reasoning. These will be sent to the
production /api/v1/chat/stream endpoint and evaluated by Claude as an LLM judge.

IMPORTANT: Update these questions based on the documents you've loaded into Weaviate!

Test Types:
- "answer": Test the answer field (full text response) - most common for LLM-judged tests
- "boolean": Test the boolean_answer field (yes/no) with exact match
- "entities": Test the entities field (list of key facts) with set comparison
"""

from typing import Any

# Questions for testing the real RAG system with LLM-judged metrics
LLM_JUDGED_TEST_CASES: list[dict[str, Any]] = [
    {
        "user_input": "Explain the purpose and benefits of having joint ownership for the MVP Scope & Feature List deliverable.",
        "reference": "Joint ownership of the MVP Scope & Feature List ensures that both the client and Efsora have shared responsibility and input in defining the project's core features and success metrics. This collaborative approach helps align expectations, ensures both parties are invested in the MVP's success, and prevents scope creep by establishing clear boundaries with measurable metrics from the outset. It also facilitates better communication and decision-making throughout the project lifecycle.",
        "test_type": "answer",
    },
    {
        "user_input": "Analyze the importance of having clear acceptance criteria in user stories for project success.",
        "reference": "Clear acceptance criteria in user stories are crucial for project success as they define specific, measurable conditions that must be met for a feature to be considered complete. This eliminates ambiguity between stakeholders, provides testable requirements, enables accurate estimation and planning, and ensures that delivered functionality aligns with business needs. Acceptance criteria also serve as a contract between the development team and stakeholders, reducing misunderstandings and rework.",
        "test_type": "answer",
    },
    {
        "user_input": "Interpret the RACI structure shown in Week 2 and Week 3 activities and explain why this model is effective for project governance.",
        "reference": "The RACI matrix (Responsible, Accountable, Consulted, Informed) provides clear role definition for each activity. Duygu Efsora PM is shown as both Responsible (doing the work) and Accountable (owns the outcome) for Weeks 2-3. This structure is effective because it eliminates confusion about who makes decisions, who performs tasks, and who needs to be kept informed. Having Duygu in both R and A roles indicates direct ownership and accountability, while George and Faran as Consulted stakeholders provide input, and Hennie Habib as Informed stays aware of progress without being involved in execution.",
        "test_type": "answer",
    },
    {
        "user_input": "Evaluate the strategic progression from Week 2 (MVP scope validation) to Week 3 (final review and sign-off preparation). Why is this sequence important?",
        "reference": "The progression from Week 2 to Week 3 follows a logical validation-then-commitment flow. Week 2 focuses on validating the MVP scope and drafting user stories, which allows the team to explore requirements, identify risks, and refine understanding before making commitments. Week 3 then shifts to final review and sign-off preparation, ensuring all stakeholders are aligned before formal commitment. This sequence is critical because it prevents premature commitment to poorly understood requirements, allows time for iterative refinement based on stakeholder feedback, and ensures that the sign-off in Week 3 is based on validated, well-understood scope rather than initial assumptions.",
        "test_type": "answer",
    },
    {
        "user_input": "Why is it important to group MVP features by priority with clear success boundaries, and what risks does this mitigate?",
        "reference": "Grouping MVP features by priority with clear success boundaries is essential for managing scope and delivering value incrementally. It mitigates several critical risks: scope creep (by defining clear boundaries), resource waste (by focusing on high-priority items first), missed deadlines (by enabling trade-offs based on priority), and unclear success metrics (by establishing measurable validation goals). This approach also enables the team to deliver a functional MVP even if time or resources become constrained, as lower-priority features can be deferred while core functionality remains intact. Clear success boundaries ensure that all stakeholders understand what constitutes a successful MVP delivery.",
        "test_type": "answer",
    },
]
