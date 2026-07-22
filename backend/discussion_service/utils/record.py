"""
utils/record.py

TypedDicts describing the shape of raw Supabase rows for the Discussion
Service — mirrors auth_service/utils/record.py's UserRecord.

These exist so build_thread()/build_reply()/build_tag() take a typed
record instead of a bare dict[str, Any], the same way auth_service's
functions take UserRecord instead of dict[str, Any]. total=False since a
select("*") result may omit nullable columns entirely depending on the
Supabase client version, rather than always sending them as None.
"""

from typing import TypedDict, Optional


class ThreadRecord(TypedDict, total=False):
	id: str
	user_id: str
	book_id: Optional[str]
	title: str
	content: str
	has_spoilers: bool
	created_at: str
	updated_at: Optional[str]


class ReplyRecord(TypedDict, total=False):
	id: str
	thread_id: str
	user_id: str
	parent_reply_id: Optional[str]
	content: str
	created_at: str


class TagRecord(TypedDict, total=False):
	id: str
	name: str
	created_at: str