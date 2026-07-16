from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone


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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Thread creation time")
    updated_at: Optional[datetime] = Field(default=None, description="Last update time")


class ThreadReply(BaseModel):
    """
    Represents a reply inside a thread (nested discussion system).
    """

    id: str = Field(description="Reply ID")
    thread_id: str = Field(description="Parent thread ID")
    user_id: str = Field(description="Author of the post")

    content: str = Field(min_length=1, max_length=1000)
    parent_reply_id: Optional[str] = Field(default=None, description="Optional parent reply ID for nested replies")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Reply creation time")


class ThreadCreate(BaseModel): #Model used for creating new threads (input validation)
    user_id: str = Field(description="ID of the user creating the thread")
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    tag_ids: list[str] = Field(default_factory=list, description="List of tag IDs to link to this thread")


class ReplyCreate(BaseModel): #Model used for creating new replies (input validation)
    user_id: str = Field(description="ID of the user creating the reply")
    content: str = Field(min_length=1)
    parent_reply_id: Optional[str] = Field(default=None, description="Optional parent reply ID for nested replies")

class UserActivityResponse(BaseModel):
    """
    Represents a user's activity in the discussion forum, including threads and replies.
    """

    user_id: str = Field(description="ID of the user")
    threads: list[ThreadPost] = Field(default_factory=list, description="List of threads created by the user")
    replies: list[ThreadReply] = Field(default_factory=list, description="List of replies made by the user")