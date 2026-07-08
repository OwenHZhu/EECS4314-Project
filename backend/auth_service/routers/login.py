"""
routers/login.py

Handles authentication for existing BookAtlas users.

Route:
    POST /api/v1/auth/login   (public, no token required)

Flow:
    1. Client submits UserLogin (email + password)
    2. services/auth_service.login_user() looks up the user by email,
       verifies the password against the stored hash
    3. On success, issues a new JWT token + returns the user's public
       profile

Status codes:
    200 - Login successful
    401 - Invalid email or password (intentionally vague to avoid
          leaking which field was wrong)

TODO:
    - Add login attempt throttling / lockout after N failed attempts
"""

from fastapi import APIRouter, HTTPException

from auth_service.schemas.user import UserLogin, AuthResponse
from auth_service.services.auth import login_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=AuthResponse)
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