from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timezone


class UserBase(BaseModel):
    """
    Shared base schema for user data used across multiple models.
    """

    username: str = Field(min_length=3, max_length=30, description="Unique display name for the user")
    email: EmailStr = Field(description="User email address (validated format)")


class UserRegister(UserBase):
    """
    Schema for user registration request.
    """

    password: str = Field(min_length=6, description="Plain-text password (will be hashed before storage)")


class UserLogin(BaseModel):
    """
    Schema for user login request.
    """

    email: EmailStr = Field(description="Registered email address")
    password: str = Field(description="Plain-text password for authentication")


class UserDB(UserBase):
    """
    Internal database model for MongoDB storage.
    """

    id: str = Field(description="MongoDB _id converted to string")
    hashed_password: str = Field(description="Hashed password stored securely using bcrypt")
    bio: Optional[str] = Field(default="", description="User biography")
    profile_picture: Optional[str] = Field(default=None, description="Profile image URL") # add a placeholder for a default image
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Account creation timestamp")

    # Future social features
    # followers: List[str] = []
    # following: List[str] = []


class UserAccount(UserBase):
    """
    Public-facing user profile returned to frontend.
    """

    id: str = Field(description="User ID (MongoDB _id)")
    bio: Optional[str] = Field(default="", description="User biography shown on profile")
    profile_picture: Optional[str] = Field(default=None, description="Profile image URL")
    created_at: datetime = Field(description="Account creation timestamp")