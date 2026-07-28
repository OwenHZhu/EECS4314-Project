from fastapi import APIRouter, HTTPException

from auth_service.schemas.user import PublicUser
from auth_service.services.auth import get_user_by_id

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/{user_id}", response_model=PublicUser)
def get_user(user_id: str):
    """
    Public user lookup by ID.

    - Does NOT require authentication
    - Returns a public profile (no email)
    """

    result = get_user_by_id(user_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])

    return result["data"]
