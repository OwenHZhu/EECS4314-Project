"""
services/discussion_service.py

Business logic for the Discussion Service — threads, replies, tags, and
likes. Talks directly to Supabase; routers/discussion_forum.py handles
HTTP and auth, this file handles data access and validation that requires
a DB round-trip.

Follows the same conventions as auth_service/services/auth.py:
    - No keyword-only (*) enforced arguments — plain positional/keyword
      params, required ones first, defaults last.
    - Create/update functions take the validated Pydantic schema object
      directly (e.g. create_thread(user_id, thread: ThreadCreate)), the
      same way auth.py's register_user(user: UserRegister) and
      update_profile(user_id, updates: UserUpdate) do — not individual
      primitive fields spread across the signature.
    - Every public function returns a consistent response shape instead
      of raising exceptions:
          { "success": bool, "message": str, "data": <schema> | None }
      Errors are returned as { "success": False, ... } rather than raised
      — the router converts these into HTTP error responses.
    - Raw Supabase rows are typed as Record TypedDicts (ThreadRecord,
      ReplyRecord, TagRecord — see utils/record.py), mirroring
      auth_service's UserRecord, instead of bare dict[str, Any].

Dependencies:
    utils/helpers.py  - parse_datetime, get_thread_tags
    utils/constants.py - table name constants
    utils/record.py   - ThreadRecord, ReplyRecord, TagRecord (TypedDicts)
    schemas/discussion_forum.py - Pydantic request/response schemas
"""

from datetime import datetime, timezone
from typing import Any, cast

from shared.db import supabase
from discussion_service.utils.helpers import parse_datetime, get_thread_tags
from discussion_service.utils.record import ThreadRecord, ReplyRecord, TagRecord
from discussion_service.utils.constants import (
	DISCUSSION_THREADS_TABLE,
	DISCUSSION_REPLIES_TABLE,
	DISCUSSION_TAGS_TABLE,
	DISCUSSION_THREAD_TAGS_TABLE,
	DISCUSSION_THREAD_LIKES_TABLE,
	DISCUSSION_REPLY_LIKES_TABLE,
)
from discussion_service.schemas.discussion_forum import (
	Tag,
	ThreadPost,
	ThreadCreate,
	ThreadUpdate,
	ThreadReply,
	ReplyCreate,
	ReplyUpdate,
	UserActivityResponse,
	LikeStatus,
)


def build_tag(record: TagRecord) -> Tag:
	"""
	Builds a Tag object from a database record.

	Args:
		record: The database record.

	Returns:
		Tag: The constructed Tag object.
	"""
	return Tag(
		id=str(record["id"]),
		name=str(record["name"]),
		created_at=parse_datetime(record["created_at"]),
	)


def build_thread(record: ThreadRecord, tags: list[Tag] | None = None) -> ThreadPost:
	"""
	Builds a ThreadPost object from a database record.

	Args:
		record: The database record.
		tags: Full Tag objects linked to this thread (not just IDs — see
			schemas/discussion_forum.py's note on why ThreadPost.tags
			holds full objects).

	Returns:
		ThreadPost: The constructed ThreadPost object.
	"""
	book_id = record.get("book_id")
	return ThreadPost(
		id=str(record["id"]),
		book_id=str(book_id) if book_id is not None else None,
		user_id=str(record["user_id"]),
		title=str(record["title"]),
		content=str(record["content"]),
		has_spoilers=bool(record.get("has_spoilers", False)),
		tags=tags or [],
		created_at=parse_datetime(record["created_at"]),
		updated_at=parse_datetime(record["updated_at"]) if record.get("updated_at") else None,
	)


