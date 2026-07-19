"""
services/auth.py

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
    register_user           - Create a new user account
    login_user               - Authenticate a user and return a JWT token
    logout_user              - Blacklist the current JWT token
    get_me                   - Fetch the currently authenticated user's profile
    update_profile           - Update the authenticated user's text profile fields (username, bio)
    update_profile_picture   - Validate + swap the authenticated user's profile picture
    update_password          - Change the authenticated user's password
    delete_account           - Permanently delete the authenticated user's account

Dependencies:
    utils/security.py  - hash_password, verify_password (bcrypt)
    utils/jwt.py       - create_token, blacklist_token (JWT + Supabase blacklist)
    utils/profile_pics.py - replace_profile_picture, delete_profile_picture
    schemas/user.py    - UserRegister, UserLogin, UserAccount (Pydantic validation)
    database/record.py - UserRecord (TypedDict for Supabase row type safety)
"""

from typing import cast
from datetime import datetime
from fastapi import UploadFile

from shared.db import supabase
from auth_service.utils.security import hash_password, verify_password
from auth_service.utils.jwt import create_token, blacklist_token
from auth_service.utils.profile_pics import delete_profile_picture, replace_profile_picture
from auth_service.schemas.user import UserRegister, UserLogin, UserAccount, UserUpdate, UserUpdatePassword
from auth_service.utils.record import UserRecord


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


async def update_profile_picture(user_id: str, profile_picture: UploadFile) -> dict:
    """
    Replace the authenticated user's profile picture.

    Split out of update_profile so the profile-picture-specific workflow
    (validate, upload, retire the old file, persist the new filename) lives
    on its own instead of being interleaved with the rest of the profile
    update flow.

    Delegates the actual storage work to
    utils/profile_pics.replace_profile_picture(), which validates and
    uploads the new image first and only deletes the previous one once that
    upload succeeds — so a rejected/failed upload never destroys the user's
    existing picture. The returned filename is then written to the user's
    row in Supabase.

    If the Supabase write fails after the new image has already been
    uploaded, the newly uploaded file is deleted so it doesn't sit in
    storage unreferenced by any user.

    Args:
        user_id: UUID of the authenticated user (from the JWT)
        profile_picture: The newly uploaded image file

    Returns:
        Success: { success: True, message: str, data: UserAccount }
        Failure: { success: False, message: str, data: None }
    """
    current = supabase.table("users").select("*").eq("id", user_id).limit(1).execute()
    if not current.data:
        return {"success": False, "message": "User not found", "data": None}

    current_user = cast(list[UserRecord], current.data)[0]

    try:
        new_filename = await replace_profile_picture(current_user.get("profile_picture"), profile_picture)
    except ValueError as e:
        return {"success": False, "message": str(e), "data": None}

    res = supabase.table("users").update({"profile_picture": new_filename}).eq("id", user_id).execute()

    if not res.data or len(res.data) == 0:
        # DB write failed after the new image was already uploaded — clean it
        # up so it doesn't sit in storage unreferenced by any user.
        await delete_profile_picture(new_filename)
        return {"success": False, "message": "Failed to update profile picture", "data": None}

    updated_user = cast(list[UserRecord], res.data)[0]

    return {
        "success": True,
        "message": "Profile picture updated successfully",
        "data": UserAccount(
            id=updated_user["id"],
            username=updated_user["username"],
            email=updated_user["email"],
            bio=updated_user.get("bio"),
            profile_picture=updated_user.get("profile_picture"),
            created_at=datetime.fromisoformat(updated_user["created_at"])
        )
    }


def update_profile(user_id: str, updates: UserUpdate) -> dict:
    """
    Update the authenticated user's profile fields (username, bio).

    Profile picture changes are handled separately by
    update_profile_picture() — this function only deals with the plain
    text fields.

    A field only counts as "changed" if it differs from the user's current
    stored value — if the frontend resends the same username, or bio stays
    at its default (None), that field is treated as untouched, not an
    update. This matters because the frontend may submit all fields on
    every save even if the user only edited one.

    Nothing is written to the database until every field that DID change
    passes its checks — a failure on any changed field aborts the whole
    update and returns immediately, so partial updates never happen.

    Format constraints (length, etc.) are enforced by UserUpdate itself at
    the request-parsing layer, before this function runs. This function
    only handles checks that require hitting the database (e.g. username
    uniqueness).

    Args:
        user_id: UUID of the authenticated user (from the JWT)
        updates: Validated UserUpdate schema (username, bio — both optional)

    Returns:
        Success: { success: True, message: str, data: UserAccount }
        Failure: { success: False, message: str, data: None }
    """
 
    # Build a dict of only the fields the caller actually provided.
    submitted = updates.model_dump(exclude_unset=True, exclude_none=True)
    submitted.pop("profile_picture", None)
    
    for key in ("bio",):
        if submitted.get(key) == "":
            submitted[key] = None

    submitted = {k: v for k, v in submitted.items() if v is not None}

    if not submitted:
        return {"success": True, "message": "No fields provided to update", "data": None}

     # Fetch the current row so we can tell what actually changed.
    current = supabase.table("users").select("*").eq("id", user_id).limit(1).execute()
    if not current.data:
        return {"success": False, "message": "User not found", "data": None}
    
    current_user = cast(list[UserRecord], current.data)[0]
    
    changed = {
        key: value
        for key, value in submitted.items()
        if value != current_user.get(key)
    }
    
    if not changed:
        return {"success": True, "message": "No changes detected", "data": None}
    
    # 1. username check
    if "username" in changed:
        existing_username = (supabase.table("users").select("id").eq("username", changed["username"]).neq("id", user_id).execute())
        
        if existing_username.data:
            return {"success": False, "message": "Username is already taken", "data": None}
    
    # 2. bio
    if "bio" in changed:
        stripped_bio = changed["bio"].strip()

        if not stripped_bio:
            return {"success": False, "message": "Bio cannot be empty or whitespace", "data": None}

        # Normalize so we don't store leading/trailing whitespace the user
        # didn't intend as part of their bio.
        changed["bio"] = stripped_bio
    
    res = supabase.table("users").update(changed).eq("id", user_id).execute()
    
    if not res.data or len(res.data) == 0:
        return {"success": False, "message": "Failed to update profile", "data": None}

    updated_user = cast(list[UserRecord], res.data)[0]
 
    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": UserAccount(
            id=updated_user["id"],
            username=updated_user["username"],
            email=updated_user["email"],
            bio=updated_user.get("bio"),
            profile_picture=updated_user.get("profile_picture"),
            created_at=datetime.fromisoformat(updated_user["created_at"])
        )
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


def delete_account(user_id: str, token: str) -> dict:
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