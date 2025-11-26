import base64
from typing import Any

import fitz  # type: ignore[import-not-found]
from langchain_aws import ChatBedrock
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage

from app.domain.extract_images import build_bedrock_vision_client

# 🔸 We now want ONLY Markdown text (no JSON)
SYSTEM_PROMPT = """
You are an expert data extraction system that identifies and converts tables and chart-like data
from visual page images into clean Markdown tables.

GOAL:
- Find ALL tables in the provided page images.
- Convert these tables into Markdown table format.
- If a table is split across multiple pages, merge all parts into a SINGLE logical table.

RULES:
- Your output must be PLAIN TEXT containing ONLY Markdown headings and tables.
- For each table, use the following structure:

## Table: <short title> (Pages: X-Y)

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| ...      | ...      | ...      |

- If identical or very similar column headers appear again on later pages
  (for example: "Week", "Focus", "Responsible (R)", "Accountable (A)", "Consulted (C)", "Informed (I)"),
  treat those as CONTINUATIONS of the same table.
- In that case:
  - Merge all rows into a SINGLE Markdown table.
  - Write the header row (column names) ONLY ONCE at the top.
  - Ignore repeated header rows on subsequent pages.
- If there are multiple independent tables, create a separate “## Table: ...” heading and Markdown table for each.
- If there is chart-like data that can be tabularized, convert it into a Markdown table if possible.
  If not, you may use:

## Chart: <short title> (Pages: X-Y)
- Item 1: ...
- Item 2: ...

CONSTRAINTS:
- Do NOT output explanations, reasoning, or natural language commentary.
- Do NOT output JSON.
- Output ONLY Markdown headings, Markdown tables, and (if needed) bullet lists for charts.
"""


def pdf_to_base64_images(pdf_path: str, zoom: int = 3) -> list[str]:
    """Convert each page of the PDF into a base64-encoded PNG image."""
    base64_pages: list[str] = []
    try:
        doc = fitz.open(pdf_path)
    except FileNotFoundError as exc:
        raise FileNotFoundError(f"'{pdf_path}' not found.") from exc

    for page in doc:
        matrix = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        img_data = pix.tobytes(output="png")
        base64_encoded = base64.b64encode(img_data).decode("utf-8")
        base64_pages.append(base64_encoded)

    doc.close()
    return base64_pages


def get_multi_page_prompt(page_start: int, page_end: int) -> str:
    """Prompt used when sending a batch of pages (e.g. 1–5, 6–10...)."""
    return f"""
Analyze ALL tables contained in these page images (Pages {page_start}–{page_end}).

Your tasks:
- Detect all tables across these pages.
- If multiple tables share the same column headers, treat them as a single logical table and MERGE their rows.
- Detect rows that are split across multiple pages.
- Preserve the visual row order across pages.
- Use Markdown table format for the output.

Output format:

## Table: <short title> (Pages: {page_start}-{page_end})

| Column 1 | Column 2 | Column 3 | ...
|----------|----------|----------|----
| ...      | ...      | ...      | ...

Rules:
- Only write the header row ONCE at the top of each table.
- Do NOT repeat header rows that appear again on later pages.
- If there are multiple independent tables, output each with its own “## Table: ...” heading and Markdown table.
- Do NOT write explanations, paragraphs, or commentary — only Markdown headings and tables (and bullet lists for charts if needed).
"""


def _extract_response_text(content: Any) -> str:
    """LangChain Bedrock responses may be str or a list of content blocks."""
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: list[str] = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and block.get("type") == "text" and "text" in block:
                parts.append(str(block["text"]))
            elif hasattr(block, "text"):
                parts.append(str(block.text))
        return "\n".join(parts)

    return str(content)


def _process_with_llm(
    page_image_data: list[str],
    prompt: str,
    llm: ChatBedrock,
) -> str:
    """Call the Bedrock vision model with one or more page images and return Markdown text."""
    content_list: list[dict[str, Any] | str] = []

    for img_data in page_image_data:
        content_list.append(
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": img_data,
                },
            }
        )

    # Add the text prompt for this batch
    content_list.append({"type": "text", "text": prompt})

    human = HumanMessage(content=content_list)

    response = llm.invoke([human])
    return _extract_response_text(getattr(response, "content", response)).strip()


def extract_tables_and_text_in_order(
    pdf_path: str,
    batch_size: int = 5,
    zoom: int = 3,
    llm: ChatBedrock | None = None,
    reconstruct_with_llm: bool = True,
) -> list[Document]:
    """
    Process pages in batches: extract page text in order, and use Bedrock vision to
    extract/merge tables as Markdown using the new multi-page prompt.
    """
    if reconstruct_with_llm and llm is None:
        llm = build_bedrock_vision_client()

    # Pre-render all pages to base64 once so batching is easy
    base64_images = pdf_to_base64_images(pdf_path, zoom=zoom)
    docs: list[Document] = []
    order_index = 0

    with fitz.open(pdf_path) as pdf_doc:
        total_pages = len(pdf_doc)

        for batch_start in range(0, total_pages, batch_size):
            batch_end = min(batch_start + batch_size, total_pages)
            page_start = batch_start + 1
            page_end = batch_end

            # 1) Text per page (kept in order)
            for page_idx in range(batch_start, batch_end):
                text = pdf_doc[page_idx].get_text("text").strip()
                if not text:
                    continue
                docs.append(
                    Document(
                        page_content=text,
                        metadata={
                            "type": "page",
                            "source_pdf": pdf_path,
                            "source": pdf_path,
                            "page": page_idx + 1,
                            "order": order_index,
                        },
                    )
                )
                order_index += 1

            # 2) Table extraction via Bedrock (one doc per batch)
            if reconstruct_with_llm and llm is not None:
                batch_images = base64_images[batch_start:batch_end]
                prompt = f"{SYSTEM_PROMPT.strip()}\n\n{get_multi_page_prompt(page_start, page_end).strip()}"
                markdown_output = _process_with_llm(batch_images, prompt, llm)

                if markdown_output:
                    docs.append(
                        Document(
                            page_content=markdown_output,
                            metadata={
                                "type": "table",
                                "source_pdf": pdf_path,
                                "source": pdf_path,
                                "page_start": page_start,
                                "page_end": page_end,
                                "order": order_index,
                                "batch_size": batch_size,
                                "zoom": zoom,
                            },
                        )
                    )
                    order_index += 1

    return docs
