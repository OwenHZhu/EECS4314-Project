"""
utils/record.py

TypedDicts let us cast the raw Supabase response to a known shape for type-safety.
"""

from typing import TypedDict

class UserRecord(TypedDict):
    id: str
    username: str
    email: str
    hashed_password: str
    bio: str | None
    profile_picture: str | None
    created_at: str