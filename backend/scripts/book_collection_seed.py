"""
utils/book_collection_seed.py

Seeding script that populates the book_catalogue table in Supabase with books
fetched from the Open Library API.

How it works:
    1. Paginates through Open Library's search API sorted by most editions (popularity proxy)
    2. Parses each result into a BookCreate schema for validation
    3. Upserts books to Supabase in batches of BATCH_SIZE

Usage:
    Run from the backend root directory:
        python -m utils.book_collection_seed

Configuration:
    TARGET_BOOKS  - Total number of books to seed (default: 30,000)
    PAGE_SIZE     - Results per API request, max 100 (default: 100)
    BATCH_SIZE    - Books per Supabase upsert (default: 50)
    START_PAGE    - Page to resume from if the script was interrupted (default: 300)
                    Update this to the last successful page to resume seeding

Notes:
    - Safe to re-run — upsert with on_conflict="external_id" skips existing books
    - Books without cover images are skipped (usually incomplete entries)
    - Descriptions are not fetched here due to rate limits — run
      utils/book_description_enrichment.py separately after seeding to fill them in
    - Open Library allows max 100 results per page request
"""

# import json
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from schemas.book import BookCreate
from database.db import supabase

OPEN_LIBRARY_SEARCH = "https://openlibrary.org/search.json"
OPEN_LIBRARY_COVER = "https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"
OPEN_LIBRARY_WORKS = "https://openlibrary.org{external_id}.json"

TARGET_BOOKS = 30_000
PAGE_SIZE = 100        # max Open Library allows per request
BATCH_SIZE = 50        # how many books to upsert to Supabase at once
START_PAGE = 300     # checkpoint

SEARCH_QUERIES = ["language:eng"]
# OUTPUT_FILE = Path("scripts/seed_output.json")


def create_session() -> requests.Session:
    """
    Create a requests session with automatic retry logic.
    Retries up to 5 times with exponential backoff on server errors (429, 500, 502, 503, 504).
    """
    session = requests.Session()

    retry_strategy = Retry(total=5, backoff_factor=2, status_forcelist=[429, 500, 502, 503, 504], allowed_methods=["GET"])

    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)

    return session

def fetch_description(session: requests.Session, external_id: str) -> str | None:
    """
    Fetch a book's description from the Open Library works endpoint.
    
    Note: This is not called during seeding due to rate limits.
    Descriptions are fetched separately via utils/book_description_enrichment.py.

    Args:
        session:     Shared requests session
        external_id: Open Library work ID e.g. '/works/OL45804W'

    Returns:
        Description string or None if not available
    """
    try:
        url = OPEN_LIBRARY_WORKS.format(external_id=external_id)
        res = session.get(url, timeout=(10, 30))
        res.raise_for_status()

        data = res.json()
        description = data.get("description")

        if isinstance(description, dict):
            return description.get("value")
        if isinstance(description, str):
            return description

        return None

    except Exception:
        return None


def parse_book(doc: dict) -> BookCreate | None:
    """
    Parse a raw Open Library search result into a validated BookCreate schema.

    Skips books that are missing critical fields (title, authors, external_id)
    or have no cover image (usually low quality or incomplete entries).

    Args:
        doc: Raw document dict from Open Library search response

    Returns:
        Validated BookCreate instance or None if the book should be skipped
    """
    title = doc.get("title")
    authors = doc.get("author_name", [])
    cover_id = doc.get("cover_i")
    external_id = doc.get("key")

    if not title or not authors or not external_id:
        return None

    if not cover_id:
        return None

    try:
        return BookCreate(
            external_id=external_id,
            title=title,
            author=", ".join(authors[:3]),
            description=None,
            cover_image=OPEN_LIBRARY_COVER.format(cover_id=cover_id),
            genre=doc.get("subject", [])[:5] or None,
            isbn=doc.get("isbn", [None])[0],
            published_date=str(doc.get("first_publish_year")) if doc.get("first_publish_year") else None,
            page_count=doc.get("number_of_pages_median"),
            publisher=doc.get("publisher", [None])[0],
            series=doc.get("series", [None])[0],
            time_period=doc.get("time", [None])[0],
        )
    except Exception as e:
        print(f"Failed to parse book '{title}': {e}")
        return None
    
