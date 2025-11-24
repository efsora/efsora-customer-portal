# RAG API Requirements for Ragas Testing

## Summary

The current `/api/v1/chat/stream` endpoint does not return retrieved contexts, which blocks **3 out of 6 critical semantic evaluation metrics** in the ragas test suite.

## Impact

### Tests Currently Blocked (Auto-Skip)

The following tests cannot run without retrieved contexts:

1. **`test_faithfulness`** - Detects hallucinations by comparing response to retrieved contexts
2. **`test_context_precision`** - Measures quality of retrieval (are relevant docs ranked higher?)
3. **`test_context_recall`** - Measures retrieval completeness (were all relevant docs retrieved?)

### Tests Currently Working

These metrics work without contexts (but tests are less complete):
- Answer Relevancy (query-response alignment)
- Answer Similarity (response vs ground truth)
- Answer Correctness (combined similarity + factual accuracy)

## Required API Changes

### Current Endpoint Behavior

**Endpoint**: `POST /api/v1/chat/stream`

**Current Response**: SSE stream with text only
```
data: chunk1
data: chunk2
data: chunk3
```

### Required New Behavior

**Option 1: SSE Metadata Event (Recommended)**

Send retrieved contexts as a metadata event before streaming response:

```
event: metadata
data: {"retrieved_contexts": ["context1", "context2", "context3"]}

data: chunk1
data: chunk2
data: chunk3
```

**Option 2: Extend Non-Streaming Endpoint**

Add contexts to the non-streaming `/api/v1/chat` endpoint:

```json
{
  "question": "user question",
  "answer": "LLM response",
  "retrieved_contexts": ["context1", "context2", "context3"]
}
```

Then have tests optionally use non-streaming for easier testing.

**Option 3: Separate Context Endpoint**

Create a new endpoint that returns contexts for a given query:

```bash
POST /api/v1/chat/contexts
{
  "message": "user question",
  "top_k": 5
}

Response:
{
  "contexts": ["context1", "context2", ...],
  "sources": [...]
}
```

Tests would call both endpoints.

## Technical Implementation Details

### Where the Contexts Are Lost

**File**: `ai-service/src/app/services/rag_service.py:82-92`

```python
rag_chain = (
    RunnableParallel(
        context=question_input | retriever,  # ← Contexts retrieved here
        question=question_input,
        history=history_input,
    )
    | prompt
    | llm
    | StrOutputParser()  # ← Contexts discarded here, only string returned
)
```

The `StrOutputParser()` only returns the LLM's string output, discarding the intermediate `context` field.

### Suggested Implementation Approach

#### For Option 1 (SSE Metadata Event - Recommended)

**In `rag_service.py`**:
1. Before the RAG chain runs, explicitly retrieve contexts:
   ```python
   retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
   retrieved_docs = await retriever.ainvoke(query)
   contexts = [doc.page_content for doc in retrieved_docs]
   ```

2. Return contexts alongside the chain result

**In `chat_routes.py` (streaming endpoint)**:
1. Get contexts before streaming:
   ```python
   async def event_generator():
       # Retrieve contexts first
       retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
       retrieved_docs = await retriever.ainvoke(payload.message)
       contexts = [doc.page_content for doc in retrieved_docs]

       # Send contexts as metadata event
       yield f"event: metadata\ndata: {json.dumps({'retrieved_contexts': contexts})}\n\n"

       # Then stream response chunks
       async for chunk in rag_chain.astream({
           "question": payload.message,
           "history": history_context,
       }):
           yield f"data: {chunk}\n\n"
   ```

#### For Option 2 (Extend Non-Streaming Endpoint)

Add contexts to `/api/v1/chat` response, update `ChatResponse` model, then tests can use non-streaming for easier parsing.

#### For Option 3 (Separate Endpoint)

Create new route that only runs retrieval without generation.

## Test Code Changes Required

Once contexts are returned, the test helper needs updating:

**File**: `ai-service/tests/ragas/conftest.py:208-234`

**Current**:
```python
def parse_sse_stream(response_text: str) -> str:
    """Parse SSE and extract text."""
    chunks = response_text.split("\n\n")
    cleaned_chunks = []
    for chunk in chunks:
        if chunk.startswith("data: "):
            cleaned_chunks.append(chunk[6:])
    return "".join(cleaned_chunks)
```

**Updated** (for Option 1 - SSE Metadata):
```python
def parse_sse_stream(response_text: str) -> tuple[str, list[str]]:
    """Parse SSE and extract text + contexts."""
    lines = response_text.split("\n")
    contexts = []
    response_chunks = []

    i = 0
    while i < len(lines):
        if lines[i].startswith("event: metadata"):
            # Next line is data with contexts
            if i + 1 < len(lines) and lines[i + 1].startswith("data: "):
                metadata = json.loads(lines[i + 1][6:])
                contexts = metadata.get("retrieved_contexts", [])
            i += 2
        elif lines[i].startswith("data: "):
            response_chunks.append(lines[i][6:])
            i += 1
        else:
            i += 1

    return "".join(response_chunks), contexts
```

## Benefits of This Change

1. **Enable critical hallucination detection** - Faithfulness metric prevents RAG from making up facts
2. **Measure retrieval quality** - Context precision/recall show if retrieval is working correctly
3. **Debug RAG failures** - When responses are wrong, contexts show what information was available
4. **Complete test coverage** - All 6 semantic metrics can run, not just 3

## Recommendation

**Use Option 1 (SSE Metadata Event)** because:
- ✅ Works with the streaming endpoint (production code path)
- ✅ SSE standard supports custom events
- ✅ Backward compatible (clients can ignore metadata events)
- ✅ Contexts sent before response starts (useful for UI)
- ✅ Tests validate actual production streaming logic

## Questions?

Contact the ragas test maintainer for clarification or discussion of these requirements.
