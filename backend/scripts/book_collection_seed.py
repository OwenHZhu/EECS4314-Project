import json
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from database.db import supabase

OPEN_LIBRARY_SEARCH = "https://openlibrary.org/search.json"
OPEN_LIBRARY_COVER = "https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"
OPEN_LIBRARY_WORKS = "https://openlibrary.org{external_id}.json"

TARGET_BOOKS = 30_000
PAGE_SIZE = 100        # max Open Library allows per request
BATCH_SIZE = 50        # how many books to upsert to Supabase at once
START_PAGE = 300     # checkpoint

SEARCH_QUERIES = [
    "language:eng",
]
# OUTPUT_FILE = Path("scripts/seed_output.json")


def create_session() -> requests.Session:
    session = requests.Session()

    retry_strategy = Retry(
        total=5,
        backoff_factor=2,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )

    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)

    return session


def fetch_description(session: requests.Session, external_id: str) -> str | None:
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


def parse_book(doc: dict) -> dict | None:
    title = doc.get("title")
    authors = doc.get("author_name", [])
    cover_id = doc.get("cover_i")
    external_id = doc.get("key")

    if not title or not authors or not external_id:
        return None

    # Skip books without covers — usually low quality entries
    if not cover_id:
        return None

    return {
        "external_id": external_id,
        "title": title,
        "author": ", ".join(authors[:3]),
        "description": None,
        "cover_image": OPEN_LIBRARY_COVER.format(cover_id=cover_id),
        "genre": doc.get("subject", [])[:5],
        "isbn": doc.get("isbn", [None])[0],
        "published_date": str(doc.get("first_publish_year")) if doc.get("first_publish_year") else None,
        "page_count": doc.get("number_of_pages_median"),
        "publisher": doc.get("publisher", [None])[0],
        "series": doc.get("series", [None])[0],
        "time_period": doc.get("time", [None])[0],
    }
    
def upsert_batch(books: list[dict]) -> int:
    try:
        res = supabase.table("book_catalogue").upsert(
            books,
            on_conflict="external_id",
            ignore_duplicates=True
        ).execute()

        return len(res.data) if res.data else 0

    except Exception as e:
        print(f"  ✗ Failed to upsert batch: {e}")
        return 0


def fetch_page(session: requests.Session, page: int) -> list[dict]:
    for attempt in range(1, 4):
        try:
            query = SEARCH_QUERIES[page % len(SEARCH_QUERIES)]
            res = session.get(
                OPEN_LIBRARY_SEARCH,
                params={
                    "q": query,        # valid query filter
                    "sort": "editions",          # most editions = most popular
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
            print(f"  ✗ Connect timeout on page {page}, attempt {attempt}/3 — retrying in {wait}s...")
            time.sleep(wait)

        except requests.exceptions.ReadTimeout:
            wait = 5 * attempt
            print(f"  ✗ Read timeout on page {page}, attempt {attempt}/3 — retrying in {wait}s...")
            time.sleep(wait)

        except Exception as e:
            print(f"  ✗ Failed page {page}: {e}")
            return []

    print(f"  ✗ Gave up on page {page} after 3 attempts")
    return []


def seed():
    print(f"Seeding top {TARGET_BOOKS:,} most popular books from Open Library into Supabase...\n")

    session = create_session()
    all_books: dict[str, dict] = {}
    pending_batch: list[dict] = []
    page = START_PAGE
    total_pages = TARGET_BOOKS // PAGE_SIZE
    total_inserted = 0

    while len(all_books) < TARGET_BOOKS:
        print(f"  Fetching page {page}/{total_pages} ({len(all_books):,} books so far)...")

        docs = fetch_page(session, page)

        if not docs:
            print("  No more results, stopping.")
            break

        for doc in docs:
            parsed = parse_book(doc)
            if not parsed or parsed["external_id"] in all_books:
                continue

            all_books[parsed["external_id"]] = parsed
            pending_batch.append(parsed)

            # Upsert to Supabase in batches
            if len(pending_batch) >= BATCH_SIZE:
                inserted = upsert_batch(pending_batch)
                total_inserted += inserted
                print(f"  → Inserted batch of {inserted} books (total: {total_inserted:,})")
                pending_batch = []

        page += 1
        time.sleep(0.5)

    # Insert any remaining books
    if pending_batch:
        inserted = upsert_batch(pending_batch)
        total_inserted += inserted
        print(f"  → Inserted final batch of {inserted} books (total: {total_inserted:,})")

    print(f"\nDone. Total books seeded to Supabase: {total_inserted:,}")


# def _save(data: list, path: Path):
#     path.parent.mkdir(parents=True, exist_ok=True)
#     with open(path, "w", encoding="utf-8") as f:
#         json.dump(data, f, indent=2, ensure_ascii=False)
#     print(f"  Saved {len(data):,} books to {path}")

if __name__ == "__main__":
    seed()