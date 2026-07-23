"""
schemas/discussion_forum.py

Pydantic schemas for the discussion forum data model in the BookAtlas
Discussion Service.

Schema hierarchy:
    Tag                    → a single tag, as returned by GET /forum/tags
    ThreadPost             → full thread record, as returned by the API
                            (matches the "thread_forum" row in Supabase)
    ThreadReply            → full reply record, as returned by the API
                            (matches the "replies" row in Supabase, supports
                            nesting via parent_reply_id)
    ThreadCreate           → input schema for creating a new thread
    ThreadUpdate           → input schema for editing an existing thread
    ReplyCreate            → input schema for creating a new reply
    UserActivityResponse   → aggregate view of one user's threads + replies

How these schemas are used:
    GET  /forum/tags                          → returns list[Tag]
    POST /forum/threads                       → accepts ThreadCreate,  returns ThreadPost
    GET  /forum/threads                       → returns list[ThreadPost]
    GET  /forum/threads/{thread_id}           → returns ThreadPost
    PATCH /forum/threads/{thread_id}          → accepts ThreadUpdate,  returns ThreadPost
    POST /forum/threads/{thread_id}/replies   → accepts ReplyCreate,  returns ThreadReply
    GET  /forum/threads/{thread_id}/replies   → returns list[ThreadReply] (flat or nested)
    GET  /forum/users/{user_id}/activity      → returns UserActivityResponse
    POST /forum/threads/{thread_id}/like      → toggles a like, no request body
    POST /forum/replies/{reply_id}/like       → toggles a like, no request body

Storage:
    Backed by Supabase (Postgres). ThreadPost maps to the "thread_forum"
    table, ThreadReply to "replies", Tag to "tags". See
    services/discussion_service.py (build_thread, build_reply, build_tag)
    for the exact record → schema mapping.

Note on user_id (auth):
    ThreadCreate and ReplyCreate deliberately do NOT include a user_id
    field. user_id is resolved server-side in routers/discussion_forum.py
    via Depends(get_current_user_id) (imported from auth_service.utils.jwt)
    and passed into services/discussion_service.create_thread /
    create_reply from the verified token — never trust a user_id sent in
    a request body for a write.

Note on tags (CHANGED — was tag_ids, now tags by name):
    Earlier versions of ThreadCreate took tag_ids: list[str], meaning the
    frontend had to already know a tag's UUID before it could attach it —
    which only works if tags are pre-created and the user picks from a
    list. The actual UI (a free-text "add tags" input where an unrecognized
    tag gets created on the spot) doesn't work that way: the user types a
    tag *name*, not an ID.

    So ThreadCreate.tags is now list[str] of tag *names*. The service
    layer (create_thread) is responsible for resolving each name to a
    tags.id — creating a new row in "tags" if the name doesn't exist yet —
    before linking via thread_tags. This also means the old "invalid
    tag_id → 400" failure mode from the tag_ids design mostly goes away:
    since names are get-or-created rather than looked up, there's no
    "this ID doesn't exist" case anymore, just normal name validation
    (min/max length, etc.).

    On the read side, ThreadPost.tags is list[Tag] (full objects: id +
    name), not just tag_ids — the frontend needs the tag's name to render
    a pill ("Tag 1" with an x to remove), not just its ID, so returning
    full Tag objects avoids a second round-trip to GET /forum/tags to
    resolve names. This is the split flagged in the previous TODO
    (create-request shape vs. read-response shape can differ).

Note on has_spoilers (NEW):
    thread_forum now has a has_spoilers boolean column (not null, default
    false). The frontend must let the user flag a post as containing
    spoilers before submitting; the API defaults to False rather than
    requiring the field, so existing/simple clients that don't send it
    don't break, but the UI should make selecting it deliberate — a post
    that's actually about spoilers left unflagged defeats the point of
    having the column at all.
"""

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class Tag(BaseModel):
    """
    A single tag, as returned by GET /forum/tags and embedded in
    ThreadPost.tags.

    Maps to a row in the "tags" table. thread_tags.tag_id has a real
    foreign key to tags.id — see services/discussion_service.create_thread()
    for how a tag name gets resolved/created before that link is made.
    """

    id: str = Field(description="Supabase UUID primary key for this tag")
    name: str = Field(min_length=1, description="Unique tag name (case-sensitive uniqueness enforced at the DB level)")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Tag creation time")


