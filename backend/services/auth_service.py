from typing import cast
from datetime import datetime

from database.db import supabase
from utils.security import hash_password, verify_password
from schemas.user import UserRegister, UserLogin, UserAccount
from database.record import UserRecord


def register_user(user: UserRegister) -> dict:
    # check if user exists
    existing_email = supabase.table("users").select("*").eq("email", user.email).execute()

    if existing_email.data:
        return {
            "success": False,
            "message": "An account with this email already exists",
            "data": None
        }
        
    existing_username = supabase.table("users").select("id").eq("username", user.username).execute()
    
    if existing_username.data:
        return {
            "success": False,
            "message": "Username is already taken",
            "data": None
        }

    hashed = hash_password(user.password)

    res = supabase.table("users").insert({
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed
    }).execute()

    if not res.data or len(res.data) == 0:
        return {
            "success": False,
            "message": "Failed to create account",
            "data": None
        }

    new_user = cast(list[UserRecord], res.data)[0]

    return {
        "success": True,
        "message": "Account created successfully",
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
    res = supabase.table("users").select("*").eq("email", user.email).limit(1).execute()

    if not res.data:
        return {"success": False, "message": "Invalid credentials", "data": None}

    db_user = cast(list[UserRecord], res.data)[0]

    if not verify_password(user.password, db_user["hashed_password"]):
        return {
            "success": False,
            "message": "Invalid credentials",
            "data": None
        }

    return {
        "success": True,
        "message": "Logged in successfully",
        "data": UserAccount(
            id=db_user["id"],
            username=db_user["username"],
            email=db_user["email"],
            bio=db_user.get("bio"),
            profile_picture=db_user.get("profile_picture"),
            created_at=datetime.fromisoformat(db_user["created_at"])
        )
    }