def build_reply(record: ReplyRecord) -> ThreadReply:
	"""
	Builds a ThreadReply object from a database record.

	Args:
		record: The database record.

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


def _get_or_create_tag_record(name: str) -> TagRecord:
	"""
	Internal: resolves a tag name to its row, creating it if it doesn't
	exist yet. This is what makes ThreadCreate.tags accept free-typed
	names instead of requiring pre-existing tag IDs — see the module note
	in schemas/discussion_forum.py.

	Handles the race where two requests try to create the same new tag
	name at the same time: if the insert hits the unique constraint on
	tags.name, this just re-fetches whichever row won instead of failing.

	Args:
		name: The tag name to look up or create.

	Returns:
		TagRecord: The existing or newly created row.

	Raises:
		RuntimeError: if creation was attempted but Supabase returned no
			row back (unexpected — not a normal validation failure).
	"""
	existing = supabase.table(DISCUSSION_TAGS_TABLE).select("*").eq("name", name).limit(1).execute()
	if existing.data:
		return cast(TagRecord, existing.data[0])

	try:
		res = supabase.table(DISCUSSION_TAGS_TABLE).insert({"name": name}).execute()
	except Exception as exc:
		msg = str(exc).lower()
		if "duplicate" in msg or "already exists" in msg:
			existing = supabase.table(DISCUSSION_TAGS_TABLE).select("*").eq("name", name).limit(1).execute()
			if existing.data:
				return cast(TagRecord, existing.data[0])
		raise

	if not res.data:
		raise RuntimeError(f"Failed to create tag '{name}'")

	return cast(TagRecord, res.data[0])


def create_thread(user_id: str, thread: ThreadCreate) -> dict:
	"""
	Creates a new discussion thread.

	user_id is expected to already be the verified, authenticated user's
	ID — the caller (routers/discussion_forum.py) is responsible for
	resolving it via Depends(get_current_user_id) before calling this.
	This function does not itself verify anything about user_id.

	Args:
		user_id: The ID of the user creating the thread.
		thread: Validated ThreadCreate schema (title, content, book_id,
			has_spoilers, tags — tag NAMES, get-or-created below).

	Returns:
		Success: { success: True, message: str, data: ThreadPost }
		Failure: { success: False, message: str, data: None }
	"""
	payload = {
		"user_id": user_id,
		"title": thread.title,
		"content": thread.content,
		"has_spoilers": thread.has_spoilers,
		"created_at": datetime.now(timezone.utc).isoformat(),
	}

	if thread.book_id is not None:
		payload["book_id"] = thread.book_id

	res = supabase.table(DISCUSSION_THREADS_TABLE).insert(payload).execute()

	if not res.data:
		return {"success": False, "message": "Failed to create thread", "data": None}

	thread_record = cast(ThreadRecord, res.data[0])
	thread_id = str(thread_record["id"])

	tag_objects: list[Tag] = []
	if thread.tags:
		try:
			tag_records = [_get_or_create_tag_record(name) for name in thread.tags]
		except RuntimeError as exc:
			return {"success": False, "message": str(exc), "data": None}

		link_rows = [{"thread_id": thread_id, "tag_id": record["id"]} for record in tag_records]
		supabase.table(DISCUSSION_THREAD_TAGS_TABLE).insert(link_rows).execute()
		tag_objects = [build_tag(record) for record in tag_records]

	return {"success": True, "message": "Thread created successfully", "data": build_thread(thread_record, tags=tag_objects)}


def list_threads(book_id: str | None = None) -> dict:
	"""
	Lists discussion threads.

	Args:
		book_id: Optional book ID to filter threads.

	Returns:
		{ success: True, message: str, data: list[ThreadPost] }
	"""
	query = supabase.table(DISCUSSION_THREADS_TABLE).select("*")

	if book_id is not None:
		query = query.eq("book_id", book_id)

	res = query.order("created_at", desc=True).execute()
	threads = cast(list[ThreadRecord], res.data or [])
	thread_ids = [str(item["id"]) for item in threads if item.get("id") is not None]
	tags_by_thread = get_thread_tags(thread_ids)

	data = [
		build_thread(thread, tags=[build_tag(r) for r in tags_by_thread.get(str(thread["id"]), [])])
		for thread in threads
	]
	return {"success": True, "message": "Threads fetched successfully", "data": data}


def get_thread(thread_id: str) -> dict:
	"""
	Retrieves a specific discussion thread by its ID.

	Returns:
		Success: { success: True, message: str, data: ThreadPost }
		Failure: { success: False, message: "Thread not found", data: None }
	"""
	res = (
		supabase.table(DISCUSSION_THREADS_TABLE)
		.select("*")
		.eq("id", thread_id)
		.limit(1)
		.execute()
	)

	if not res.data:
		return {"success": False, "message": "Thread not found", "data": None}

	thread_record = cast(ThreadRecord, res.data[0])
	thread_id = str(thread_record["id"])
	tag_records = get_thread_tags([thread_id]).get(thread_id, [])

	return {
		"success": True,
		"message": "Thread fetched successfully",
		"data": build_thread(thread_record, tags=[build_tag(r) for r in tag_records]),
	}


def update_thread(thread_id: str, user_id: str, updates: ThreadUpdate) -> dict:
	"""
	Updates a thread's title, content, and/or spoiler flag, and sets
	updated_at.

	Only fields explicitly provided in updates are changed — omitted
	fields are left unchanged, same convention as auth.py's update_profile.
	Only the thread's original author may edit it — user_id must match
	the thread's user_id; the caller (router) is responsible for
	resolving user_id from a verified token before calling this.

	Args:
		thread_id: The thread to update.
		user_id: The authenticated user attempting the edit.
		updates: Validated ThreadUpdate schema (title, content,
			has_spoilers — all optional).

	Returns:
		Success: { success: True, message: str, data: ThreadPost }
		Failure: { success: False, message: str, data: None }
	"""
	current = (
		supabase.table(DISCUSSION_THREADS_TABLE)
		.select("*")
		.eq("id", thread_id)
		.limit(1)
		.execute()
	)

	if not current.data:
		return {"success": False, "message": "Thread not found", "data": None}

	current_record = cast(ThreadRecord, current.data[0])

	if str(current_record["user_id"]) != str(user_id):
		return {"success": False, "message": "Only the thread author can edit this thread", "data": None}

	# Build a dict of only the fields the caller actually provided.
	changes = updates.model_dump(exclude_unset=True)

	if not changes:
		tag_records = get_thread_tags([thread_id]).get(thread_id, [])
		return {
			"success": True,
			"message": "No changes provided",
			"data": build_thread(current_record, tags=[build_tag(r) for r in tag_records]),
		}

	changes["updated_at"] = datetime.now(timezone.utc).isoformat()

	res = supabase.table(DISCUSSION_THREADS_TABLE).update(changes).eq("id", thread_id).execute()

	if not res.data:
		return {"success": False, "message": "Failed to update thread", "data": None}

	updated_record = cast(ThreadRecord, res.data[0])
	tag_records = get_thread_tags([thread_id]).get(thread_id, [])

	return {
		"success": True,
		"message": "Thread updated successfully",
		"data": build_thread(updated_record, tags=[build_tag(r) for r in tag_records]),
	}


def delete_thread(thread_id: str, user_id: str) -> dict:
	"""
	Permanently deletes a thread.

	Only the thread's original author may delete it — same ownership
	check as update_thread(). Deleting the thread_forum row cascades at
	the DB level to remove its replies, thread_tags links, and
	thread_likes automatically (all defined ON DELETE CASCADE against
	thread_forum.id), so nothing extra needs to happen here to clean
	those up.

	Args:
		thread_id: The thread to delete.
		user_id: The authenticated user attempting the deletion.

	Returns:
		Success: { success: True, message: str, data: None }
		Failure: { success: False, message: str, data: None }
	"""
	current = (
		supabase.table(DISCUSSION_THREADS_TABLE)
		.select("user_id")
		.eq("id", thread_id)
		.limit(1)
		.execute()
	)

	if not current.data:
		return {"success": False, "message": "Thread not found", "data": None}

	if str(current.data[0]["user_id"]) != str(user_id):
		return {"success": False, "message": "Only the thread author can delete this thread", "data": None}

	res = supabase.table(DISCUSSION_THREADS_TABLE).delete().eq("id", thread_id).execute()

	if not res.data:
		return {"success": False, "message": "Failed to delete thread", "data": None}

	return {"success": True, "message": "Thread deleted successfully", "data": None}

def list_popular_threads(limit: int = 10) -> dict:
	"""
	Lists the most popular discussion threads using both like count and
	recent activity so newer threads get a boost without ignoring
	existing popularity.

	Args:
		limit: The maximum number of threads to return.

	Returns:
		{ success: True, message: str, data: list[ThreadPost] }
	"""
	res = (
		supabase.table(DISCUSSION_THREADS_TABLE)
		.select(f"*, {DISCUSSION_THREAD_LIKES_TABLE}(thread_id, user_id)")
		.execute()
	)

	if not res.data:
		return {"success": True, "message": "No popular threads found", "data": []}

	thread_records = cast(list[ThreadRecord], res.data)
	now = datetime.now(timezone.utc)
	scored_threads: list[tuple[float, ThreadRecord]] = []

	for thread in thread_records:
		likes = thread.get("DISCUSSION_THREAD_LIKES_TABLE") or []
		like_count = len(likes) if isinstance(likes, list) else 0
		activity_timestamp = thread.get("updated_at") or thread.get("created_at")
		activity_dt = parse_datetime(activity_timestamp) if activity_timestamp else now
		age_days = max(0.0, (now - activity_dt).total_seconds() / 86400)
		recency_boost = max(0.0, 30.0 - age_days) * 2.0
		score = (like_count * 10.0) + recency_boost
		scored_threads.append((score, thread))

	scored_threads.sort(key=lambda item: item[0], reverse=True)
	ranked_threads = [thread for _, thread in scored_threads[:limit]]
	thread_ids = [str(item["id"]) for item in ranked_threads if item.get("id") is not None]
	tags_by_thread = get_thread_tags(thread_ids)

	data = [
		build_thread(thread, tags=[build_tag(r) for r in tags_by_thread.get(str(thread["id"]), [])])
		for thread in ranked_threads
	]

	return {"success": True, "message": "Popular threads fetched successfully", "data": data}


def create_reply(thread_id: str, user_id: str, reply: ReplyCreate) -> dict:
	"""
	Creates a new reply to a discussion thread.

	Same rule as create_thread(): user_id must already be the verified
	user's ID by the time it reaches this function — resolved by the
	router via Depends(get_current_user_id), never taken from client input.

	Args:
		thread_id: The ID of the thread to which to reply.
		user_id: The ID of the user creating the reply.
		reply: Validated ReplyCreate schema (content, parent_reply_id).

	Returns:
		Success: { success: True, message: str, data: ThreadReply }
		Failure: { success: False, message: str, data: None }
	"""
	payload = {
		"thread_id": thread_id,
		"user_id": user_id,
		"content": reply.content,
	}

	if reply.parent_reply_id is not None:
		payload["parent_reply_id"] = reply.parent_reply_id

	res = supabase.table(DISCUSSION_REPLIES_TABLE).insert(payload).execute()

	if not res.data:
		return {"success": False, "message": "Failed to create reply", "data": None}

	return {"success": True, "message": "Reply created successfully", "data": build_reply(cast(ReplyRecord, res.data[0]))}


def update_reply(reply_id: str, user_id: str, updates: ReplyUpdate) -> dict:
	"""
	Updates a reply's content, and sets updated_at.

	Only the reply's original author may edit it — user_id must match
	the reply's user_id; the caller (router) is responsible for
	resolving user_id from a verified token before calling this.
	parent_reply_id is intentionally not editable here — see
	ReplyUpdate's docstring in schemas/discussion_forum.py for why.

	Args:
		reply_id: The reply to update.
		user_id: The authenticated user attempting the edit.
		updates: Validated ReplyUpdate schema (content).

	Returns:
		Success: { success: True, message: str, data: ThreadReply }
		Failure: { success: False, message: str, data: None }
	"""
	current = (
		supabase.table(DISCUSSION_REPLIES_TABLE)
		.select("*")
		.eq("id", reply_id)
		.limit(1)
		.execute()
	)

	if not current.data:
		return {"success": False, "message": "Reply not found", "data": None}

	current_record = cast(ReplyRecord, current.data[0])

	if str(current_record["user_id"]) != str(user_id):
		return {"success": False, "message": "Only the reply author can edit this reply", "data": None}

	changes = {
		"content": updates.content,
		"updated_at": datetime.now(timezone.utc).isoformat(),
	}

	res = supabase.table(DISCUSSION_REPLIES_TABLE).update(changes).eq("id", reply_id).execute()

	if not res.data:
		return {"success": False, "message": "Failed to update reply", "data": None}

	return {"success": True, "message": "Reply updated successfully", "data": build_reply(cast(ReplyRecord, res.data[0]))}


def delete_reply(reply_id: str, user_id: str) -> dict:
	"""
	Permanently deletes a reply.

	Only the reply's original author may delete it — same ownership
	check as update_reply(). Deleting a reply that has child replies
	nested under it does NOT delete those children — parent_reply_id has
	ON DELETE SET NULL, so its children become top-level replies on the
	thread instead of disappearing (see the replies table definition —
	this was a deliberate choice to avoid silently wiping out a whole
	reply subtree when only the parent is removed).

	Args:
		reply_id: The reply to delete.
		user_id: The authenticated user attempting the deletion.

	Returns:
		Success: { success: True, message: str, data: None }
		Failure: { success: False, message: str, data: None }
	"""
	current = (
		supabase.table(DISCUSSION_REPLIES_TABLE)
		.select("user_id")
		.eq("id", reply_id)
		.limit(1)
		.execute()
	)

	if not current.data:
		return {"success": False, "message": "Reply not found", "data": None}

	if str(current.data[0]["user_id"]) != str(user_id):
		return {"success": False, "message": "Only the reply author can delete this reply", "data": None}

	res = supabase.table(DISCUSSION_REPLIES_TABLE).delete().eq("id", reply_id).execute()

	if not res.data:
		return {"success": False, "message": "Failed to delete reply", "data": None}

	return {"success": True, "message": "Reply deleted successfully", "data": None}


def list_replies(thread_id: str) -> dict:
	"""
	Lists replies for a specific discussion thread.

	Args:
		thread_id: The ID of the thread for which to list replies.

	Returns:
		{ success: True, message: str, data: list[ThreadReply] }
	"""
	res = (
		supabase.table(DISCUSSION_REPLIES_TABLE)
		.select("*")
		.eq("thread_id", thread_id)
		.order("created_at", desc=False)
		.execute()
	)

	data = [build_reply(cast(ReplyRecord, item)) for item in (res.data or [])]
	return {"success": True, "message": "Replies fetched successfully", "data": data}


def list_replies_tree(thread_id: str) -> dict:
	"""
	Lists nested replies for a specific discussion thread, returning a tree structure.

	Args:
		thread_id: The ID of the thread for which to list replies.

	Returns:
		{ success: True, message: str, data: list[dict] }
		("data" here is a nested tree of plain dicts, not ThreadReply
		instances — the "children" tree shape isn't represented by any
		schema, since it only exists for this one endpoint.)
	"""
	flat_result = list_replies(thread_id)
	flat = flat_result["data"]  # list[ThreadReply]

	nodes = {r.id: {**r.model_dump(), "children": []} for r in flat}
	roots = []
	for r in flat:
		node = nodes[r.id]
		if r.parent_reply_id and r.parent_reply_id in nodes:
			nodes[r.parent_reply_id]["children"].append(node)
		else:
			roots.append(node)

	return {"success": True, "message": "Reply tree fetched successfully", "data": roots}


def get_user_activity(user_id: str) -> dict:
	"""
	Retrieves a user's activity in the discussion forum, including threads and replies.

	Args:
		user_id: The ID of the user.

	Returns:
		{ success: True, message: str, data: UserActivityResponse }
	"""
	thread_res = (
		supabase.table(DISCUSSION_THREADS_TABLE)
		.select("*")
		.eq("user_id", user_id)
		.order("created_at", desc=True)
		.execute()
	)

	thread_records = cast(list[ThreadRecord], thread_res.data or [])
	thread_ids = [str(item["id"]) for item in thread_records if item.get("id") is not None]
	tags_by_thread = get_thread_tags(thread_ids)
	threads = [
		build_thread(thread, tags=[build_tag(r) for r in tags_by_thread.get(str(thread["id"]), [])])
		for thread in thread_records
	]

	reply_res = (
		supabase.table(DISCUSSION_REPLIES_TABLE)
		.select("*")
		.eq("user_id", user_id)
		.order("created_at", desc=True)
		.execute()
	)

	replies = [build_reply(cast(ReplyRecord, item)) for item in (reply_res.data or [])]

	return {
		"success": True,
		"message": "User activity fetched successfully",
		"data": UserActivityResponse(user_id=user_id, threads=threads, replies=replies),
	}


def list_tags() -> dict:
	"""
	Lists every available tag.

	Returns:
		{ success: True, message: str, data: list[Tag] }
	"""
	res = supabase.table(DISCUSSION_TAGS_TABLE).select("*").order("name").execute()
	data = [build_tag(cast(TagRecord, item)) for item in (res.data or [])]
	return {"success": True, "message": "Tags fetched successfully", "data": data}


# def create_tag(tag: TagCreate) -> dict:
# 	"""
# 	Creates a new tag.

