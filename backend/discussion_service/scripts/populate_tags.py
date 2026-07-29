"""
scripts/populate_tags.py

One-off/maintenance script: seeds discussion_service's "tags" table from
every unique genre string found across all books' "genres" column.

Run from the backend/ root, the same way the services import (so
`shared.db` and `discussion_service.*` resolve without any sys.path hacks):
    python -m scripts.populate_tags

What it does:
    1. Fetches every book's "genres" array from Supabase (owned by
       book_service — read-only access from here is fine under this
       shared-DB architecture, same reasoning as everywhere else we've
       used cross-service reads).
    2. Flattens every book's genres array into one set of unique genre
       names across the whole "books" table.
    3. For each unique name, checks whether a tag with that exact name
       already exists in "tags" — skips it if so (e.g. "Bibliography" is
       left alone if it's already a tag), inserts it if not. Reuses the
       same get-or-create shape as
       discussion_service.create_thread()'s tag resolution.

NOTE on case sensitivity:
    tags.name has a case-sensitive unique constraint, so "Bibliography"
    and "bibliography" are two different tags as far as the DB is
    concerned. If genres are inconsistently cased across book entries,
    flip NORMALIZE_CASE below to treat them as the same tag when
    checking what already exists (the tag actually created keeps its
    original casing from whichever genre string was encountered first).
"""

from shared.db import supabase
from discussion_service.utils.constants import DISCUSSION_TAGS_TABLE

BOOKS_TABLE = "book_catalogue"        # adjust if book_service's table is named differently
GENRES_COLUMN = "genre"     # adjust if the column is named differently

# False = exact match against the DB's case-sensitive uniqueness.
# True  = "Bibliography" and "bibliography" are treated as the same tag.
NORMALIZE_CASE = True


def fetch_all_genres() -> set[str]:
	"""
	Fetches every book's genres array and flattens them into a set of
	unique genre strings across the whole table.
	"""
	res = supabase.table(BOOKS_TABLE).select(GENRES_COLUMN).execute()

	unique_genres: set[str] = set()
	for row in res.data or []:
		genres = row.get(GENRES_COLUMN) or []
		for genre in genres:
			if genre:
				unique_genres.add(genre.strip())

	return unique_genres


def fetch_existing_tag_names() -> set[str]:
	"""Fetches every tag name currently in the "tags" table."""
	res = supabase.table(DISCUSSION_TAGS_TABLE).select("name").execute()
	return {str(row["name"]) for row in (res.data or [])}


def populate_tags() -> None:
	"""
	Inserts one "tags" row per unique genre not already present, skipping
	anything that already exists.
	"""
	unique_genres = fetch_all_genres()
	existing_names = fetch_existing_tag_names()
	existing_lookup = {n.lower() for n in existing_names} if NORMALIZE_CASE else existing_names

	created: list[str] = []
	skipped: list[str] = []

	for genre in sorted(unique_genres):
		key = genre.lower() if NORMALIZE_CASE else genre

		if key in existing_lookup:
			skipped.append(genre)
			continue

		try:
			supabase.table(DISCUSSION_TAGS_TABLE).insert({"name": genre}).execute()
			created.append(genre)
			existing_lookup.add(key)  # so a later duplicate genre string this run doesn't try to insert twice
		except Exception as exc:
			msg = str(exc).lower()
			if "duplicate" in msg or "already exists" in msg:
				# Lost a race, or the exact-match check above missed a
				# case variant — either way, it exists now, so skip it.
				skipped.append(genre)
			else:
				raise

	print(f"Found {len(unique_genres)} unique genre(s) across all books.")
	print(f"Created {len(created)} new tag(s): {created}")
	print(f"Skipped {len(skipped)} already-existing tag(s): {skipped}")


if __name__ == "__main__":
	populate_tags()