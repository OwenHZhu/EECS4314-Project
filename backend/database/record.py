from typing import TypedDict

class UserRecord(TypedDict):
    id: str
    username: str
    email: str
    hashed_password: str
    bio: str | None
    profile_picture: str | None
    created_at: str