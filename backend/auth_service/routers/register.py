"""
routers/register.py

Handles new account creation for BookAtlas.

Route:
    POST /api/v1/auth/register   (public, no token required)

Flow:
    1. Client submits UserRegister (username, email, password)
    2. Password is validated against BookAtlas password rules
       (see schemas/user.py -> UserRegister.validate_password)
    3. services/auth_service.register_user() checks email/username
       uniqueness, hashes the password, and inserts the new row into
       Supabase
    4. On success, returns a JWT token + the new user's public profile

Status codes:
    200 - Account created successfully
    409 - Email or username already taken
    422 - Password/email/username failed validation (raised automatically
          by Pydantic before this route body even runs)
"""

from fastapi import APIRouter, HTTPException

from schemas.user import UserRegister, AuthResponse
from services.auth_service import register_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=AuthResponse)
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