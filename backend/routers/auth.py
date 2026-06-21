"""
routers/auth.py

Defines all authentication-related API routes for BookAtlas.

All routes are prefixed with /api/v1/auth (set in main.py).

Public routes (no token required):
    POST /auth/register  - Create a new account
    POST /auth/login     - Login with email + password

Protected routes (requires Authorization: Bearer <token> header):
    POST /auth/logout    - Invalidate the current JWT token
    GET  /auth/me        - Get the currently authenticated user's profile

Response shape (all routes):
    {
        "success": bool,
        "message": str,
        "token": str | None,   # only on register/login
        "data": UserAccount | None
    }

TODO:
    PUT    /auth/me           - Update profile (username, bio, profile picture)
    PUT    /auth/me/password  - Change password (verify current password first)
    DELETE /auth/me           - Delete account and all associated data
"""

from fastapi import APIRouter, HTTPException, Security, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from schemas.user import UserRegister, UserLogin, UserAccount
from services.auth_service import register_user, login_user, logout_user, get_me
from utils.jwt import get_current_user_id

router = APIRouter(prefix="/auth", tags=["Auth"])
bearer = HTTPBearer()

@router.post("/register", response_model=UserAccount)
def register(user: UserRegister):
    """
    Register a new user account.

    - Validates email uniqueness and username uniqueness
    - Hashes the password before storing
    - Returns a JWT token + user profile on success
    - Returns 409 if email or username is already taken
    """
    
    result = register_user(user)
    if not result["success"]:
        raise HTTPException(status_code=409, detail=result["message"])
    return result

@router.post("/login", response_model=UserAccount)
def login(user: UserLogin):
    """
    Login with email and password.

    - Verifies credentials against the database
    - Returns a JWT token + user profile on success
    - Returns 401 if credentials are invalid
    """
    
    result = login_user(user)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["message"])
    return result

@router.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Security(bearer)):
    """
    Logout the current user.

    - Blacklists the JWT token in Supabase so it can't be reused
    - Frontend should delete the token from localStorage after calling this
    - Requires Authorization: Bearer <token> header
    """
    
    return logout_user(credentials.credentials)

@router.get("/me")
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

