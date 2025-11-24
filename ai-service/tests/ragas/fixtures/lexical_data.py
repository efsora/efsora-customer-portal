"""
Lexical test data for non-LLM Ragas evaluation of RAG system.

This module contains simple factual questions about YOUR ACTUAL DOCUMENTS.
These will be sent to the production /api/v1/chat/stream endpoint for evaluation
using lexical/statistical metrics (BLEU, ROUGE, exact match, etc.).

IMPORTANT: Update these questions based on the documents you've loaded into Weaviate!
"""

from typing import Any

# Factual questions for testing the real RAG system with lexical metrics
LEXICAL_TEST_CASES: list[dict[str, Any]] = [
    {
        "user_input": "Who are the parties to the agreement, and who is defined as the 'Contractor'?",
        "reference": "[Client Legal Name] ('Client') and Efsora Teknoloji A.S. ('Contractor').",
    },
    {
        "user_input": "What is the term of the Agreement, and what is the condition for renewal?",
        "reference": "The Agreement has an 'Initial Term' of one year. It automatically renews for additional one-year terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.",
    },
    {
        "user_input": "In what formats and where is the Contractor obligated to deliver the software (Software) developed to the Client?",
        "reference": "The Contractor is obligated to provide the Software in both 'object code' and 'source code' form and make it continuously available through the Client's GitHub repository account",
    },
    {
        "user_input": "What is the process if the Client does not accept (rejects) a 'Deliverable' provided by the Contractor?",
        "reference": "The Client has 15 days to evaluate the Deliverable. If rejected, the Client will provide a 'Rejection Notice' detailing the nonconformities, and the Contractor must, at its sole expense, cure these nonconformities within 5 days of receiving the notice.",
    },
    {
        "user_input": "What condition must the Contractor meet if it wishes to use subcontractors in the project?",
        "reference": "The Contractor may only use subcontractors upon receiving the Client's prior written approval.",
    },
]
