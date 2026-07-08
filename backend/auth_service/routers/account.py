"""
routers/account.py

Handles session management and profile operations for authenticated
BookAtlas users. All routes require a valid JWT.

Routes:
    POST   /api/v1/auth/logout       (protected)
    GET    /api/v1/auth/me           (protected)
    PUT    /api/v1/auth/me           (protected)
    PUT    /api/v1/auth/me/password  (protected)
    DELETE /api/v1/auth/me           (protected)

Auth mechanism:
    Requires header  Authorization: Bearer <token>
    - /logout reads the raw token directly (it needs to blacklist the
      exact token string)
    - All other routes resolve the token to a user_id via the
      get_current_user_id dependency (utils/jwt.py), which also rejects
      blacklisted/expired tokens
"""

from fastapi import APIRouter, HTTPException, Security, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from auth_service.schemas.user import AuthResponse, UserUpdate, UserUpdatePassword
from auth_service.services.auth import (
    logout_user,
    get_me,
    update_profile,
    update_password,
    delete_account,
)
from auth_service.utils.jwt import get_current_user_id

router = APIRouter(prefix="/auth", tags=["Auth"])
bearer = HTTPBearer()

@router.post("/logout", response_model=AuthResponse)
def logout(credentials: HTTPAuthorizationCredentials = Security(bearer)):
    """
    Logout the current user.

    - Blacklists the JWT token in Supabase so it can't be reused
    - Frontend should delete the token from localStorage after calling this
    - Requires Authorization: Bearer <token> header
    """

    return logout_user(credentials.credentials)


@router.get("/me", response_model=AuthResponse)
def me(user_id: str = Depends(get_current_user_id)):
    """
    Get the currently authenticated user's profile.

    - Extracts user ID from the JWT token via get_current_user_id dependency
    - Used by the frontend on page load to restore the logged-in user state
    - Returns 401 if token is missing, expired, or blacklisted
    - Returns 404 if user no longer exists in the database
    """

    result = get_me(user_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result

@router.put("/me", response_model=AuthResponse)
def update_me(payload: UserUpdate, user_id: str = Depends(get_current_user_id)):
    """
    Update the authenticated user's profile.

    - Accepts a partial update: username, bio, and/or profile_picture
      (all fields optional — only provided fields are changed)
    - Username uniqueness is re-checked if a new username is provided
    - Returns the updated public profile on success
    - Returns 409 if the new username is already taken
    - Returns 404 if the user no longer exists in the database
    
    Profile Picture will not work because we have nowhere to store them at the current moment
    """

    result = update_profile(user_id, payload)
    if not result["success"]:
        status_code = 409 if "username" in result["message"].lower() else 404
        raise HTTPException(status_code=status_code, detail=result["message"])
    return result

@router.put("/me/password", response_model=AuthResponse)
def update_me_password(
    payload: UserUpdatePassword, user_id: str = Depends(get_current_user_id)
):
    """
    Change the authenticated user's password.

    - Verifies current_password matches the stored hash before allowing
      the change (see services/auth_service.update_password)
    - new_password must differ from current_password
      (enforced by UserUpdatePassword.passwords_must_differ)
    - Hashes the new password before storing — plain text is never persisted
    - Returns 401 if current_password is incorrect
    - Returns 404 if the user no longer exists in the database

    Note:
        This does NOT log the user out of other active sessions/tokens.
        If you want to force re-login everywhere after a password change,
        blacklist all existing tokens for this user_id here.
    """

    result = update_password(user_id, payload)
    if not result["success"]:
        status_code = 401 if "incorrect" in result["message"].lower() else 404
        raise HTTPException(status_code=status_code, detail=result["message"])
    return result

@router.delete("/me", response_model=AuthResponse)
def delete_me(user_id: str = Depends(get_current_user_id)):
    """
    Permanently delete the authenticated user's account.

    - Deletes the user row from Supabase along with all associated data
      (see services/auth_service.delete_account for cascade behavior —
      e.g. reviews, discussion posts, book_atlas entries tied to this user)
    - Blacklists the current token as part of cleanup so it can't be reused
    - This action is irreversible — frontend should confirm with the user
      before calling this route
    - Returns 404 if the user no longer exists in the database
    """

    result = delete_account(user_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result