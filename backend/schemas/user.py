"""
schemas/user.py

Pydantic schemas for the User data model in BookAtlas.

Schema hierarchy:
    UserBase      → shared fields (username, email) used across multiple schemas
    UserRegister  → extends UserBase with password + validation rules for registration
    UserLogin     → standalone schema for login requests (email + password only)
    UserAccount   → public-facing user profile returned to the frontend after
                    login, registration, or fetching /auth/me

How these schemas are used:
    POST /auth/register  → accepts UserRegister, returns UserAccount + token
    POST /auth/login     → accepts UserLogin, returns UserAccount + token
    GET  /auth/me        → returns UserAccount

Password rules (enforced by UserRegister.validate_password):
    - Minimum length defined by MIN_PASSWORD_LENGTH in utils/constants.py
    - Must contain at least one uppercase letter (A-Z)
    - Must contain at least one lowercase letter (a-z)
    - Must contain at least one number (0-9)
    - Must contain at least one special character (!@#$ etc.)
    - All validation errors are collected and returned together (not one at a time)

Username rules (enforced by UserBase):
    - Minimum 5 characters
    - Maximum 12 characters
    - Must be unique (enforced at the database level in Supabase)

Note:
    Passwords are never stored in plain text. UserRegister receives the plain-text
    password, validates it, and passes it to hash_password() in utils/security.py
    before any database interaction. UserAccount never exposes the hashed password.

TODO:
    - UserUpdate schema for PUT /auth/me (username, bio, profile picture)
    - UserPasswordUpdate schema for PUT /auth/me/password
"""

import re

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime

from utils.constants import MIN_PASSWORD_LENGTH

class UserBase(BaseModel):
    """
    Shared base fields for all user schemas.
    Inherited by UserRegister and UserAccount.
    """

    username: str = Field(min_length=5, max_length=12, description="Unique display name for the user")
    email: EmailStr = Field(description="User email address (validated format)")


class UserRegister(UserBase):
    """
    Schema for user registration requests.

    Accepts username, email, and password.
    Password is validated against BookAtlas password rules before the request
    reaches the service layer. The plain-text password is never stored —
    it is hashed in auth_service.py before insertion into Supabase.
    """

    password: str = Field(min_length=6, description="Plain-text password (will be hashed before storage)")
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """
        Validates the password against BookAtlas security rules.
        Collects all errors and raises them together so the frontend
        can display all issues at once instead of one at a time.
        """
        
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
    Schema for user login requests.

    Does not extend UserBase since username is not required for login —
    users authenticate with email + password only.
    """

    email: EmailStr = Field(description="Registered email address")
    password: str = Field(description="Plain-text password for authentication")


class UserAccount(UserBase):
    """
    Public-facing user profile returned to the frontend.

    Returned by:
        - POST /auth/register  (on successful registration)
        - POST /auth/login     (on successful login)
        - GET  /auth/me        (to restore session on page load)

    Never exposes sensitive fields like hashed_password.
    The id field maps to the UUID primary key in the Supabase users table.
    """

    id: str = Field(description="User ID Supabase")
    bio: Optional[str] = Field(default="", description="User biography shown on profile")
    profile_picture: Optional[str] = Field(default=None, description="Profile image URL")
    created_at: datetime = Field(description="Account creation timestamp")
    
class AuthResponse(BaseModel):
    success: bool = Field(description="Whether the operation succeeded")
    message: str = Field(description="Human-readable result message")
    token: Optional[str] = Field(default=None, description="JWT token (only on register and login)")
    data: Optional[UserAccount] = Field(default=None, description="Authenticated user profile")