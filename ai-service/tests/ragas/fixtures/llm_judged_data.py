"""
LLM-judged test data for semantic Ragas evaluation of RAG system.

This module contains complex questions about YOUR ACTUAL DOCUMENTS that require
semantic understanding and contextual reasoning. These will be sent to the
production /api/v1/chat/stream endpoint and evaluated by Claude as an LLM judge.

IMPORTANT: Update these questions based on the documents you've loaded into Weaviate!
"""

from typing import Any

# Questions for testing the real RAG system with LLM-judged metrics
LLM_JUDGED_TEST_CASES: list[dict[str, Any]] = [
    {
        "user_input": "Interpret the options available to the Client  if it rejects a 'Deliverable' for the third time, and the advantages these options provide to the Client.",
        "reference": "After a third rejection, the Client has two options: (a) accept the Deliverable as a nonconforming item, in which case the Fees shall be equitably reduced to reflect the value of the Deliverable as received relative to the value it would have had if it conformed, or (b) terminate the Agreement without further liability to the Contractor.Advantage: This grants the Client maximum flexibility. If the product, despite its flaws, still holds some value, option (a) allows them to use the product and gain a financial advantage (cost reduction). If the product is entirely unusable or if trust in the Contractor's competence is lost, option (b) provides a clear exit strategy, ensuring the Client does not waste further time or money.",
    },
    {
        "user_input": "Why does the Agreement so strictly restrict the Contractor's use of Open Source Components?",
        "reference": "The primary purpose of these restrictions is to protect the intellectual property rights of the Client's proprietary 'Work Product'. Some 'copyleft' open-source licenses mandate that any software using that code must also have its source code made public or be licensed for free. This clause is intended to prevent the Client from being forced to (i) disclose its own proprietary source code, (ii) license its software for the purpose of making derivative works, (iii) distribute its software without royalty, or (iv) grant a license under its patent rights.",
    },
    {
        "user_input": "Evaluate the balance between Ownership of Work Product and Contractor Know-How from the perspective of the Contractor (Efsora).",
        "reference": "The agreement grants the Client complete ownership of everything specifically developed for them (the 'Work Product'). This prevents the Contractor from reusing that specific code elsewhere. However, a crucial balance is provided: 'Generic Tools' (the Contractor's general know-how, skills, and expertise) that do not use any Client Confidential Information or IP rights, remain with the Contractor. This allows the Contractor (Efsora) to retain its core competencies and general experience to continue serving other clients. The Contractor may use these Generic Tools for other projects, as long as they do not reuse proprietary components developed exclusively for the Client.",
    },
    {
        "user_input": "What level of control does the first Statement of Work (Exhibit A) give the Client over the project team, and why is this important?",
        "reference": "This section gives the Client very strong operational control. The Client has the right to conduct Performance Review Periods at the one, three, and six-month marks. Following these reviews, the Client may, at Client's sole discretion, request that a specific team member be substituted or removed based on performance. The Contractor must then replace that team member within ten (10) business days.This means the Client can audit not just the delivered product, but also the quality of the team producing it. Instead of just waiting for a failed outcome, the Client has the right to intervene early in the human resource element that directly impacts the project's quality.",
    },
    {
        "user_input": "Why might the 'Limitation of Liability' clause not provide as strong protection for the Contractor (Efsora) as it first appears?",
        "reference": "At first glance, this clause appears to protect both parties from indirect or consequential damages (like lost profits). However, the exceptions to this limitation are very risky for the Contractor. The limitation does not apply to: (a) gross negligence, (b) breaches of Proprietary Rights or Confidentiality, and (c) the indemnification obligations. In practice, the Contractor's biggest risks are precisely things like intellectual property infringement or leaking client data. Since these areas are excluded from the limitation, the Contractor would be liable for all damages (direct or indirect) that the Client suffers from such a breach.",
    },
]
