from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone


class ReadingStatus(str, Enum):
    """
    Allowed statuses for a user's interaction with a book.
    """
    READ = "read"
    READING = "reading"
    DROPPED = "dropped"
    WISHLIST = "wishlist"
    FAVOURITE = "favourite"


class LibraryEntry(BaseModel):
    """
    Represents the relationship between a user and a book.
    This is the core tracking system of BookAtlas.
    """

    user_id: str = Field(description="ID of the user owning this library entry")
    book_id: str = Field(description="ID of the book in the global catalog")

    # reading state
    status: ReadingStatus = Field(description="Current reading status of the book for the user")

    # user rating for this book (optional until user finishes or updates later)
    rating: Optional[int] = Field(default=None, ge=1, le=5, description="User rating from 1 to 5 stars")

    # timestamps
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="When the book was added to the library")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Last time this entry was updated")