from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone


# TODO: Figure out ->  Populate manually or via external API scraping (e.g., Google Books, Open Library).

class BookBase(BaseModel):
    """
    Base book schema used for API input/output.
    """

    title: str = Field(min_length=1, max_length=300)
    subtitle: Optional[str] = Field(default=None)

    authors: List[str] = Field(default_factory=list)
    publisher: Optional[str] = Field(default=None)

    description: Optional[str] = Field(default=None)

    categories: List[str] = Field(default_factory=list)

    language: Optional[str] = Field(default=None)

    published_date: Optional[str] = Field(default=None)

    page_count: Optional[int] = Field(default=None)

    cover_url: Optional[str] = Field(default=None)

    isbn_10: Optional[str] = Field(default=None)
    isbn_13: Optional[str] = Field(default=None)


class BookCreate(BookBase):
    """
    Schema used when creating a book manually or ingesting from an external API.
    """
    pass


class BookDB(BookBase):
    """
    Internal database representation of a book stored in MongoDB.
    """

    id: str = Field(description="MongoDB _id converted to string")

    # external data tracking (important for scraping/API ingestion)
    source: Optional[str] = Field(default=None, description="Data source like google_books or open_library")
    external_id: Optional[str] = Field(default=None, description="ID from external API source")

    # rating system (computed from Library collection)
    avg_rating: float = Field(default=0.0, description="Average rating computed from user library entries")
    ratings_count: int = Field(default=0, description="Number of user ratings for this book")

    # system metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Book creation timestamp")

    # optional enrichment fields
    tags: List[str] = Field(default_factory=list)