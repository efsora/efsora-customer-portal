import base64
from collections.abc import Iterable, Mapping
import hashlib
import mimetypes
import os
from pathlib import Path
from typing import Any

import fitz  # type: ignore[import-not-found]
from langchain_aws import ChatBedrock
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage

from app.core.settings import Settings, get_settings
from app.utils.file_utils import ensure_existing_file, save_binary_file


def _convert_image_to_base64(image_bytes: bytes) -> str:
    """Image bytes -> base64 string."""
    return base64.b64encode(image_bytes).decode("utf-8")


def _guess_media_type(image_ext: str | None) -> str:
    """Best-effort MIME guess for Bedrock vision payloads."""
    default_media_type = get_settings().DEFAULT_IMAGE_MEDIA_TYPE
    if image_ext:
        media_type, _ = mimetypes.guess_type(f"file.{image_ext}")
        if media_type:
            return media_type
    return default_media_type


def resolve_image_output_dir(image_output_dir: str | Path | None) -> Path:
    """Resolve image output dir relative to repo root, ensure it exists."""
    settings = get_settings()
    chosen_dir = (
        Path(image_output_dir)
        if image_output_dir is not None
        else (
            Path(settings.IMAGE_OUTPUT_DIR)
            if settings.IMAGE_OUTPUT_DIR
            else Path(settings.OUTPUT_DIR) / "images"
        )
    )

    output_dir = Path(chosen_dir)
    if not output_dir.is_absolute():
        raise ValueError(
            f"image_output_dir must be an absolute path (got '{output_dir}'). "
            "Set IMAGE_OUTPUT_DIR or OUTPUT_DIR to an absolute path, or pass an absolute path explicitly."
        )

    try:
        output_dir.mkdir(parents=True, exist_ok=True)
    except PermissionError as exc:
        raise PermissionError(
            f"Cannot create image output directory at '{output_dir}'. "
            "Please point image_output_dir to a writable path."
        ) from exc

    return output_dir


def _block_to_text(block: Any) -> str | None:
    """Extract a text string from a single block object."""
    if block is None:
        return None

    if isinstance(block, str):
        return block

    if isinstance(block, Mapping) and block.get("type") == "text":
        value = block.get("text")
        return None if value is None else str(value)

    text_attr = getattr(block, "text", None)
    if text_attr is not None:
        return str(text_attr)

    return None


def _extract_response_text(content: Any) -> str:
    """Flatten LangChain/Bedrock content into a clean text string."""
    if isinstance(content, str):
        return content

    if isinstance(content, Iterable) and not isinstance(content, str | bytes):
        parts = filter(None, (_block_to_text(block) for block in content))
        return "\n".join(parts)

    return str(content)


def _build_vision_prompt(image_b64: str, media_type: str) -> HumanMessage:
    """Create Claude vision prompt content."""
    return HumanMessage(
        content=[
            {
                "type": "text",
                "text": (
                    "You are an expert technical document explainer. "
                    "Describe this image in detail. "
                    "Explain what is shown, the structure, any diagrams, tables, "
                    "axes, legends, and the main message. "
                    "Focus on what is actually visible; do not invent content."
                ),
            },
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": image_b64,
                },
            },
        ]
    )


def _describe_image_bytes_with_llm(
    image_bytes: bytes,
    image_ext: str | None,
    llm: ChatBedrock,
) -> str:
    """Give Raw images to the bedrock and get explanation back."""
    image_b64 = _convert_image_to_base64(image_bytes)
    media_type = _guess_media_type(image_ext)

    response = llm.invoke([_build_vision_prompt(image_b64, media_type)])
    return _extract_response_text(getattr(response, "content", response)).strip()


def _page_text_snippet(page: fitz.Page, limit: int | None = None) -> str:
    effective_limit = limit or get_settings().PAGE_TEXT_SNIPPET_LIMIT
    text = page.get_text("text").strip()
    return text[:effective_limit] if text else ""


def _image_name(pdf_path: str, page_index: int, image_index: int, image_ext: str | None) -> str:
    ext = image_ext or "png"
    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
    return f"{pdf_name}_p{page_index + 1}_img{image_index + 1}.{ext}"


