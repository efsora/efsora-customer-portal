"""S3 infrastructure module for document operations."""

from app.infrastructure.s3.client import download_file_from_s3

__all__ = ["download_file_from_s3"]