# 	tags.name is unique at the DB level — if the name already exists,
# 	this returns success: False instead of letting a raw duplicate-key
# 	exception escape.

# 	Args:
# 		tag: Validated TagCreate schema (name).

# 	Returns:
# 		Success: { success: True, message: str, data: Tag }
# 		Failure: { success: False, message: str, data: None }
# 	"""
# 	try:
# 		res = supabase.table(DISCUSSION_TAGS_TABLE).insert({"name": tag.name}).execute()
# 	except Exception as exc:
# 		msg = str(exc).lower()
# 		if "duplicate" in msg or "already exists" in msg:
# 			return {"success": False, "message": f"Tag '{tag.name}' already exists", "data": None}
# 		raise

# 	if not res.data:
# 		return {"success": False, "message": "Failed to create tag", "data": None}

# 	return {"success": True, "message": "Tag created successfully", "data": build_tag(cast(TagRecord, res.data[0]))}


def _like_thread(user_id: str, thread_id: str) -> bool:
	"""Internal: adds a like from a user to a thread if it does not already exist."""
	try:
		supabase.table(DISCUSSION_THREAD_LIKES_TABLE).insert({
			"user_id": user_id,
			"thread_id": thread_id,
		}).execute()
		return True
	except Exception as exc:
		msg = str(exc).lower()
		if "duplicate" in msg or "already exists" in msg:
			return False
		raise


