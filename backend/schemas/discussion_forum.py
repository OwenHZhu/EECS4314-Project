from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone

class ThreadCategory(str):
    """
    Categories for organizing discussions within a book or genre forum.
    """
    SPOILERS = "spoilers"
    QUESTIONS = "questions"
    THEORIES = "theories"



class ThreadPost(BaseModel):
    """
    Represents a discussion thread tied to a specific book or genre.
    """

    id: str = Field(description="MongoDB thread ID")
    book_id: str = Field(description="Associated book ID (can be None for genre-wide threads)")
    user_id: str = Field(description="Author of the thread")

    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)

    category: str = Field(description="spoilers | questions | theories")

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Thread creation time")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Last update time")


class ThreadReply(BaseModel):
    """
    Represents a reply inside a thread (nested discussion system).
    """

    id: str = Field(description="MongoDB post ID")
    thread_id: str = Field(description="Parent thread ID")
    user_id: str = Field(description="Author of the post")

    content: str = Field(min_length=1)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Post creation time")
    updated_at: Optional[datetime] = Field(default=None, description="Optional edit timestamp")