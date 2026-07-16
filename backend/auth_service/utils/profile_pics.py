"""
utils/profile_pictures.py

Utilities for validating, uploading, downloading, and deleting user profile
pictures stored in Databricks Volumes.

How it works:
    1. The frontend sends a multipart/form-data request containing an image.
    2. validate_image() ensures the file is a supported image type and within
       the maximum allowed size.
    3. generate_filename() creates a cryptographically random filename so
       user-uploaded filenames are never exposed.
    4. upload_profile_picture() uploads the image bytes to the configured
       Databricks Volume.
    5. The returned filename is stored in the users.profile_picture column
       in Supabase.
    6. When a profile picture is requested, download_profile_picture()
       retrieves the image bytes from Databricks.
    7. If a user changes or removes their picture,
       delete_profile_picture() removes the old image from storage.

Storage Strategy:
    Databricks stores the image itself.
    Supabase stores only the randomly generated filename.

Supported image types:
    - png
    - jpg
    - jpeg
    - webp

Maximum upload size:
    5 MB

Environment variables required (.env):
    DATABRICKS_HOST
        Databricks workspace URL

    DATABRICKS_TOKEN
        Personal Access Token

    DATABRICKS_VOLUME_PATH
        Example:
        /Volumes/bookatlas/media/profile_pictures
"""

import os
import secrets
from pathlib import Path, PurePosixPath

from dotenv import load_dotenv
from fastapi import UploadFile

from shared.datalake import databricks_connection

load_dotenv()


MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB

ALLOWED_EXTENSIONS = {
    "png",
    "jpg",
    "jpeg",
    "webp",
}

ALLOWED_CONTENT_TYPES = {
    "image/png",
    "image/jpeg",
    "image/webp",
}

DATABRICKS_VOLUME_PATH = os.getenv("DATABRICKS_VOLUME_PATH")

if not DATABRICKS_VOLUME_PATH:
    raise RuntimeError(
        "Missing DATABRICKS_VOLUME_PATH environment variable."
    )


def generate_filename(extension: str) -> str:
    """
    Generates a secure random filename.

    Args:
        extension:
            File extension without a leading period.

    Returns:
        Example:
            e4f3b86e64d24c8bb1d6bcb59d1dba73.png
    """

    extension = extension.lower().replace(".", "")

    return f"{secrets.token_hex(16)}.{extension}"


def get_picture_path(filename: str) -> str:
    """
    Returns the absolute Databricks Volume path for a stored image.

    Args:
        filename:
            Random filename stored in Supabase.

    Returns:
        Absolute path inside the configured Databricks Volume.
    """

    return str(PurePosixPath(DATABRICKS_VOLUME_PATH) / filename)


async def validate_image(file: UploadFile) -> None:
    """
    Validates an uploaded image.

    Checks:
        - File has a filename
        - Supported extension
        - Supported MIME type
        - File size <= MAX_IMAGE_SIZE

    Raises:
        ValueError
            If validation fails.
    """

    if file.filename is None:
        raise ValueError("No filename provided.")

    extension = Path(file.filename).suffix.lower().replace(".", "")

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type '{extension}'."
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(
            "Unsupported content type."
        )

    contents = await file.read()

    if len(contents) > MAX_IMAGE_SIZE:
        raise ValueError(
            "Profile picture exceeds the maximum size of 5 MB."
        )

    await file.seek(0)


async def upload_profile_picture(file: UploadFile) -> str:
    """
    Uploads a validated profile picture to Databricks.

    Workflow:
        validate image
            ↓
        generate random filename
            ↓
        upload bytes to Databricks
            ↓
        return filename

    Returns:
        Random filename to store in Supabase.
    """

    await validate_image(file)

    extension = Path(file.filename).suffix.lower().replace(".", "")

    filename = generate_filename(extension)

    file_path = get_picture_path(filename)

    image_bytes = await file.read()

    databricks_connection.client.files.upload(
        file_path,
        image_bytes,
        overwrite=False,
    )

    await file.seek(0)

    return filename


async def download_profile_picture(filename: str) -> bytes:
    """
    Downloads a profile picture from Databricks.

    Args:
        filename:
            Filename stored in Supabase.

    Returns:
        Raw image bytes.
    """

    file_path = get_picture_path(filename)

    response = databricks_connection.client.files.download(
        file_path
    )

    return response.contents.read()


async def delete_profile_picture(filename: str) -> None:
    """
    Deletes a profile picture from Databricks.

    Safe to call even if the file does not exist.
    """

    file_path = get_picture_path(filename)
    
    try:
        databricks_connection.client.files.delete(
            file_path
        )
    except Exception:
        pass

async def replace_profile_picture(
    old_filename: str | None,
    new_file: UploadFile,
) -> str:
    """
    Replaces a user's existing profile picture.

    Workflow:
        Upload new image
            ↓
        Delete previous image (if one exists)
            ↓
        Return new filename

    Args:
        old_filename:
            Existing filename stored in Supabase.

        new_file:
            Newly uploaded image.

    Returns:
        Newly generated filename.
    """

    new_filename = await upload_profile_picture(new_file)

    if old_filename:
        await delete_profile_picture(old_filename)

    return new_filename