def _unlike_thread(user_id: str, thread_id: str) -> None:
	"""Internal: removes a user's like from a thread."""
	supabase.table(DISCUSSION_THREAD_LIKES_TABLE).delete().eq("user_id", user_id).eq("thread_id", thread_id).execute()


def _has_thread_like(user_id: str, thread_id: str) -> bool:
	"""Internal: returns True if the user has liked the thread."""
	res = (
		supabase.table(DISCUSSION_THREAD_LIKES_TABLE)
		.select("user_id")
		.eq("user_id", user_id)
		.eq("thread_id", thread_id)
		.limit(1)
		.execute()
	)
	return bool(res.data)


def count_thread_likes(thread_id: str) -> int:
	"""Returns the number of likes for a specific thread."""
	res = (
		supabase.table(DISCUSSION_THREAD_LIKES_TABLE)
		.select("id", count="exact")
		.eq("thread_id", thread_id)
		.execute()
	)
	return int(res.count or 0)


def toggle_thread_like(user_id: str, thread_id: str) -> dict:
	"""
	Toggles a thread like on or off for the given user.

	Returns:
		{ success: True, message: str, data: LikeStatus }
	"""
	if _has_thread_like(user_id, thread_id):
		_unlike_thread(user_id, thread_id)
		liked = False
	else:
		_like_thread(user_id, thread_id)
		liked = True

	return {
		"success": True,
		"message": "Thread liked" if liked else "Thread like removed",
		"data": LikeStatus(liked=liked, like_count=count_thread_likes(thread_id)),
	}


