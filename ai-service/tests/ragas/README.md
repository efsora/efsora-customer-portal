# RAGAS RAG Evaluation Tests

Automated quality tests for the RAG (Retrieval-Augmented Generation) system using [RAGAS](https://docs.ragas.io/).

## Why RAGAS?

We use RAGAS for **all** RAG tests (both lexical and LLM-judged) because:

- **One unified framework** - Same data format, same fixtures, one mental model
- **No custom code to maintain** - RAGAS implements BLEU, ROUGE, faithfulness, etc.
- **Industry standard** - Used by LangChain, LlamaIndex, and major AI companies
- **Catches real issues** - Hallucinations, retrieval failures, off-topic responses

Simple string matching (`assert "keyword" in response`) doesn't work for LLM outputs because responses vary each time.

## Test Suites

| Test File | Metrics | Speed | Cost | AWS Required |
|-----------|---------|-------|------|--------------|
| `test_rag_lexical.py` | BLEU, ROUGE, boolean match, entity extraction | ~25s | Free | No |
| `test_rag_llm_judged.py` | Answer relevancy, correctness, faithfulness, context precision/recall | ~3-5min | ~$0.10-0.50 | Yes |

## Quick Start

### Prerequisites

1. Docker services running:
   ```bash
   docker-compose up -d
   ```

2. Weaviate has documents loaded (tests will fail with empty vectorstore)

### Run Lexical Tests (Fast, Free)

```bash
POSTGRES_HOST=localhost WEAVIATE_HOST=localhost \
  uv run pytest tests/ragas/test_rag_lexical.py -v
```

### Run LLM-Judged Tests (Requires AWS)

```bash
POSTGRES_HOST=localhost WEAVIATE_HOST=localhost \
  AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy \
  uv run pytest tests/ragas/test_rag_llm_judged.py -v
```

## Directory Structure

```
tests/ragas/
├── README.md                    # This file
├── conftest.py                  # Fixtures (API client, scorers, thresholds)
├── fixtures/
│   ├── lexical_data.py          # Test questions for lexical evaluation
│   └── llm_judged_data.py       # Test questions for LLM evaluation
├── test_rag_lexical.py          # BLEU, ROUGE, boolean, entity tests
└── test_rag_llm_judged.py       # Semantic evaluation tests
```

## Test Data

Test questions are defined in `fixtures/`. Each test case has:

```python
{
    "user_input": "What is the MVP Scope?",           # Question to ask RAG
    "reference": "Comprehensive definition of...",    # Expected answer
    "test_type": "answer",                            # answer | boolean | entities
}
```

**Test types:**
- `answer` - Full text response, evaluated with BLEU/ROUGE
- `boolean` - Yes/no question, evaluated with exact match
- `entities` - List extraction, evaluated with set comparison

## Metrics Explained

### Lexical Tests (Free)

| Metric | What It Measures |
|--------|------------------|
| **BLEU** | N-gram overlap between response and reference |
| **ROUGE** | Longest common subsequence (key info presence) |
| **Boolean Match** | Exact yes/no answer correctness |
| **Entity Match** | Expected entities found in response |

### LLM-Judged Tests (Requires AWS)

| Metric | What It Measures |
|--------|------------------|
| **Answer Relevancy** | Does response address the question? |
| **Answer Correctness** | Is response factually correct? |
| **Faithfulness** | Is response grounded in context (no hallucination)? |
| **Context Precision** | Are retrieved docs relevant? |
| **Context Recall** | Did retriever find all needed info? |

## Thresholds

Configured in `conftest.py`:

```python
# Lexical thresholds
"bleu_threshold": 0.25,
"rouge_threshold": 0.5,
"boolean_match_threshold": 1.0,
"entity_match_threshold": 0.0,  # Disabled until entities field is fixed

# LLM-judged thresholds
"answer_relevancy_threshold": 0.7,
"answer_correctness_threshold": 0.7,
"faithfulness_threshold": 0.7,
"context_precision_threshold": 0.6,
"context_recall_threshold": 0.6,
```

## Troubleshooting

### Tests fail with connection errors
- Ensure Docker services are running: `docker-compose up -d`
- Use `POSTGRES_HOST=localhost WEAVIATE_HOST=localhost` when running from host

### Different results on different machines
- Check Weaviate has documents: `curl http://localhost:8080/v1/objects?class=EfsoraDocs`
- LLM responses vary due to temperature (0.3) - thresholds account for this

### LLM-judged tests skipped
- Set AWS credentials: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

## CI/CD

Lexical tests run on every PR (fast, free). LLM-judged tests run on merge to master:

```yaml
jobs:
  lexical-tests:
    runs-on: ubuntu-latest
    steps:
      - run: docker-compose up -d
      - run: |
          POSTGRES_HOST=localhost WEAVIATE_HOST=localhost \
            uv run pytest tests/ragas/test_rag_lexical.py -v

  llm-judged-tests:
    if: github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
      - run: docker-compose up -d
      - run: |
          POSTGRES_HOST=localhost WEAVIATE_HOST=localhost \
            uv run pytest tests/ragas/test_rag_llm_judged.py -v
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Further Reading

- [RAGAS Documentation](https://docs.ragas.io/)
- [RAGAS Metrics](https://docs.ragas.io/en/stable/concepts/metrics/)