def upsert_batch(books: list[BookCreate]) -> int:
    """
    Upsert a batch of BookCreate objects into the book_catalogue table in Supabase.
    Skips books that already exist based on external_id (safe to re-run).

    Args:
        books: List of validated BookCreate instances to insert

    Returns:
        Number of books successfully inserted
    """
    try:
        res = supabase.table("book_catalogue").upsert(
            [book.model_dump() for book in books],
            on_conflict="external_id",
            ignore_duplicates=True
        ).execute()

        return len(res.data) if res.data else 0

    except Exception as e:
        print(f"Failed to upsert batch: {e}")
        return 0


def fetch_page(session: requests.Session, page: int) -> list[dict]:
    """
    Fetch a single page of book results from Open Library search API.
    Retries up to 3 times on timeout with increasing wait times.

    Args:
        session: Shared requests session with retry logic
        page:    Page number to fetch

    Returns:
        List of raw book docs from Open Library, or empty list on failure
    """
    
    for attempt in range(1, 4):
        try:
            query = SEARCH_QUERIES[page % len(SEARCH_QUERIES)]
            res = session.get(
                OPEN_LIBRARY_SEARCH,
                params={
                    "q": query,
                    "sort": "editions",
                    "limit": PAGE_SIZE,
                    "page": page,
                    "fields": "key,title,author_name,cover_i,subject,isbn,first_publish_year,number_of_pages_median,publisher,series,time"
                },
                timeout=(10, 30)
            )

            res.raise_for_status()
            return res.json().get("docs", [])

        except requests.exceptions.ConnectTimeout:
            wait = 5 * attempt
            print(f"Connect timeout on page {page}, attempt {attempt}/3 — retrying in {wait}s...")
            time.sleep(wait)

        except requests.exceptions.ReadTimeout:
            wait = 5 * attempt
            print(f"Read timeout on page {page}, attempt {attempt}/3 — retrying in {wait}s...")
            time.sleep(wait)

        except Exception as e:
            print(f"Failed page {page}: {e}")
            return []

    print(f"Gave up on page {page} after 3 attempts")
    return []


def seed():
    """
    Main seeding entry point.

    Paginates through Open Library sorted by most editions, validates each book
    through BookCreate, deduplicates by external_id, and upserts to Supabase
    in batches.

    To resume after an interruption:
        Update START_PAGE at the top of the file to the last successfully
        processed page number shown in the console output.
    """
    print(f"Seeding top {TARGET_BOOKS:,} most popular books from Open Library into Supabase...\n")

    session = create_session()
    all_books: dict[str, BookCreate] = {}
    pending_batch: list[BookCreate] = []
    page = START_PAGE
    total_pages = TARGET_BOOKS // PAGE_SIZE
    total_inserted = 0

    while len(all_books) < TARGET_BOOKS:
        print(f"Fetching page {page}/{total_pages} ({len(all_books):,} books so far)...")

        docs = fetch_page(session, page)

        if not docs:
            print("  No more results, stopping.")
            break

        for doc in docs:
            parsed = parse_book(doc)
            if not parsed or parsed.external_id in all_books:
                continue

            all_books[parsed.external_id] = parsed
            pending_batch.append(parsed)

            if len(pending_batch) >= BATCH_SIZE:
                inserted = upsert_batch(pending_batch)
                total_inserted += inserted
                print(f"Inserted batch of {inserted} books (total: {total_inserted:,})")
                pending_batch = []

        page += 1
        time.sleep(0.5)

    if pending_batch:
        inserted = upsert_batch(pending_batch)
        total_inserted += inserted
        print(f"Inserted final batch of {inserted} books (total: {total_inserted:,})")

    print(f"\nDone. Total books seeded to Supabase: {total_inserted:,}")


if __name__ == "__main__":
    seed()