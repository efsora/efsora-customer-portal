from collections.abc import Iterable
from pathlib import Path


def ensure_existing_file(path: str | Path, kind: str = "file") -> Path:
    """
    Normalize and validate that a file exists.

    Args:
        path: File path to verify.
        kind: Label used in the error message (e.g., "PDF").
    """
    file_path = Path(path)
    if not file_path.is_file():
        raise FileNotFoundError(f"{kind} not found at '{file_path}'")
    return file_path


def save_binary_file(data: bytes, destination: Path) -> Path:
    """Persist binary data to disk, creating parent directories if needed."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    with open(destination, "wb") as file:
        file.write(data)
    return destination


def find_project_root(
    start: str | Path, markers: Iterable[str] = ("pyproject.toml", ".git")
) -> Path:
    """
    Walk upwards from ``start`` to find the nearest directory containing one of ``markers``.

    Returns:
        Path to the directory that contains a marker; if none are found, returns the
        normalized starting directory.
    """
    current = Path(start).resolve()
    if current.is_file():
        current = current.parent

    for parent in (current, *current.parents):
        for marker in markers:
            if (parent / marker).exists():
                return parent

    return current
