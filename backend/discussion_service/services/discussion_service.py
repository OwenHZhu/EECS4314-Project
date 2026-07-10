from __future__ import annotations

from datetime import datetime
from typing import Any, cast

from shared.db import supabase
from schemas.discussion_forum import ThreadPost, ThreadReply, UserActivityResponse


DISCUSSION_THREADS_TABLE = "discussion_threads"
DISCUSSION_REPLIES_TABLE = "discussion_replies"
DISCUSSION_THREAD_TAGS_TABLE = "thread_tags"


def parse_datetime(value: Any) -> datetime:
	if isinstance(value, datetime):
		return value
	return datetime.fromisoformat(str(value))


def _get_thread_tag_ids(thread_ids: list[str]) -> dict[str, list[str]]:
	if not thread_ids:
		return {}

	res = (
		supabase.table(DISCUSSION_THREAD_TAGS_TABLE)
		.select("thread_id, tag_id")
		.in_("thread_id", thread_ids)
		.execute()
	)

	tag_ids_by_thread: dict[str, list[str]] = {}
	for item in res.data or []:
		thread_id = str(item["thread_id"])
		tag_ids_by_thread.setdefault(thread_id, []).append(str(item["tag_id"]))

	return tag_ids_by_thread


def build_thread(record: dict[str, Any], *, tag_ids: list[str] | None = None) -> ThreadPost:
	"""
	Builds a ThreadPost object from a database record.

	Args:
		record (dict[str, Any]): The database record.
		tag_ids (list[str] | None): The tag IDs linked to this thread.

	Returns:
		ThreadPost: The constructed ThreadPost object.
	"""
	return ThreadPost(
		id=str(record["id"]),
		book_id=str(record["book_id"]) if record.get("book_id") is not None else None,
		user_id=str(record["user_id"]),
		title=str(record["title"]),
		content=str(record["content"]),
		tag_ids=tag_ids or [],
		created_at=parse_datetime(record["created_at"]),
		updated_at=parse_datetime(record["updated_at"]),
	)


def build_reply(record: dict[str, Any]) -> ThreadReply:
	"""
	Builds a ThreadReply object from a database record.

	Args:
		record (dict[str, Any]): The database record.

	Returns:
		ThreadReply: The constructed ThreadReply object.
	"""
	return ThreadReply(
		id=str(record["id"]),
		thread_id=str(record["thread_id"]),
		user_id=str(record["user_id"]),
		content=str(record["content"]),
		parent_reply_id=str(record["parent_reply_id"]) if record.get("parent_reply_id") is not None else None,
		created_at=parse_datetime(record["created_at"]),
		updated_at=parse_datetime(record["updated_at"]) if record.get("updated_at") else None,
	)


def create_thread(*, book_id: str | None = None, user_id: str, title: str, content: str, tag_ids: list[str] | None = None) -> ThreadPost:
	"""
	Creates a new discussion thread.

	Args:
		book_id (str | None): Optional book ID associated with the thread.
		user_id (str): The ID of the user creating the thread.
		title (str): The title of the thread.
		content (str): The content of the thread.
		tag_ids (list[str] | None): Optional tag IDs to link to the thread via the thread_tags table.

	Returns:
		ThreadPost: The created ThreadPost object.
	"""
	payload = {
		"user_id": user_id,
		"title": title,
		"content": content,
	}

	if book_id is not None:
		payload["book_id"] = book_id

	res = supabase.table(DISCUSSION_THREADS_TABLE).insert(payload).execute()

	if not res.data:
		raise ValueError("Failed to create thread")

	thread_record = cast(dict[str, Any], res.data[0])
	thread_id = str(thread_record["id"])

	if tag_ids:
		link_rows = [{"thread_id": thread_id, "tag_id": tag_id} for tag_id in tag_ids]
		supabase.table(DISCUSSION_THREAD_TAGS_TABLE).insert(link_rows).execute()

	return build_thread(thread_record, tag_ids=tag_ids)


def list_threads(*, book_id: str | None = None) -> list[ThreadPost]:
	"""
	Lists discussion threads.

	Args:
		book_id (str | None): Optional book ID to filter threads.

	Returns:
		list[ThreadPost]: The list of discussion threads.
	"""
	query = supabase.table(DISCUSSION_THREADS_TABLE).select("*")

	if book_id is not None:
		query = query.eq("book_id", book_id)

	res = query.order("created_at", desc=True).execute()
	threads = cast(list[dict[str, Any]], res.data or [])
	thread_ids = [str(item["id"]) for item in threads if item.get("id") is not None]
	tag_ids_by_thread = _get_thread_tag_ids(thread_ids)
	return [build_thread(thread, tag_ids=tag_ids_by_thread.get(str(thread["id"]), [])) for thread in threads]


def get_thread(thread_id: str) -> ThreadPost:
	"""
	Retrieves a specific discussion thread by its ID.

	Returns:
		ThreadPost: The retrieved ThreadPost object.
	"""
	res = (
		supabase.table(DISCUSSION_THREADS_TABLE)
		.select("*")
		.eq("id", thread_id)
		.limit(1)
		.execute()
	)

	if not res.data:
		raise ValueError("Thread not found")

	thread_record = cast(dict[str, Any], res.data[0])
	thread_id = str(thread_record["id"])
	tag_ids = _get_thread_tag_ids([thread_id]).get(thread_id, [])
	return build_thread(thread_record, tag_ids=tag_ids)


def create_reply(*, thread_id: str, user_id: str, content: str, parent_reply_id: str | None = None) -> ThreadReply:
	"""
	Creates a new reply to a discussion thread.

	Args:
		thread_id (str): The ID of the thread to which to reply.
		user_id (str): The ID of the user creating the reply.
		content (str): The content of the reply.
		parent_reply_id (str | None): The ID of the parent reply, if applicable.

	Returns:
		ThreadReply: The created ThreadReply object.
	"""
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
	"""
	Lists replies for a specific discussion thread.
	"""
	res = (
		supabase.table(DISCUSSION_REPLIES_TABLE)
		.select("*")
		.eq("thread_id", thread_id)
		.order("created_at", desc=False)
		.execute()
	)

	return [build_reply(cast(dict[str, Any], item)) for item in (res.data or [])]

def get_user_activity(user_id: str) -> UserActivityResponse:
	"""
	Retrieves a user's activity in the discussion forum, including threads and replies.

	Args:
		user_id (str): The ID of the user.
	Returns:
		UserActivityResponse: The user's activity in the forum(user_id, threads, replies).
	"""
	# Fetch threads created by the user
	thread_res = (
		supabase.table(DISCUSSION_THREADS_TABLE)
		.select("*")
		.eq("user_id", user_id)
		.order("created_at", desc=True)
		.execute()
	)

	thread_records = cast(list[dict[str, Any]], thread_res.data or [])
	thread_ids = [str(item["id"]) for item in thread_records if item.get("id") is not None]
	tag_ids_by_thread = _get_thread_tag_ids(thread_ids)
	threads = [build_thread(thread, tag_ids=tag_ids_by_thread.get(str(thread["id"]), [])) for thread in thread_records]

	# Fetch replies created by the user
	reply_res = (
		supabase.table(DISCUSSION_REPLIES_TABLE)
		.select("*")
		.eq("user_id", user_id)
		.order("created_at", desc=True)
		.execute()
	)

	replies = [build_reply(cast(dict[str, Any], item)) for item in (reply_res.data or [])]

	return UserActivityResponse(user_id=user_id, threads=threads, replies=replies)