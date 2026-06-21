"""
utils/jwt.py

JWT token creation, verification, and blacklisting for BookAtlas authentication.

How it works:
    1. On login/register, create_token() generates a signed JWT containing the user's ID
    2. The frontend stores the token in localStorage and sends it in the
       Authorization: Bearer <token> header on every protected request
    3. get_current_user_id() is used as a FastAPI dependency on protected routes —
       it extracts and verifies the token and returns the user_id to the route handler
    4. On logout, blacklist_token() adds the token to the blacklisted_tokens table
       in Supabase so it can't be reused even if it hasn't expired yet

Token structure (JWT payload):
    {
        "sub": "user-uuid",   # user ID
        "iat": 1234567890,    # issued at (UTC)
        "exp": 1234567890     # expires at (UTC, 24 hours after iat)
    }

Token blacklist: TODO: Replace with Redis (Talk with TA)
    Stored in the blacklisted_tokens table in Supabase.
    Expired tokens are cleaned up automatically every midnight by a pg_cron job.

Environment variables required (.env):
    JWT_SECRET - Long random string used to sign tokens

"""

import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database.db import supabase

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 1440  # 24 hours

if not JWT_SECRET:
    raise ValueError("Missing JWT_SECRET in environment variables.\n")

bearer = HTTPBearer()

def create_token(user_id: str) -> str:
    """
    Generate a signed JWT token for a user.

    Args:
        user_id: Supabase UUID of the authenticated user

    Returns:
        Signed JWT token string to be sent to the frontend
    """
    
    payload = {
        "sub": user_id,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    }
    
    if not JWT_SECRET:
        raise ValueError("Missing JWT_SECRET in environment variables.\n")
    
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> str | None:
    """
    Verify a JWT token and return the user ID if valid.

    Checks the blacklist first — if the token has been invalidated via logout
    it is rejected immediately regardless of expiry.
    Then verifies the signature and expiry using the JWT_SECRET.

    Args:
        token: Raw JWT token string from the Authorization header

    Returns:
        user_id string if the token is valid, None if invalid/expired/blacklisted
    """
    
    try:
        blacklisted = supabase.table("blacklisted_tokens").select("token").eq("token", token).execute()
        if blacklisted.data:
            return None
        
        if not JWT_SECRET:
            raise ValueError("Missing JWT_SECRET in environment variables.\n")

        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")

    except JWTError:
        return None
    

def blacklist_token(token: str):
    """
    Add a token to the blacklist in Supabase to invalidate it on logout.

    The token is stored with its expiry time so the nightly pg_cron cleanup
    job can remove it automatically once it would have expired anyway.

    Args:
        token: Raw JWT token string to invalidate
    """
    
    exp = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    supabase.table("blacklisted_tokens").insert({
        "token": token,
        "expires_at": exp.isoformat()
    }).execute()
    
def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Security(bearer)
) -> str:
    """
    FastAPI dependency that extracts and validates the JWT token from the
    Authorization header and returns the authenticated user's ID.

    Used with Depends() on any protected route:
        @router.get("/me")
        def me(user_id: str = Depends(get_current_user_id)):
            ...

    Args:
        credentials: Injected by FastAPI from the Authorization: Bearer <token> header

    Returns:
        user_id string of the authenticated user

    Raises:
        HTTPException 401: If the token is missing, expired, or blacklisted
    """
    
    token = credentials.credentials
    user_id = verify_token(token)

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user_id