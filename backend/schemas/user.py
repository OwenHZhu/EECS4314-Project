import re

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime, timezone

from utils.constants import MIN_PASSWORD_LENGTH

class UserBase(BaseModel):
    """
    Shared base schema for user data used across multiple models.
    """

    username: str = Field(min_length=5, max_length=12, description="Unique display name for the user")
    email: EmailStr = Field(description="User email address (validated format)")


class UserRegister(UserBase):
    """
    Schema for user registration request.
    """

    password: str = Field(min_length=6, description="Plain-text password (will be hashed before storage)")
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        errors = []

        # Length check
        if len(v) < MIN_PASSWORD_LENGTH:
            errors.append("Password must be at least 12 characters long")

        # Character checks
        if not re.search(r"[A-Z]", v):
            errors.append("Password must contain at least one uppercase letter (A-Z)")

        if not re.search(r"[a-z]", v):
            errors.append("Password must contain at least one lowercase letter (a-z)")

        if not re.search(r"[0-9]", v):
            errors.append("Password must contain at least one number (0-9)")

        if not re.search(r"[^A-Za-z0-9]", v):
            errors.append("Password must contain at least one special character (!@#$ etc.)")

        # If any rules failed, raise all messages together
        if errors:
            raise ValueError(" | ".join(errors))

        return v


class UserLogin(BaseModel):
    """
    Schema for user login request.
    """

    email: EmailStr = Field(description="Registered email address")
    password: str = Field(description="Plain-text password for authentication")


class UserAccount(UserBase):
    """
    Public-facing user profile returned to frontend.
    """

    id: str = Field(description="User ID Supabase")
    bio: Optional[str] = Field(default="", description="User biography shown on profile")
    profile_picture: Optional[str] = Field(default=None, description="Profile image URL")
    created_at: datetime = Field(description="Account creation timestamp")