def _bedrock_credentials_kwargs(settings: Settings) -> dict[str, Any]:
    """
    Build Bedrock credential-related kwargs.

    Priority:
    - Explicit access key + secret key → use those, ignore profile.
    - Otherwise → let default AWS resolution happen (env vars, role, profile).
    """
    has_access_key = bool(settings.AWS_ACCESS_KEY_ID)
    has_secret_key = bool(settings.AWS_SECRET_ACCESS_KEY)

    if has_access_key and has_secret_key:
        return {
            "credentials_profile_name": None,  # avoid mixing profiles with explicit keys
            "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
            "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
        }

    # No explicit pair of credentials → rely on default provider chain
    return {}


def build_bedrock_vision_client() -> ChatBedrock:
    """
    Create a non-streaming Bedrock client suitable for vision prompts.

    Notes:
    - Uses a deterministic configuration (temperature=0).
    - Keeps token budget reasonable for captioning / vision tasks.
    """
    settings = get_settings()

    kwargs: dict[str, Any] = {
        "model_id": settings.LLM_MODEL,
        "region_name": settings.BEDROCK_REGION,
        "model_kwargs": {
            "temperature": 0,
            "max_tokens": 512,
            "top_k": 250,
        },
        "streaming": False,
    }

    kwargs.update(_bedrock_credentials_kwargs(settings))

    return ChatBedrock(**kwargs)


def _image_hash(image_bytes: bytes) -> str:
    """Exact bytes hash (if same image repeats)."""
    return hashlib.sha256(image_bytes).hexdigest()


def build_image_docs_from_pdf_with_ai(
    pdf_path: str,
    image_output_dir: str | Path | None = None,
    llm: ChatBedrock | None = None,
) -> list[Document]:
    """
    Extract unique images from a PDF, caption them with an LLM, and produce RAG-ready Documents.

    - Deduplicates images per-PDF using a hash of the raw bytes.
    - Skips corrupted/empty image streams.
    - Adds basic page + image metadata for downstream retrieval.
    """
    llm = llm or build_bedrock_vision_client()

    pdf_file = ensure_existing_file(pdf_path, kind="PDF")
    output_dir = resolve_image_output_dir(image_output_dir)
    rag_docs: list[Document] = []

    # Avoid redundant disk writes or LLM calls for repeated images within the same PDF
    seen_hashes: set[str] = set()

    with fitz.open(pdf_file) as pdf_doc:
        for page_index, page in enumerate(pdf_doc):
            page_text_snippet = _page_text_snippet(page)

            for image_index, image_info in enumerate(page.get_images(full=True)):
                doc = _build_image_doc_from_pdf_image(
                    pdf_doc=pdf_doc,
                    pdf_file=pdf_file,
                    pdf_path=pdf_path,
                    page_index=page_index,
                    image_index=image_index,
                    page_text_snippet=page_text_snippet,
                    image_info=image_info,
                    output_dir=output_dir,
                    seen_hashes=seen_hashes,
                    llm=llm,
                )
                if doc is not None:
                    rag_docs.append(doc)

    return rag_docs


def _build_image_doc_from_pdf_image(
    *,
    pdf_doc: Any,
    pdf_file: Path,
    pdf_path: str,
    page_index: int,
    image_index: int,
    page_text_snippet: str,
    image_info: Any,
    output_dir: Path,
    seen_hashes: set[str],
    llm: ChatBedrock,
) -> Document | None:
    """
    Build a single RAG Document from one PDF image entry.

    Returns:
        Document if the image is valid and unique, otherwise None.
    """
    # `image_info` is the tuple returned by page.get_images(full=True)
    xref = image_info[0]
    base_image = pdf_doc.extract_image(xref)

    image_bytes = base_image.get("image") or b""
    if not image_bytes:
        # Corrupted or empty stream → skip silently
        return None

    img_hash = _image_hash(image_bytes)
    if img_hash in seen_hashes:
        # Duplicate image within this PDF → skip
        return None
    seen_hashes.add(img_hash)

    image_ext = base_image.get("ext", "png")
    width = base_image.get("width")
    height = base_image.get("height")

    description = _describe_image_bytes_with_llm(
        image_bytes=image_bytes,
        image_ext=image_ext,
        llm=llm,
    )

    image_name = _image_name(pdf_path, page_index, image_index, image_ext)
    image_path = save_binary_file(image_bytes, output_dir / image_name)

    return Document(
        page_content=description,
        metadata={
            "type": "image",
            "source_pdf": str(pdf_file),
            "source": str(pdf_file),
            "page": page_index + 1,
            "image_path": str(image_path),
            "page_text_snippet": page_text_snippet,
            "image_width": width,
            "image_height": height,
            "image_hash": img_hash,
        },
    )
