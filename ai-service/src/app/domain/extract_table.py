import base64
from collections.abc import Sequence
from pathlib import Path
from typing import Any

import fitz  # type: ignore[import-not-found]
from langchain_aws import ChatBedrock
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage
import pdfplumber  # type: ignore[import-not-found]

from app.domain.extract_images import build_bedrock_vision_client

#  We now want ONLY Markdown text
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

Analyze ALL tables contained in these page images 

Your tasks:
- Detect all tables across these pages.
- If multiple tables share the same column headers, treat them as a single logical table and MERGE their rows.
- Detect rows that are split across multiple pages.
- Preserve the visual row order across pages.
- Use Markdown table format for the output.

Output format:

## Table: <short title> 

| Column 1 | Column 2 | Column 3 | ...
|----------|----------|----------|----
| ...      | ...      | ...      | ...

Rules:
- Only write the header row ONCE at the top of each table.
- Do NOT repeat header rows that appear again on later pages.
- If there are multiple independent tables, output each with its own “## Table: ...” heading and Markdown table.
- Do NOT write explanations, paragraphs, or commentary — only Markdown headings and tables (and bullet lists for charts if needed).
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


def _block_outside_any_bbox(
    block: list[Any],
    bboxes: list[tuple[float, float, float, float]],
) -> bool:
    """Return True if block center is outside all provided bounding boxes."""
    if not bboxes or len(block) < 5:
        return True

    x0, y0, x1, y1 = block[:4]
    x_center = (x0 + x1) / 2
    y_center = (y0 + y1) / 2

    for bx0, by0, bx1, by1 in bboxes:
        if bx0 <= x_center <= bx1 and by0 <= y_center <= by1:
            return False
    return True


def extract_tables_and_text_in_order(
    pdf_path: str,
    batch_size: int = 5,
    zoom: int = 3,
    llm: ChatBedrock | None = None,
    reconstruct_with_llm: bool = True,
) -> list[Document]:
    """
    Extract page text (excluding table regions) and table content in reading order.

    - Text is extracted per page as separate Documents.
    - Tables are reconstructed via Bedrock Vision per batch of pages
      and returned as Markdown in a single Document per batch.
    - `order` metadata preserves the logical sequence of page text and table blocks.
    """
    if reconstruct_with_llm and llm is None:
        llm = build_bedrock_vision_client()

    base64_images = pdf_to_base64_images(pdf_path, zoom=zoom)
    docs: list[Document] = []
    order_index = 0

    with fitz.open(pdf_path) as pdf_doc, pdfplumber.open(pdf_path) as pdf_pl:
        total_pages = len(pdf_doc)

        for batch_start in range(0, total_pages, batch_size):
            batch_end = min(batch_start + batch_size, total_pages)
            page_start = batch_start + 1
            page_end = batch_end

            # 1) Per-page text (excluding table regions)
            order_index = _append_page_text_docs(
                docs=docs,
                pdf_path=pdf_path,
                pdf_doc=pdf_doc,
                pdf_pl=pdf_pl,
                batch_start=batch_start,
                batch_end=batch_end,
                order_index=order_index,
            )

            # 2) Batch table reconstruction via LLM
            if reconstruct_with_llm and llm is not None:
                table_doc = _build_tables_doc_for_batch(
                    pdf_path=pdf_path,
                    base64_images=base64_images,
                    batch_start=batch_start,
                    batch_end=batch_end,
                    page_start=page_start,
                    page_end=page_end,
                    batch_size=batch_size,
                    zoom=zoom,
                    llm=llm,
                    order_index=order_index,
                )
                if table_doc is not None:
                    docs.append(table_doc)
                    order_index += 1

    return docs


def _append_page_text_docs(
    *,
    docs: list[Document],
    pdf_path: str | Path,
    pdf_doc: Any,
    pdf_pl: Any,
    batch_start: int,
    batch_end: int,
    order_index: int,
) -> int:
    """Append page text Documents (excluding table regions) for a batch of pages."""
    for page_idx in range(batch_start, batch_end):
        page = pdf_doc[page_idx]
        pl_page = pdf_pl.pages[page_idx]

        table_bboxes = _get_table_bboxes(pl_page)
        text = _extract_page_text_excluding_tables(page, table_bboxes)

        if not text:
            continue

        docs.append(
            Document(
                page_content=text,
                metadata={
                    "type": "page",
                    "source_pdf": str(pdf_path),
                    "source": str(pdf_path),
                    "page": page_idx + 1,
                    "order": order_index,
                },
            )
        )
        order_index += 1

    return order_index


def _get_table_bboxes(pl_page: Any) -> list[tuple[float, float, float, float]]:
    """Return table bounding boxes for a pdfplumber page, or an empty list on failure."""
    try:
        tables = pl_page.find_tables() or []
    except Exception:
        return []

    return [tbl.bbox for tbl in tables]


def _extract_page_text_excluding_tables(
    page: Any,
    table_bboxes: Sequence[tuple[float, float, float, float]],
) -> str:
    """
    Extract text blocks from a page, excluding regions overlapping any table bbox.
    Returns a single normalized string, or "" if no relevant text is found.
    """
    blocks = page.get_text("blocks") or []
    filtered_blocks: list[str] = []
    table_bboxes_list = list(table_bboxes)

    for block in blocks:
        # Expected shape: (x0, y0, x1, y1, text, ...)
        if len(block) < 5:
            continue

        text = block[4]
        if not text or not text.strip():
            continue

        if not _block_outside_any_bbox(block, table_bboxes_list):
            continue

        filtered_blocks.append(text.strip())

    if not filtered_blocks:
        return ""

    return "\n".join(filtered_blocks)


def _build_tables_doc_for_batch(
    *,
    pdf_path: str | Path,
    base64_images: list[str],
    batch_start: int,
    batch_end: int,
    page_start: int,
    page_end: int,
    batch_size: int,
    zoom: int,
    llm: ChatBedrock,
    order_index: int,
) -> Document | None:
    """
    Use Bedrock Vision to reconstruct tables as Markdown for a batch of pages.

    Returns:
        A single Document containing Markdown tables for the batch, or None
        if the LLM returns no usable output.
    """
    batch_images = base64_images[batch_start:batch_end]
    if not batch_images:
        return None

    system_prompt = SYSTEM_PROMPT.strip()
    prompt = f"{system_prompt}"

    markdown_output = _process_with_llm(batch_images, prompt, llm)
    if not markdown_output:
        return None

    return Document(
        page_content=markdown_output,
        metadata={
            "type": "table",
            "source_pdf": str(pdf_path),
            "source": str(pdf_path),
            "page_start": page_start,
            "page_end": page_end,
            "order": order_index,
            "batch_size": batch_size,
            "zoom": zoom,
        },
    )
