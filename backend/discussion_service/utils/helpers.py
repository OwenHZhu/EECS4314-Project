"""
utils/helpers.py

Small shared helpers used by services/discussion_service.py — datetime
parsing and the thread-tags lookup, split out so build_thread() and friends
don't have to inline the same Supabase query in multiple places.
"""

from datetime import datetime
from typing import Any

from shared.db import supabase
from discussion_service.utils.constants import DISCUSSION_THREAD_TAGS_TABLE


def parse_datetime(value: Any) -> datetime:
	"""
	Normalizes a Supabase timestamp value (ISO string or already-a-datetime)
	into a datetime object.
	"""
	if isinstance(value, datetime):
		return value
	return datetime.fromisoformat(str(value))


def get_thread_tag_ids(thread_ids: list[str]) -> dict[str, list[str]]:
	"""
	Looks up tag_ids for a batch of threads in one query via the
	thread_tags join table.

	NOTE: previously called as `_get_thread_tag_ids` (leading underscore)
	from services/discussion_service.py — that name doesn't exist anywhere,
	which would raise a NameError the first time any read endpoint ran.
	Renamed the call sites to match this function's actual name instead of
	adding a second underscored alias, since there's no reason for two
	names for the same function.

	Args:
		thread_ids: Thread IDs to look up tags for.

	Returns:
		Mapping of thread_id -> list of tag_ids linked to it. Threads with
		no tags simply won't have a key in the returned dict.
	"""
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