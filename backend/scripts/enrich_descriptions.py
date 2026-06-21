"""
utils/book_description_enrichment.py

Enrichment script that fills in missing descriptions for books already seeded
in the book_catalogue table in Supabase.

Why this is separate from the seeding script:
    The main seeding script (utils/book_collection_seed.py) skips descriptions
    to avoid rate limits — fetching a description per book would require one
    extra API request per book, making 100,000 books take 12+ hours.
    This script runs separately after seeding to fill in descriptions in batches.

How it works:
    1. Fetches books from book_catalogue where description IS NULL in batches
    2. For each book, tries to fetch a description from Google Books API
    3. Updates the description in Supabase if found
    4. Gracefully stops if the Google Books API daily quota is exceeded (1,000 req/day free)
       and tells you exactly which offset to resume from tomorrow

Usage:
    Run from the backend root directory:
        python -m utils.book_description_enrichment

    To resume from a specific offset (after a quota hit):
        Update start_offset in the __main__ block at the bottom of the file
        e.g. enrich_descriptions(start_offset=2004)

Google Books API quota:
    Free tier allows 1,000 requests/day. To increase this limit:
    Go to Google Cloud Console → APIs & Services → Books API → Quotas
    Enable billing (still free up to a large quota, ~$1 for 100,000 requests)

Environment variables required (.env):
    GOOGLE_BOOKS_API_KEY - Your Google Books API key
                           Get one at https://console.cloud.google.com
                           Enable the Books API then create an API key under Credentials

TODO:
    - Add Open Library as a fallback source when Google Books returns no description
    - Add Open Library search endpoint as a third fallback
    - Store which source the description came from (google_books / open_library)
"""

import os
import time
import requests
from database.db import supabase
from dotenv import load_dotenv

load_dotenv()

GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes"
API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")

START_OFFSET = 2004


def fetch_description_google(title: str, author: str) -> str | None | bool:
    """
    Fetch a book description from the Google Books API.

    Searches by title and author, filters results to English only,
    and returns the description from the first matching English result.

    Args:
        title:  Book title to search for
        author: Book author to search for

    Returns:
        str   - Description if found
        None  - No description available for this book
        False - API quota exceeded (sentinel value to stop the enrichment loop)
    """
    
    try:
        r = requests.get(GOOGLE_BOOKS_API, params={
            "q": f"intitle:{title} inauthor:{author}",
            "maxResults": 5,
            "printType": "books",
            "langRestrict": "en",
            "key": API_KEY
        }, timeout=10)

        if r.status_code == 429 or r.status_code == 403:
            error_body = r.json()
            print(f"\nQUOTA EXCEEDED (HTTP {r.status_code}): {error_body}")
            return False  # quota hit

        if r.status_code != 200:
            return None

        items = r.json().get("items", [])
        if not items:
            return None

        english_item = next(
            (item for item in items if item.get("volumeInfo", {}).get("language") == "en"),
            None
        )

        if not english_item:
            return None

        return english_item.get("volumeInfo", {}).get("description")

    except Exception:
        return None


def update_description(external_id: str, description: str):
    try:
        supabase.table("book_catalogue").update({"description": description}).eq("external_id", external_id).execute()
    except Exception as e:
        print(f"DB update failed for {external_id}: {e}")


def enrich_descriptions(batch_size=1000, sleep_time=0.5, start_offset=1000):
    offset = start_offset  # ← start from 1000th entry
    total_updated = 0
    total_skipped = 0
    batch_num = 0

    while True:
        batch_num += 1
        print(f"\n--- Fetching batch {batch_num} (offset {offset}) ---")

        res = supabase.table("book_catalogue").select("external_id, title, author").is_("description", "null").range(offset, offset + batch_size - 1).execute()

        books = res.data or []

        if not books:
            print("No more books to enrich.")
            break

        updated = 0
        skipped = 0
        quota_hit = False

        for i, book in enumerate(books):
            if not isinstance(book, dict):
                continue

            external_id = book.get("external_id", "")
            title = book.get("title", "")
            author = book.get("author", "")

            if not external_id or not title:
                continue

            desc = fetch_description_google(title, author)

            if desc is False:
                # Quota exceeded mid-search — stop everything
                print(f"\nQuota hit at book [{i}] in batch {batch_num} (absolute offset ~{offset + i})")
                print(f"  Last book attempted: '{title}' by {author}")
                total_updated += updated
                total_skipped += skipped
                print(f"\n--- STOPPED EARLY DUE TO QUOTA ---")
                print(f"  Batch {batch_num} — updated: {updated}, skipped: {skipped}")
                print(f"  Running total — updated: {total_updated}, skipped: {total_skipped}")
                print(f"  Resume tomorrow with: start_offset={offset + i}")
                return

            if not desc:
                print(f"  [{i}] No description found for: {title}")
                skipped += 1
            else:
                update_description(external_id, desc)
                print(f"  [{i}] Updated: {title}")
                updated += 1

            time.sleep(sleep_time)

        total_updated += updated
        total_skipped += skipped
        offset += batch_size

        print(f"Batch {batch_num} — updated: {updated}, skipped: {skipped}")
        print(f"Running total — updated: {total_updated}, skipped: {total_skipped}")

    print("\n--- ALL DONE ---")
    print(f"Total updated: {total_updated}")
    print(f"Total skipped: {total_skipped}")


def check_api_quota():
    r = requests.get(GOOGLE_BOOKS_API, params={
        "q": "atomic habits",
        "maxResults": 1,
        "key": API_KEY
    }, timeout=10)

    print(f"Status: {r.status_code}")
    print(f"Response: {r.json()}")


if __name__ == "__main__":
    enrich_descriptions(start_offset=START_OFFSET)