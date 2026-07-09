"""
schemas/book.py

Pydantic schemas for the Book data model in BookAtlas.

Schema hierarchy:
    BookBase    → shared core fields (title, author, description, etc.)
    BookCreate  → extends BookBase with DB/seeding specific fields (external_id, cover_image, etc.)

BookCreate is used by the seeding script and on-demand book fetching to validate
and structure book data before inserting into the book_catalogue table in Supabase.

TODO:
    - Add schemas for user book library entries (user adding a book to their personal library)
    - Add schemas for user lists (wishlist, favourites)
"""


from pydantic import BaseModel, Field
from typing import Optional, List

class BookBase(BaseModel):
    """
    Shared core fields for all book schemas.
    Contains the human-readable metadata about a book.
    """

    title: str = Field(min_length=1, max_length=300, description="Full title of the book")
    author: str = Field(description="Comma-separated author names, capped at 3")
    description: Optional[str] = Field(default=None, description="Book synopsis or blurb")
    genre: Optional[List[str]] = Field(default=None, description="Up to 5 subjects/genres")
    isbn: Optional[str] = Field(default=None, description="First available ISBN")
    published_date: Optional[str] = Field(default=None, description="Year of first publication as string")
    page_count: Optional[int] = Field(default=None, description="Median page count across all editions")

class BookCreate(BookBase):
    """
    Schema for creating a new book entry in the database.
    Extends BookBase with fields required for DB storage and external API tracking.

    Used by:
        - Seeding script (utils/book_collection_seed.py) to insert Open Library books
        - On-demand fetching when a user searches for a book not in our DB

    All fields map directly to columns in the book_catalogue table in Supabase.
    """

    external_id: str = Field(description="Open Library work ID e.g. '/works/OL45804W'")
    cover_image: Optional[str] = Field(default=None, description="Full URL to cover image from Open Library covers API")
    series: Optional[str] = Field(default=None, description="Series name if available e.g. 'Harry Potter'")
    publisher: Optional[str] = Field(default=None, description="First listed publisher")
    time_period: Optional[str] = Field(default=None, description="Time period or era the book is set in")
    