def _like_reply(user_id: str, reply_id: str) -> bool:
	"""Internal: adds a like from a user to a reply if it does not already exist."""
	try:
		supabase.table(DISCUSSION_REPLY_LIKES_TABLE).insert({
			"user_id": user_id,
			"reply_id": reply_id,
		}).execute()
		return True
	except Exception as exc:
		msg = str(exc).lower()
		if "duplicate" in msg or "already exists" in msg:
			return False
		raise


def _unlike_reply(user_id: str, reply_id: str) -> None:
	"""Internal: removes a user's like from a reply."""
	supabase.table(DISCUSSION_REPLY_LIKES_TABLE).delete().eq("user_id", user_id).eq("reply_id", reply_id).execute()


def _has_reply_like(user_id: str, reply_id: str) -> bool:
	"""Internal: returns True if the user has liked the reply."""
	res = (
		supabase.table(DISCUSSION_REPLY_LIKES_TABLE)
		.select("user_id")
		.eq("user_id", user_id)
		.eq("reply_id", reply_id)
		.limit(1)
		.execute()
	)
	return bool(res.data)


def count_reply_likes(reply_id: str) -> int:
	"""Returns the number of likes for a specific reply."""
	res = (
		supabase.table(DISCUSSION_REPLY_LIKES_TABLE)
		.select("id", count="exact")
		.eq("reply_id", reply_id)
		.execute()
	)
	return int(res.count or 0)


def toggle_reply_like(user_id: str, reply_id: str) -> dict:
	"""
	Toggles a reply like on or off for the given user.

	Returns:
		{ success: True, message: str, data: LikeStatus }
	"""
	if _has_reply_like(user_id, reply_id):
		_unlike_reply(user_id, reply_id)
		liked = False
	else:
		_like_reply(user_id, reply_id)
		liked = True

	return {
		"success": True,
		"message": "Reply liked" if liked else "Reply like removed",
		"data": LikeStatus(liked=liked, like_count=count_reply_likes(reply_id)),
	}