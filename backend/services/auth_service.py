"""
services/auth_service.py

Business logic for all authentication operations in BookAtlas.

This service sits between the router (routers/auth.py) and the database (Supabase).
The router handles HTTP — this file handles the actual logic.

All functions return a consistent response shape:
    {
        "success": bool,
        "message": str,
        "token":   str | None,   # only on register and login
        "data":    UserAccount | None
    }

Errors are returned as { "success": False, ... } rather than raising exceptions —
the router is responsible for converting these into HTTP error responses.

Functions:
    register_user  - Create a new user account
    login_user     - Authenticate a user and return a JWT token
    logout_user    - Blacklist the current JWT token
    get_me         - Fetch the currently authenticated user's profile

Dependencies:
    utils/security.py  - hash_password, verify_password (bcrypt)
    utils/jwt.py       - create_token, blacklist_token (JWT + Supabase blacklist)
    schemas/user.py    - UserRegister, UserLogin, UserAccount (Pydantic validation)
    database/record.py - UserRecord (TypedDict for Supabase row type safety)
"""

from typing import cast
from datetime import datetime

from database.db import supabase
from utils.security import hash_password, verify_password
from utils.jwt import create_token, blacklist_token
from schemas.user import UserRegister, UserLogin, UserAccount, UserUpdate
from utils.record import UserRecord

def register_user(user: UserRegister) -> dict:
    """
    Create a new user account.

    Checks both email and username uniqueness before inserting.
    Hashes the password with bcrypt before storing — plain-text password
    is never written to the database.
    Generates and returns a JWT token so the user is immediately logged in
    after registering without needing a separate login request.

    Args:
        user: Validated UserRegister schema (username, email, password)

    Returns:
        Success: { success: True, token: str, data: UserAccount }
        Failure: { success: False, message: str, token: None, data: None }
    """
    
    existing_email = supabase.table("users").select("*").eq("email", user.email).execute()
    if existing_email.data:
        return {"success": False, "message": "An account with this email already exists", "data": None, "token": None}

    existing_username = supabase.table("users").select("id").eq("username", user.username).execute()
    if existing_username.data:
        return {"success": False, "message": "Username is already taken", "data": None, "token": None}

    hashed = hash_password(user.password)

    res = supabase.table("users").insert({
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed
    }).execute()

    if not res.data or len(res.data) == 0:
        return {"success": False, "message": "Failed to create account", "data": None, "token": None}

    new_user = cast(list[UserRecord], res.data)[0]
    token = create_token(new_user["id"])

    return {
        "success": True,
        "message": "Account created successfully",
        "token": token,
        "data": UserAccount(
            id=new_user["id"],
            username=new_user["username"],
            email=new_user["email"],
            bio=new_user.get("bio"),
            profile_picture=new_user.get("profile_picture"),
            created_at=datetime.fromisoformat(new_user["created_at"])
        )
    }

def login_user(user: UserLogin) -> dict:
    """
    Authenticate a user with email and password.

    Looks up the user by email, then verifies the submitted password
    against the stored bcrypt hash. Returns a JWT token on success.

    Both "user not found" and "wrong password" return the same generic
    "Invalid credentials" message intentionally — never reveal which
    field was wrong to prevent user enumeration attacks.

    Args:
        user: Validated UserLogin schema (email, password)

    Returns:
        Success: { success: True, token: str, data: UserAccount }
        Failure: { success: False, message: "Invalid credentials", token: None, data: None }
    """
    
    res = supabase.table("users").select("*").eq("email", user.email).limit(1).execute()

    if not res.data:
        return {"success": False, "message": "Invalid credentials", "data": None, "token": None}

    db_user = cast(list[UserRecord], res.data)[0]

    if not verify_password(user.password, db_user["hashed_password"]):
        return {"success": False, "message": "Invalid credentials", "data": None, "token": None}

    token = create_token(db_user["id"])

    return {
        "success": True,
        "message": "Logged in successfully",
        "token": token,
        "data": UserAccount(
            id=db_user["id"],
            username=db_user["username"],
            email=db_user["email"],
            bio=db_user.get("bio"),
            profile_picture=db_user.get("profile_picture"),
            created_at=datetime.fromisoformat(db_user["created_at"])
        )
    }


def logout_user(token: str) -> dict:
    """
    Invalidate a JWT token by adding it to the blacklist in Supabase.

    Once blacklisted, the token will be rejected by verify_token() in utils/jwt.py
    even if it hasn't expired yet. The blacklisted_tokens table is cleaned up
    automatically by a pg_cron job that runs nightly at midnight.

    Args:
        token: The raw JWT token string from the Authorization header

    Returns:
        { success: True, message: "Logged out successfully", data: None }
    """
    
    blacklist_token(token)
    return {"success": True, "message": "Logged out successfully", "data": None}


