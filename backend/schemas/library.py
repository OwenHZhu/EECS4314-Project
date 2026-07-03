""""
schemas/library.py

TODO: User Library schemas 

This service is responsible for:
    - Managing per-user book statuses (read, currently reading, dropped, finished, want to read)
    - Managing each user's personal lists — Wishlist, Favourites, and custom collections
    - Adding and removing books from each list independently
    - Tracking individual reading progress and user-submitted ratings
    - Sending ratings to the Book Service for global aggregation
    - Storing list history so users can view previously read or dropped books
"""

from enum import Enum
from typing import Optional
from datetime import datetime, timezone

from pydantic import BaseModel, Field


class ReadingStatus(str, Enum):
    """
    Allowed reading statuses for a user's interaction with a book.
    """
    
    READ = "read"
    READING = "reading"
    DROPPED = "dropped"
    WISHLIST = "wishlist"
    FAVOURITE = "favourite"


class LibraryEntryCreate(BaseModel):
    """
    Schema for adding a book to a user's library.

    Used when the frontend sends a request to add a book.
    The frontend provides book_id, reading status, and optional rating.
    """

    book_id: str = Field(description="ID of the book in the global catalogue")

    status: ReadingStatus = Field(description="Current reading status of the book")
    rating: Optional[int] = Field(
        default=None,
        ge=1,
        le=5,
        description="Optional user rating from 1 to 5"
    )


class LibraryEntryUpdate(BaseModel):
    """
    Schema for updating an existing library entry.

    Used when the frontend sends a request to update a book's reading status
    or rating in a user's library.

    The authenticated user's ID and book_id are used together to find the correct library entry.
    status and rating are optional because the user may update only one field.
    """

    book_id: str = Field(description="ID of the book in the user's library")

    status: Optional[ReadingStatus] = Field(
        default=None,
        description="Updated reading status"
    )
    rating: Optional[int] = Field(
        default=None,
        ge=1,
        le=5,
        description="Updated rating from 1 to 5"
    )


class LibraryEntry(BaseModel):
    """
    Full library entry schema.

    Represents a complete library record returned from the database.
    Includes the database entry ID, user ID, book ID, reading status,
    optional rating, and timestamps.
    """

    id: Optional[str] = Field(default=None, description="Library entry ID")
    user_id: str
    book_id: str
    status: ReadingStatus
    rating: Optional[int] = None

    added_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

