from __future__ import annotations

from datetime import datetime
from typing import Any, cast

from database.db import supabase
from schemas.discussion_forum import ThreadPost, ThreadReply




DISCUSSION_THREADS_TABLE = "discussion_threads"
DISCUSSION_REPLIES_TABLE = "discussion_replies"


def parse_datetime(value: Any) -> datetime:
	if isinstance(value, datetime):
		return value
	return datetime.fromisoformat(str(value))


def build_thread(record: dict[str, Any]) -> ThreadPost:
	return ThreadPost(
		id=str(record["id"]),
		book_id=str(record["book_id"]) if record.get("book_id") is not None else None,
		user_id=str(record["user_id"]),
		title=str(record["title"]),
		content=str(record["content"]),
		category=str(record["category"]),
		created_at=parse_datetime(record["created_at"]),
		updated_at=parse_datetime(record["updated_at"]),
	)


def build_reply(record: dict[str, Any]) -> ThreadReply:
	return ThreadReply(
		id=str(record["id"]),
		thread_id=str(record["thread_id"]),
		user_id=str(record["user_id"]),
		content=str(record["content"]),
		parent_reply_id=str(record["parent_reply_id"]) if record.get("parent_reply_id") is not None else None,
		created_at=parse_datetime(record["created_at"]),
		updated_at=parse_datetime(record["updated_at"]) if record.get("updated_at") else None,
	)


def create_thread(*, book_id: str | None = None, user_id: str, title: str, content: str, category: str) -> ThreadPost:
	payload = {
		"user_id": user_id,
		"title": title,
		"content": content,
		"category": category,
	}

	if book_id is not None:
		payload["book_id"] = book_id

	res = supabase.table(DISCUSSION_THREADS_TABLE).insert(payload).execute()

	if not res.data:
		raise ValueError("Failed to create thread")

	return build_thread(cast(dict[str, Any], res.data[0]))


def list_threads(*, book_id: str | None = None) -> list[ThreadPost]:
	query = supabase.table(DISCUSSION_THREADS_TABLE).select("*")

	if book_id is not None:
		query = query.eq("book_id", book_id)

	res = query.order("created_at", desc=True).execute()
	return [build_thread(cast(dict[str, Any], item)) for item in (res.data or [])]


def get_thread(thread_id: str) -> ThreadPost:
	res = (
		supabase.table(DISCUSSION_THREADS_TABLE)
		.select("*")
		.eq("id", thread_id)
		.limit(1)
		.execute()
	)

	if not res.data:
		raise ValueError("Thread not found")

	return build_thread(cast(dict[str, Any], res.data[0]))


def create_reply(*, thread_id: str, user_id: str, content: str, parent_reply_id: str | None = None) -> ThreadReply:
	payload = {
		"thread_id": thread_id,
		"user_id": user_id,
		"content": content,
	}

	if parent_reply_id is not None:
		payload["parent_reply_id"] = parent_reply_id

	res = supabase.table(DISCUSSION_REPLIES_TABLE).insert(payload).execute()

	if not res.data:
		raise ValueError("Failed to create reply")

	return build_reply(cast(dict[str, Any], res.data[0]))


def list_replies(*, thread_id: str) -> list[ThreadReply]:
	res = (
		supabase.table(DISCUSSION_REPLIES_TABLE)
		.select("*")
		.eq("thread_id", thread_id)
		.order("created_at", desc=False)
		.execute()
	)

	return [build_reply(cast(dict[str, Any], item)) for item in (res.data or [])]
