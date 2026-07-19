"""
routers/profile_picture.py

Serves a user's profile picture image, stored in Databricks Volumes.

Route:
    GET /api/v1/users/profile-picture/{filename}   (public, no token required)

Flow:
    1. Frontend has a profile_picture filename from the user's
       UserAccount data (returned by GET /auth/me, etc.)
    2. Frontend requests this route directly, e.g. as an <img src="...">
    3. utils/profile_pictures.download_profile_picture() fetches the
       raw bytes from the Databricks Volume
    4. Bytes are returned with the correct image content-type

Note:
    Public by design — filenames are cryptographically random
    (utils/profile_pictures.generate_filename), so there's no
    meaningful info leaked by not requiring auth here. This also lets
    the frontend use the URL directly in <img> tags without attaching
    an Authorization header.

Status codes:
    200 - Image returned successfully
    404 - No image exists at that filename (deleted, never uploaded, or bad filename)
"""

from pathlib import Path
 
from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
 
from auth_service.services.auth import update_profile_picture
from auth_service.utils.jwt import get_current_user_id
from auth_service.utils.profile_pics import download_profile_picture
 
router = APIRouter(prefix="/users", tags=["Users"])

_CONTENT_TYPES = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
}


@router.get("/profile-picture/{filename}")
async def get_profile_picture(filename: str):
    """
    Fetch a profile picture's raw image bytes by its stored filename.

    - filename is the random string stored in users.profile_picture
    - Returns 404 if the file doesn't exist in Databricks
    """

    extension = Path(filename).suffix.lower().replace(".", "")
    content_type = _CONTENT_TYPES.get(extension)

    if content_type is None:
        raise HTTPException(status_code=404, detail="Profile picture not found")

    try:
        image_bytes = await download_profile_picture(filename)
    except Exception:
        raise HTTPException(status_code=404, detail="Profile picture not found")

    return Response(content=image_bytes, media_type=content_type)

@router.put("/profile-picture")
async def put_profile_picture(
    profile_picture: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    """
    Upload a new profile picture for the authenticated user, replacing
    whichever one they currently have (if any).
 
    Delegates to services/auth.update_profile_picture(), which handles
    validation, upload, retiring the old image, and persisting the new
    filename to Supabase — see that function's docstring for the full
    workflow and failure-cleanup behavior.
 
    Returns:
        200 - { success: True, message: str, data: UserAccount }
        400 - Validation failure (bad file type, too large, etc.)
        404 - User not found
    """
 
    result = await update_profile_picture(user_id, profile_picture)
 
    if not result["success"]:
        status_code = 404 if result["message"] == "User not found" else 400
        raise HTTPException(status_code=status_code, detail=result["message"])
 
    return result