def get_me(user_id: str) -> dict:
    """
    Fetch the currently authenticated user's profile from Supabase.

    Called by GET /auth/me after the JWT token has been verified and the
    user_id extracted by get_current_user_id() in utils/jwt.py.
    Used by the frontend on page load to restore the logged-in user state
    from a token stored in localStorage.

    Args:
        user_id: UUID of the authenticated user extracted from the JWT payload

    Returns:
        Success: { success: True, message: str, data: UserAccount }
        Failure: { success: False, message: "User not found", data: None }
    """
    
    res = supabase.table("users").select("*").eq("id", user_id).limit(1).execute()

    if not res.data:
        return {"success": False, "message": "User not found", "data": None}

    user = cast(list[UserRecord], res.data)[0]

    return {
        "success": True,
        "message": "User fetched successfully",
        "data": UserAccount(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            bio=user.get("bio"),
            profile_picture=user.get("profile_picture"),
            created_at=datetime.fromisoformat(user["created_at"])
        )
    }
    
def update_user(user_id: str, updates: UserUpdate) -> dict:
    """
    Update the authenticated user's profile fields.
 
    Only fields explicitly provided in the request body are updated —
    omitted fields are left unchanged. If a new username is submitted,
    uniqueness is checked before applying the update.
 
    Args:
        user_id: UUID of the authenticated user extracted from the JWT payload
        updates: Validated UserUpdate schema (username, bio, profile_picture —
                 all optional)
 
    Returns:
        Success: { success: True, message: str, data: UserAccount }
        Failure: { success: False, message: str, data: None }
 
    Note:
        UserUpdate should be defined with model_config = ConfigDict(extra="forbid")
        and all fields Optional so callers can send partial payloads.
    """
 
    # Build a dict of only the fields the caller actually provided.
    payload = updates.model_dump(exclude_unset=True)
 
    if not payload:
        return {"success": False, "message": "No fields provided to update", "data": None}
 
    if "username" in payload:
        existing = (supabase.table("users").select("id").eq("username", payload["username"]).neq("id", user_id))
        
        if existing.data:
            return {"success": False, "message": "Username is already taken", "data": None}
    
    if "bio" in payload and len(payload["bio"].split()) > 150:
        return {"success": False, "message": "Bio description must not exceed 150 words", "data": None}
    
    res = (supabase.table("users").update(payload).eq("id", user_id).execute())
 
    if not res.data or len(res.data) == 0:
        return {"success": False, "message": "Failed to update profile", "data": None}
 
    updated_user = cast(list[UserRecord], res.data)[0]
 
    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": UserUpdate(username=updated_user["username"], bio=updated_user.get("bio"), profile_picture=updated_user.get("profile_picture"))
    }
    
def update_password(user_id: str, passwords: UserUpdatePassword) -> dict:
    """
    Change the authenticated user's password.

    Verifies the submitted current_password against the stored bcrypt hash
    before applying any change. The passwords_must_differ validator on
    UserUpdatePassword ensures new_password != current_password before
    this function is ever called.

    Args:
        user_id:   UUID of the authenticated user extracted from the JWT payload
        passwords: Validated UserUpdatePassword schema (current_password, new_password)

    Returns:
        Success: { success: True, message: str, data: None }
        Failure: { success: False, message: str, data: None }
    """
    
    res = supabase.table("users").select("hashed_password").eq("id", user_id).limit(1).execute()

    if not res.data:
        return {"success": False, "message": "User not found", "data": None}

    if not verify_password(passwords.current_password, res.data[0]["hashed_password"]):
        return {"success": False, "message": "Current password is incorrect", "data": None}

    update_res = (
        supabase.table("users")
        .update({"hashed_password": hash_password(passwords.new_password)})
        .eq("id", user_id)
        .execute()
    )

    if not update_res.data or len(update_res.data) == 0:
        return {"success": False, "message": "Failed to update password", "data": None}

    return {"success": True, "message": "Password updated successfully", "data": None}


def delete_user(user_id: str, token: str) -> dict:
    """
    Permanently delete the authenticated user's account and all associated data.

    Blacklists the current JWT token before deletion so the session is
    immediately invalidated even if the delete fails. Relies on ON DELETE
    CASCADE constraints in Supabase to remove associated data automatically.

    Args:
        user_id: UUID of the authenticated user extracted from the JWT payload
        token:   Raw JWT token string from the Authorization header

    Returns:
        Success: { success: True, message: str, data: None }
        Failure: { success: False, message: str, data: None }
    """

    # Invalidate the session before touching the account
    blacklist_token(token)

    res = supabase.table("users").delete().eq("id", user_id).execute()

    if not res.data or len(res.data) == 0:
        return {"success": False, "message": "User not found", "data": None}

    return {"success": True, "message": "Account deleted successfully", "data": None}