class ThreadPost(BaseModel):
    """
    Full representation of a discussion thread, as returned to the client.

    Maps to a row in the "thread_forum" Supabase table. Built by
    services/discussion_service.build_thread(), which attaches full Tag
    objects looked up via the "thread_tags" join table and updated_at
    straight from the row.
    """

    id: str = Field(description="Supabase UUID primary key for this thread")
    book_id: Optional[str] = Field(default=None, description="Associated book ID (None for genre-wide threads not tied to a specific book)")
    user_id: str = Field(description="Author of the thread (resolved server-side from the token at creation time, not client-supplied)")

    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    has_spoilers: bool = Field(default=False, description="Whether this post should be hidden/blurred by default as containing spoilers")
    tags: list[Tag] = Field(default_factory=list, description="Full tag objects linked to this thread via the thread_tags join table")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Thread creation time")
    updated_at: Optional[datetime] = Field(default=None, description="Last update time — set by update_thread(); None until the thread is first edited")


class ThreadReply(BaseModel):
    """
    Full representation of a reply, as returned to the client.

    Maps to a row in the "replies" Supabase table. Supports nested
    reply chains via parent_reply_id — see
    services/discussion_service.list_replies_tree() for how the flat
    list gets reassembled into a tree.
    """

    id: str = Field(description="Supabase UUID primary key for this reply")
    thread_id: str = Field(description="The thread this reply belongs to")
    user_id: str = Field(description="Author of the reply (resolved server-side from the token at creation time, not client-supplied)")

    content: str = Field(min_length=1, max_length=1000)
    parent_reply_id: Optional[str] = Field(default=None, description="ID of the reply this is nested under, if any — None for a top-level reply on the thread")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Reply creation time")
    updated_at: Optional[datetime] = Field(default=None, description="Last update time — set by update_reply(); None until the reply is first edited")


class ThreadCreate(BaseModel):
    """
    Input schema for POST /forum/threads.

    Intentionally has no user_id or id field — id is generated by
    Supabase on insert, and user_id is resolved server-side from the
    caller's verified token (see module note above). book_id is optional,
    matching thread_forum.book_id being nullable for genre-wide threads.
    """

    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    book_id: Optional[str] = Field(default=None, description="Book this thread is about, if any — omit for a genre-wide thread")
    has_spoilers: bool = Field(default=False, description="User must explicitly opt in if this post contains spoilers")
    tags: list[str] = Field(default_factory=list, description="Tag NAMES (not IDs) — an unrecognized name is created on the fly by create_thread()")


class ThreadUpdate(BaseModel):
    """
    Input schema for PATCH /forum/threads/{thread_id}.

    All fields optional — only fields the client includes get changed.
    Ownership (only the original author can edit) is enforced in
    services/discussion_service.update_thread(), not here.
    """

    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    content: Optional[str] = Field(default=None, min_length=1)
    has_spoilers: Optional[bool] = Field(default=None, description="Change the spoiler flag on an existing post")


class ReplyCreate(BaseModel):
    """
    Input schema for POST /forum/threads/{thread_id}/replies.

    Intentionally has no user_id or id field, for the same reason as
    ThreadCreate — user_id comes from the verified token, not the
    request body. thread_id is taken from the URL path, not this schema.
    """

    content: str = Field(min_length=1)
    parent_reply_id: Optional[str] = Field(default=None, description="Reply to nest this under, if any")


class ReplyUpdate(BaseModel):
    """
    Input schema for PATCH /forum/threads/{thread_id}/replies/{reply_id}.

    Only content is editable — parent_reply_id is intentionally NOT
    included here. Letting a reply be re-parented after the fact would
    let someone rewrite the shape of an existing conversation thread,
    which is a different (and much riskier) operation than fixing a typo.
    If re-nesting is ever a real need, it deserves its own explicit
    endpoint with its own review, not a side effect of an edit form.

    Ownership (only the original author can edit) is enforced in
    services/discussion_service.update_reply(), not here.
    """

    content: str = Field(min_length=1, max_length=1000)


class LikeStatus(BaseModel):
    """
    Result of a like toggle, returned as the "data" field from
    toggle_thread_like()/toggle_reply_like().
    """

    liked: bool = Field(description="True if the target is now liked by this user, False if the like was just removed")
    like_count: int = Field(description="Total number of likes on the target after this toggle")


class UserActivityResponse(BaseModel):
    """
    Aggregate view of a single user's forum activity.

    Returned by GET /forum/users/{user_id}/activity. Currently a public
    read with no auth check in the router — see routers/discussion_forum.py
    if that should be restricted to the user viewing their own activity.
    """

    user_id: str = Field(description="ID of the user this activity belongs to")
    threads: list[ThreadPost] = Field(default_factory=list, description="Threads created by the user, most recent first")
    replies: list[ThreadReply] = Field(default_factory=list, description="Replies made by the user, most recent first")