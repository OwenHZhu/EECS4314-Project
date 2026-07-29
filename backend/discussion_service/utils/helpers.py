"""
utils/helpers.py

Small shared helpers used by services/discussion_service.py — datetime
parsing and the per-thread tags lookup.
"""

from datetime import datetime
from typing import Any, cast

from shared.db import supabase
from discussion_service.utils.constants import DISCUSSION_THREAD_TAGS_TABLE, DISCUSSION_TAGS_TABLE
from discussion_service.utils.record import TagRecord


def parse_datetime(value: Any) -> datetime:
	"""
	Normalizes a Supabase timestamp value (ISO string or already-a-datetime)
	into a datetime object.
	"""
	if isinstance(value, datetime):
		return value
	return datetime.fromisoformat(str(value))


def get_thread_tags(thread_ids: list[str]) -> dict[str, list[TagRecord]]:
	"""
	Looks up the full tag rows (id, name, created_at) linked to a batch of
	threads in one query, via thread_tags' foreign key into tags.

	CHANGED from an earlier version that only returned tag_ids: now that
	ThreadPost.tags is list[Tag] (full objects, not just IDs — see
	schemas/discussion_forum.py's note on why), the caller needs full tag
	rows, not just their IDs. Uses Supabase's embedded-resource select
	(thread_tags -> tags via the tag_id foreign key) to get both in one
	round trip instead of a second query per batch.

	Args:
		thread_ids: Thread IDs to look up tags for.

	Returns:
		Mapping of thread_id -> list of TagRecord dicts linked to it.
		Threads with no tags simply won't have a key in the returned dict.
	"""
	if not thread_ids:
		return {}

	res = (
		supabase.table(DISCUSSION_THREAD_TAGS_TABLE)
		.select(f"thread_id, {DISCUSSION_TAGS_TABLE}(id, name, created_at)")
		.in_("thread_id", thread_ids)
		.execute()
	)

	tags_by_thread: dict[str, list[TagRecord]] = {}
	for item in res.data or []:
		thread_id = str(item["thread_id"])
		tag_record = item.get(DISCUSSION_TAGS_TABLE)
		if tag_record:
			tags_by_thread.setdefault(thread_id, []).append(cast(TagRecord, tag_record))

	return tags_by_thread