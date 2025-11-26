import base64
import hashlib
import mimetypes
import os
from pathlib import Path
from typing import Any

import fitz  # type: ignore[import-not-found]
from langchain_aws import ChatBedrock
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage

from app.core.settings import get_settings

PAGE_TEXT_SNIPPET_LIMIT = 800
DEFAULT_MEDIA_TYPE = "image/png"


def _encode_image_to_base64(image_bytes: bytes) -> str:
    """Image bytes -> base64 string."""
    return base64.b64encode(image_bytes).decode("utf-8")


def _guess_media_type(image_ext: str | None) -> str:
    """Best-effort MIME guess for Bedrock vision payloads."""
    if image_ext:
        media_type, _ = mimetypes.guess_type(f"file.{image_ext}")
        if media_type:
            return media_type
    return DEFAULT_MEDIA_TYPE


def resolve_image_output_dir(image_output_dir: str | Path | None) -> Path:
    """Resolve image output dir relative to repo root, ensure it exists."""
    settings = get_settings()
    output_dir = (
        Path(image_output_dir)
        if image_output_dir is not None
        else Path(settings.OUTPUT_DIR) / "images"
    )

    if not output_dir.is_absolute():
        project_root = Path(__file__).resolve().parents[3]
        output_dir = project_root / output_dir

    try:
        output_dir.mkdir(parents=True, exist_ok=True)
    except PermissionError as exc:
        raise PermissionError(
            f"Cannot create image output directory at '{output_dir}'. "
            "Please point image_output_dir to a writable path."
        ) from exc

    return output_dir


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
    image_b64 = _encode_image_to_base64(image_bytes)
    media_type = _guess_media_type(image_ext)

    response = llm.invoke([_build_vision_prompt(image_b64, media_type)])
    return _extract_response_text(getattr(response, "content", response)).strip()


def _page_text_snippet(page: fitz.Page, limit: int = PAGE_TEXT_SNIPPET_LIMIT) -> str:
    text = page.get_text("text").strip()
    return text[:limit] if text else ""


def _save_image(image_bytes: bytes, destination: Path) -> Path:
    with open(destination, "wb") as file:
        file.write(image_bytes)
    return destination


def _image_name(pdf_path: str, page_index: int, image_index: int, image_ext: str | None) -> str:
    ext = image_ext or "png"
    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
    return f"{pdf_name}_p{page_index + 1}_img{image_index + 1}.{ext}"


def build_bedrock_vision_client() -> ChatBedrock:
    """Create a non-streaming Bedrock client suitable for vision prompts (matches other configs)."""
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

    if settings.AWS_ACCESS_KEY_ID:
        kwargs["credentials_profile_name"] = None
        kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
    if settings.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY

    return ChatBedrock(**kwargs)


def _image_hash(image_bytes: bytes) -> str:
    """Exact bytes hash (if same image repeats)."""
    return hashlib.sha256(image_bytes).hexdigest()


def build_image_docs_from_pdf_with_ai(
    pdf_path: str,
    image_output_dir: str | Path | None = None,
    llm: ChatBedrock | None = None,
) -> list[Document]:
    """Extract unique images from PDF, caption with Claude, and build RAG-ready docs."""
    if llm is None:
        llm = build_bedrock_vision_client()

    output_dir = resolve_image_output_dir(image_output_dir)
    rag_docs: list[Document] = []

    # 🔁 hash -> cached info (aynı image için ikinci kez AI çağrısı veya disk yazımı yok)
    seen_images: dict[str, dict[str, Any]] = {}

    with fitz.open(pdf_path) as pdf_doc:
        for page_index, page in enumerate(pdf_doc):
            page_text_snippet = _page_text_snippet(page)

            for image_index, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base_image = pdf_doc.extract_image(xref)

                image_bytes = base_image["image"]
                image_ext = base_image.get("ext", "png")
                width = base_image.get("width")
                height = base_image.get("height")

                img_hash = _image_hash(image_bytes)

                # Skip duplicates completely (no extra disk writes or docs)
                if img_hash in seen_images:
                    continue

                description = _describe_image_bytes_with_llm(
                    image_bytes=image_bytes,
                    image_ext=image_ext,
                    llm=llm,
                )

                image_name = _image_name(pdf_path, page_index, image_index, image_ext)
                image_path = _save_image(image_bytes, output_dir / image_name)

                seen_images[img_hash] = {
                    "description": description,
                    "image_path": image_path,
                    "width": width,
                    "height": height,
                }

                rag_docs.append(
                    Document(
                        page_content=description,
                        metadata={
                            "type": "image",
                            "source_pdf": pdf_path,
                            "source": pdf_path,
                            "page": page_index + 1,
                            "image_path": str(image_path),
                            "page_text_snippet": page_text_snippet,
                            "image_width": width,
                            "image_height": height,
                            "image_hash": img_hash,
                        },
                    )
                )

    return rag_docs
