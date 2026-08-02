"""
schemas/collection.py

Schemas for managing a user's custom book collections.

This module is responsible for:
    - Validating collection creation and update requests
    - Representing complete collection records
    - Representing books stored inside a collection
"""

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class CollectionCreate(BaseModel):
    """
    Schema for creating a custom collection.

    The authenticated user's ID is taken from the JWT token and should not be
    included in the frontend request body.
    """

    name: str = Field(
        min_length=1,
        max_length=100,
        description="Name of the collection"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Optional description of the collection"
    )


class CollectionUpdate(BaseModel):
    """
    Schema for updating an existing collection.

    Both fields are optional so the frontend can update the collection name,
    description, or both.
    """

    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Updated collection name"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Updated collection description"
    )


class Collection(BaseModel):
    """
    Full collection schema returned from the database.
    """

    id: Optional[str] = Field(default=None, description="Collection ID")
    user_id: str
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class CollectionBook(BaseModel):
    """
    Schema representing a book stored inside a collection.
    """

    collection_id: str
    book_id: str
    added_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
