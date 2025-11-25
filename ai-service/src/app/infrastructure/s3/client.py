"""
AWS S3 Client for AI Service.

Provides async functionality for downloading files from S3.
Used for retrieving documents uploaded via presigned URLs.
"""

from collections.abc import AsyncGenerator
from pathlib import Path
import tempfile

from aiobotocore.session import get_session

from app.core.context import Context
from app.core.settings import Settings


async def download_file_from_s3(
    ctx: Context,
    settings: Settings,
    s3_key: str,
    progress_callback: AsyncGenerator[tuple[int, int], None] | None = None,
) -> Path:
    """
    Download a file from S3 to a temporary location.

    Args:
        ctx: Application context for logging
        settings: Application settings containing S3 configuration
        s3_key: The S3 object key to download
        progress_callback: Optional async generator to report download progress

    Returns:
        Path to the downloaded temporary file

    Raises:
        ValueError: If S3 bucket is not configured
        Exception: If download fails
    """
    if not settings.AWS_S3_BUCKET:
        raise ValueError("AWS_S3_BUCKET is not configured")

    # Determine file extension from s3_key
    file_extension = Path(s3_key).suffix or ".tmp"

    # Create a temporary file with the correct extension
    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=file_extension,
        prefix="embed_doc_",
    )
    temp_path = Path(temp_file.name)
    temp_file.close()

    ctx.logger.info(
        f"Downloading file from S3: {s3_key}",
        s3_key=s3_key,
        bucket=settings.AWS_S3_BUCKET,
        temp_path=str(temp_path),
    )

    session = get_session()

    async with session.create_client(
        "s3",
        region_name=settings.AWS_S3_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    ) as s3_client:
        try:
            # Get object metadata first to know the file size
            head_response = await s3_client.head_object(
                Bucket=settings.AWS_S3_BUCKET,
                Key=s3_key,
            )
            total_size = head_response.get("ContentLength", 0)

            ctx.logger.info(
                f"File size: {total_size} bytes",
                s3_key=s3_key,
                file_size=total_size,
            )

            # Download the file
            response = await s3_client.get_object(
                Bucket=settings.AWS_S3_BUCKET,
                Key=s3_key,
            )

            # Read the entire body asynchronously
            async with response["Body"] as stream:
                body_content = await stream.read()

            # Write to temp file (sync operation on local file is acceptable here)
            temp_path.write_bytes(body_content)
            downloaded_bytes = len(body_content)

            ctx.logger.info(
                f"Successfully downloaded file from S3: {s3_key}",
                s3_key=s3_key,
                downloaded_bytes=downloaded_bytes,
                temp_path=str(temp_path),
            )

            return temp_path

        except Exception as e:
            # Clean up temp file on error
            if temp_path.exists():
                temp_path.unlink()

            ctx.logger.error(
                f"Failed to download file from S3: {s3_key}",
                s3_key=s3_key,
                error=str(e),
            )
            raise
