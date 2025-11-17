## Ragas RAG Evaluation Test Suite

Comprehensive test suites for evaluating RAG (Retrieval-Augmented Generation) systems and chatbots using [Ragas](https://docs.ragas.io/).

### Overview

This testing framework provides **two types of test suites** for evaluating your real RAG system:

| Test Suite | Metrics | Speed | Cost | Use Case |
|------------|---------|-------|------|----------|
| **Semantic** | LLM-based (AWS Bedrock Claude) | Slow (min) | $$$ | Test actual RAG pipeline with complex questions requiring semantic understanding |
| **Traditional** | Non-LLM (BLEU, ROUGE, etc.) | Fast (sec) | Free | Test actual RAG pipeline with factual questions using lexical matching |

### Directory Structure

```
tests/ragas/
├── README.md                           # This file
├── AWS_SETUP.md                        # AWS Bedrock configuration guide
├── __init__.py
├── conftest.py                         # Pytest fixtures (AWS Bedrock LLM, traditional metrics, real RAG)
├── fixtures/
│   ├── __init__.py
│   ├── real_semantic_data.py          # Questions about YOUR actual documents (semantic)
│   └── real_traditional_data.py       # Questions about YOUR actual documents (factual)
├── test_rag_real_semantic.py          # Semantic tests (LLM-based evaluation)
└── test_rag_real_traditional.py       # Traditional tests (lexical evaluation)
```

## Setup

### 1. Install Dependencies

```bash
cd ai-service
uv sync
```

This installs:
- `ragas>=0.2.0` - RAG evaluation framework
- `langchain>=0.3.0` - LLM abstraction layer
- `langchain-anthropic>=0.3.0` - Anthropic integration
- `anthropic>=0.39.0` - Anthropic API client
- `datasets>=3.0.0` - Dataset handling

### 2. Set Anthropic API Key (for semantic tests only)

```bash
export AWS_CLAUDE_API_KEY="sk-ant-..."
```

Or create a `.env` file:
```env
AWS_CLAUDE_API_KEY=sk-ant-...
```

> **Note**: Traditional tests don't need an API key and will run without it.

## Running Tests

### Quick Start

```bash
cd ai-service

# 1. Ensure Weaviate is running with documents loaded
docker-compose up -d weaviate

# 2. Update test data with questions about YOUR documents
# Edit: tests/ragas/fixtures/real_semantic_data.py
# Edit: tests/ragas/fixtures/real_traditional_data.py

# 3. Run tests
pytest tests/ragas/test_rag_real_traditional.py -v  # Fast, free
ENV=test AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy pytest tests/ragas/test_rag_real_semantic.py -v  # Slow, costs money
```

### All Test Commands

```bash
# Run all Ragas tests (semantic + traditional)
ENV=test AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy pytest tests/ragas/ -v

# Run specific test file
pytest tests/ragas/test_rag_real_traditional.py -v      # Traditional (fast, free)
pytest tests/ragas/test_rag_real_semantic.py -v         # Semantic (slow, costs money)

# Run specific test function
pytest tests/ragas/test_rag_real_traditional.py::test_real_traditional_exact_match -v
pytest tests/ragas/test_rag_real_semantic.py::test_real_semantic_answer_relevancy -v

# Run with detailed output (shows responses)
pytest tests/ragas/test_rag_real_semantic.py -v -s

# Run traditional tests in parallel (fast!)
pytest tests/ragas/test_rag_real_traditional.py -n auto

# Run only traditional tests (free, no AWS needed)
pytest tests/ragas/test_rag_real_traditional.py -v

# Run only semantic tests (requires AWS credentials)
ENV=test AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy pytest tests/ragas/test_rag_real_semantic.py -v
```

## Test Suites Explained

### 1. Semantic Test Suite (test_rag_real_semantic.py)

**Uses**: Anthropic Claude Sonnet 4 for evaluation
**Speed**: Slow (2-5 minutes per test)
**Cost**: ~$0.01-0.05 per test
**When to use**: Complex questions requiring deep understanding

#### Available Tests

| Test Function | Metric | What It Measures |
|---------------|--------|------------------|
| `test_real_semantic_faithfulness` | Faithfulness | No hallucination - response grounded in context |
| `test_real_semantic_answer_relevancy` | Answer Relevancy | Response directly addresses the question |
| `test_real_semantic_context_precision` | Context Precision | Quality of retrieved contexts (low noise) |
| `test_real_semantic_context_recall` | Context Recall | Completeness of retrieved information |
| `test_real_semantic_answer_similarity` | Answer Similarity | Semantic similarity to reference answer |
| `test_real_semantic_answer_correctness` | Answer Correctness | Factual accuracy + semantic similarity |
| `test_real_semantic_comprehensive_evaluation` | All metrics | Complete evaluation (most thorough) |

#### Thresholds (configurable in conftest.py:77)

```python
{
    "faithfulness_threshold": 0.7,
    "answer_relevancy_threshold": 0.7,
    "context_precision_threshold": 0.6,
    "context_recall_threshold": 0.6,
    "answer_similarity_threshold": 0.7,
    "answer_correctness_threshold": 0.7,
}
```

#### Example Usage

```bash
# Test faithfulness (no hallucination)
pytest tests/ragas/test_rag_real_semantic.py::test_real_semantic_faithfulness -v

# Full semantic evaluation (all metrics)
pytest tests/ragas/test_rag_real_semantic.py::test_real_semantic_comprehensive_evaluation -v
```

### 2. Traditional Test Suite (test_rag_real_traditional.py)

**Uses**: Ragas built-in non-LLM metrics (no API calls)
**Speed**: Fast (<10 seconds for all tests)
**Cost**: $0.00 (completely free)
**When to use**: Factual questions, commands, exact answers

#### Available Tests

| Test Function | Metric | What It Measures | Best For |
|---------------|--------|------------------|----------|
| `test_real_traditional_exact_match` | Exact Match | Exact string equality | Ports, codes, single-word answers |
| `test_real_traditional_bleu_score` | BLEU | N-gram precision overlap | Similar answers with slight variations |
| `test_real_traditional_rouge_score` | ROUGE-L | Longest common subsequence | Key information presence |
| `test_real_traditional_string_similarity` | Levenshtein | Edit distance similarity | Typos, format differences |
| `test_real_traditional_string_presence` | String Presence | Reference is substring of response | Critical info inclusion |
| `test_real_traditional_comprehensive_evaluation` | All traditional metrics | Complete fast evaluation |

#### Thresholds (configurable in conftest.py:101)

```python
{
    "exact_match_threshold": 1.0,        # 100% exact match
    "bleu_threshold": 0.4,               # 40%+ n-gram overlap
    "rouge_threshold": 0.5,              # 50%+ ROUGE-L F-measure
    "string_similarity_threshold": 0.7,  # 70%+ Levenshtein similarity
}
```

#### Example Usage

```bash
# Test exact matching (fastest)
pytest tests/ragas/test_rag_real_traditional.py::test_real_traditional_exact_match -v

# Full traditional evaluation (all non-LLM metrics)
pytest tests/ragas/test_rag_real_traditional.py::test_real_traditional_comprehensive_evaluation -v

# Run with detailed output
pytest tests/ragas/test_rag_real_traditional.py -v -s
```

## Decision Tree: Which Test Suite to Use?

```
                    ┌──────────────────────────┐
                    │  What are you testing?   │
                    └────────────┬─────────────┘
                                 │
                  ┌──────────────┴───────────────┐
                  │                              │
          ┌───────▼─────────┐          ┌────────▼─────────┐
          │ Factual/Simple  │          │ Complex/Nuanced  │
          │   Questions?    │          │   Questions?     │
          └───────┬─────────┘          └────────┬─────────┘
                  │                              │
          ┌───────▼─────────┐          ┌────────▼─────────┐
          │ Expected answer │          │ Answer requires  │
          │ is exact or     │          │ understanding,   │
          │ nearly exact?   │          │ reasoning, or    │
          │                 │          │ contextual       │
          │ Examples:       │          │ interpretation?  │
          │ - Port: 5432    │          │                  │
          │ - Command: npm  │          │ Examples:        │
          │   run dev       │          │ - "How does auth │
          │ - Hours: 9-5    │          │   work?"         │
          │ - Email addr    │          │ - "Explain the   │
          └───────┬─────────┘          │   difference..."  │
                  │                    │ - "What's best   │
                  │                    │   practice?"     │
                  │                    └────────┬─────────┘
                  │                             │
          ┌───────▼───────────┐        ┌────────▼──────────┐
          │                   │        │                   │
          │  USE TRADITIONAL  │        │   USE SEMANTIC    │
          │     TEST SUITE    │        │    TEST SUITE     │
          │                   │        │                   │
          │ ✓ Fast (seconds)  │        │ ✓ Accurate eval   │
          │ ✓ Free ($0)       │        │ ✓ Contextual      │
          │ ✓ No API key      │        │ ✗ Slow (minutes)  │
          │ ✓ High precision  │        │ ✗ Costs money     │
          │                   │        │ ✗ Needs API key   │
          └───────────────────┘        └───────────────────┘
```

## Test Data

### Semantic Test Data (fixtures/semantic_data.py)

**Complex questions requiring semantic evaluation:**

```python
SEMANTIC_TEST_DATA = [
    {
        "user_input": "How does the authentication system work?",
        "retrieved_contexts": ["JWT tokens...", "Login endpoint...", ...],
        "response": "The authentication system uses JWT...",
        "reference": "JWT-based authentication with..."
    },
    # 6 technical questions about the codebase
]

CUSTOMER_SUPPORT_SEMANTIC_DATA = [
    # 3 customer support scenarios
]
```

### Traditional Test Data (fixtures/traditional_data.py)

**Simple factual questions with exact/near-exact answers:**

```python
EXACT_MATCH_TEST_DATA = [
    {
        "user_input": "What is the default PostgreSQL port?",
        "response": "5432",
        "reference": "5432"
    },
    # 5 exact match questions
]

SIMILARITY_TEST_DATA = [
    # 5 questions with similar but not exact answers
]

PRODUCT_INFO_TEST_DATA = [
    # 5 product information questions
]

CONFIG_TEST_DATA = [
    # 5 configuration value questions
]

COMMAND_TEST_DATA = [
    # 5 command/instruction questions
]
```

## How It Works

### The `real_rag_system` Fixture

All tests use the `real_rag_system` fixture which:
- Initializes the full FastAPI application with lifespan
- Builds the actual vectorstore and RAG chain
- Calls the real `/api/v1/chat/stream` endpoint
- Collects and evaluates streaming SSE responses

### Prerequisites

1. **Weaviate running** with documents loaded into vectorstore
2. **AWS credentials** for Bedrock (semantic tests only, traditional tests don't need it)
3. **Test data updated** in `fixtures/real_semantic_data.py` and `fixtures/real_traditional_data.py`

### Setup Steps

```bash
# 1. Ensure Weaviate is running
docker-compose up -d weaviate

# 2. Update test data with questions about YOUR documents
# Edit: tests/ragas/fixtures/real_semantic_data.py
# Edit: tests/ragas/fixtures/real_traditional_data.py

# 3. Run tests
pytest tests/ragas/test_rag_real_traditional.py -v        # Fast, free
pytest tests/ragas/test_rag_real_semantic.py -v           # Slow, costs money
```

### Important Notes

- The endpoint currently doesn't return `retrieved_contexts`, so faithfulness/precision/recall tests will skip
- Tests are marked with `@pytest.mark.integration` for easy filtering
- Traditional tests are free and fast, semantic tests cost money but are more accurate
- Update the test data fixtures with questions relevant to YOUR actual documents

### Writing Custom Tests

If you want to write additional tests:

#### For Traditional Tests (Fast Iteration)

```python
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_my_actual_rag_traditional(client: AsyncClient, bleu_scorer):
    """Test your real RAG endpoint with traditional metrics."""

    # Call your RAG API
    response = await client.post("/api/v1/chat", json={
        "query": "What is the default port?",
        "user_id": "test_user"
    })

    data = response.json()

    # Evaluate with traditional metrics
    score = await bleu_scorer.ascore(
        reference="5432",
        response=data["response"]
    )

    assert score >= 0.5
```

#### For Semantic Tests (Thorough Evaluation)

```python
from ragas import evaluate, EvaluationDataset
from ragas.metrics import faithfulness, answer_relevancy

@pytest.mark.asyncio
async def test_my_actual_rag_semantic(
    client: AsyncClient,
    ragas_llm,
    ragas_embeddings
):
    """Test your real RAG endpoint with semantic metrics."""

    test_cases = [
        {"query": "How does auth work?", "reference": "JWT tokens..."},
        {"query": "Explain async ops", "reference": "Async/await..."},
    ]

    # Collect responses
    results = []
    for case in test_cases:
        response = await client.post("/api/v1/chat", json={"query": case["query"]})
        data = response.json()

        results.append({
            "user_input": case["query"],
            "retrieved_contexts": data["contexts"],
            "response": data["response"],
            "reference": case["reference"],
        })

    # Evaluate with Ragas
    dataset = EvaluationDataset.from_list(results)

    faithfulness_metric = faithfulness
    faithfulness_metric.llm = ragas_llm

    relevancy_metric = answer_relevancy
    relevancy_metric.llm = ragas_llm
    relevancy_metric.embeddings = ragas_embeddings

    evaluation = evaluate(dataset, metrics=[faithfulness_metric, relevancy_metric])

    assert evaluation["faithfulness"] >= 0.7
    assert evaluation["answer_relevancy"] >= 0.7
```

## Best Practices

### 1. Start with Traditional Tests

- **Faster iteration**: Results in seconds, not minutes
- **No cost**: Run unlimited tests without API charges
- **Good baseline**: Catches obvious errors quickly

```bash
# Development workflow
pytest tests/ragas/test_rag_traditional.py -v  # Fast feedback
# Fix issues
pytest tests/ragas/test_rag_semantic.py -v     # Thorough validation before deploy
```

### 2. Use Semantic Tests for Final Validation

- Run before production deployments
- Use for complex feature validation
- Evaluate edge cases and nuanced responses

### 3. Customize Thresholds

Adjust in `conftest.py` based on your requirements:

```python
@pytest.fixture
def traditional_evaluation_config() -> dict[str, Any]:
    return {
        "exact_match_threshold": 0.95,  # Stricter: 95% instead of 100%
        "bleu_threshold": 0.5,           # More lenient
        # ...
    }
```

### 4. Create Domain-Specific Data

Add your own test data in `fixtures/`:

```python
# fixtures/my_domain_data.py
MY_PRODUCT_DATA = [
    {
        "user_input": "What's the price of Pro plan?",
        "response": "$99/month",
        "reference": "$99/month",
    },
    # ... more cases
]
```

### 5. CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run Traditional RAG Tests (Fast)
  run: pytest tests/ragas/test_rag_traditional.py -v

- name: Run Semantic RAG Tests (Thorough)
  if: github.ref == 'refs/heads/main'  # Only on main branch
  env:
    AWS_CLAUDE_API_KEY: ${{ secrets.AWS_CLAUDE_API_KEY }}
  run: pytest tests/ragas/test_rag_semantic.py -v
```

## Troubleshooting

### Tests Are Skipped (Semantic Tests)

**Issue**: `AWS_CLAUDE_API_KEY not set, skipping semantic Ragas tests`

**Solution**:
```bash
export AWS_CLAUDE_API_KEY="sk-ant-..."
```

### Import Errors

**Issue**: `ModuleNotFoundError: No module named 'ragas'`

**Solution**:
```bash
cd ai-service
uv sync
```

### Slow Semantic Tests

**Issue**: Semantic tests take too long

**Solutions**:
- Run traditional tests during development
- Use semantic tests only for final validation
- Run specific semantic tests instead of comprehensive suite
- Consider using Claude Haiku (faster, cheaper) for development:
  ```python
  # conftest.py
  llm = ChatAnthropic(
      model="claude-3-5-haiku-20241022",  # Faster, cheaper
      ...
  )
  ```

### Traditional Tests Failing

**Issue**: Exact match tests failing due to formatting

**Solution**: Use BLEU/ROUGE instead:
```python
# Instead of exact match
await exact_match_scorer.ascore(reference, response)

# Use BLEU for flexibility
await bleu_scorer.ascore(reference, response)
```

### Rate Limits (Semantic Tests)

**Issue**: Anthropic API rate limit errors

**Solutions**:
- Add delays between tests
- Run tests sequentially: `pytest tests/ragas/test_rag_semantic.py -v` (no `-n auto`)
- Upgrade Anthropic API tier
- Use traditional tests more frequently

## Cost Estimation

### Semantic Tests (Approximate)

| Test | Claude Sonnet 4 Calls | Estimated Cost |
|------|----------------------|----------------|
| Single metric test | ~5-10 calls | $0.01-0.02 |
| Comprehensive test | ~30-50 calls | $0.05-0.10 |
| Full semantic suite | ~100-150 calls | $0.20-0.30 |

### Traditional Tests

| Test | Cost |
|------|------|
| All traditional tests | **$0.00** |

### Recommendation

- **Development**: Use traditional tests (free, fast)
- **Pre-production**: Run semantic tests once
- **CI/CD**: Traditional on every PR, semantic on main branch only

## Further Reading

- [Ragas Documentation](https://docs.ragas.io/)
- [Ragas Traditional Metrics](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/traditional/)
- [Ragas LLM Metrics](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/semantic/)
- [Anthropic Claude Models](https://docs.anthropic.com/en/docs/models-overview)

## Quick Reference

```bash
# Fast, free tests (no API key needed)
pytest tests/ragas/test_rag_traditional.py -v

# Thorough, accurate tests (needs AWS_CLAUDE_API_KEY)
AWS_CLAUDE_API_KEY=sk-ant-... pytest tests/ragas/test_rag_semantic.py -v

# Single test
pytest tests/ragas/test_rag_traditional.py::test_traditional_exact_match -v

# With output
pytest tests/ragas/test_rag_semantic.py -v -s

# Parallel execution (traditional only)
pytest tests/ragas/test_rag_traditional.py -n auto
```

## Contact

For questions about these tests:
- Review this README
- Check inline code documentation
- Consult [Ragas documentation](https://docs.ragas.io/)
- Ask project maintainers
