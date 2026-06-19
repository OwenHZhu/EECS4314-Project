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


#possibly separate these into different models for creation vs retrieval 
class ThreadPost(BaseModel):
    """
    Represents a discussion thread tied to a specific book or genre.
    """

    id: str = Field(description="MongoDB thread ID")
    book_id: Optional[str] = Field(default=None, description="Associated book ID (can be None for genre-wide threads)")
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
    parent_reply_id: Optional[str] = Field(default=None, description="Optional parent reply ID for nested replies")

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Post creation time")
    updated_at: Optional[datetime] = Field(default=None, description="Optional edit timestamp")

class ThreadCreate(BaseModel): #Model used for creating new threads (input validation)
    user_id: str = Field(description="ID of the user creating the thread")
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    category: str = Field(description="spoilers | questions | theories")
    book_id: str | None = Field(default=None, description="Optional book this thread belongs to")


class ReplyCreate(BaseModel): #Model used for creating new replies (input validation)
    user_id: str = Field(description="ID of the user creating the reply")
    content: str = Field(min_length=1)
    parent_reply_id: Optional[str] = Field(default=None, description="Optional parent reply ID for nested replies")