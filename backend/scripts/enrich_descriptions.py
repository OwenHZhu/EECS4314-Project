from database.db import supabase
import time
import requests


def get_books_missing_description(limit=1000):
    res = supabase.table("book_catalogue").select("external_id").is_("description", "null").limit(limit).execute()

    return res.data or []


# -----------------------------
def fetch_description(external_id: str):
    url = f"https://openlibrary.org{external_id}.json"

    try:
        r = requests.get(url, timeout=10)

        if r.status_code != 200:
            return None

        data = r.json()
        desc = data.get("description")

        # primary description field
        if isinstance(desc, dict):
            return desc.get("value")
        if isinstance(desc, str):
            return desc

        # fallback: first sentence
        first_sentence = data.get("first_sentence")

        if isinstance(first_sentence, dict):
            return first_sentence.get("value")
        if isinstance(first_sentence, str):
            return first_sentence

        return None

    except Exception:
        return None


def update_description(external_id: str, description: str):
    try:
        supabase.table("book_catalogue").update({"description": description}).eq("external_id", external_id).execute()
    except Exception as e:
        print(f"DB update failed for {external_id}: {e}")


# -----------------------------
# STEP 4 — Main enrichment loop
# -----------------------------
def enrich_descriptions(batch_size=1000, sleep_time=0.3):
    books = get_books_missing_description(batch_size)
    
    if not books:
        print("No books found")
        return

    updated = 0
    skipped = 0

    for i, book in enumerate(books):
        if not isinstance(book, dict):
            continue
        
        external_id = book["external_id"]
        
        if not isinstance(external_id, str):
            continue

        desc = fetch_description(external_id)

        # IMPORTANT: only write real data
        if not desc:
            print(f"[{i}] No description → skipping")
            skipped += 1
            continue

        update_description(external_id, desc)
        print(f"[{i}] Updated {external_id}")

        updated += 1
        time.sleep(sleep_time)

    print("\n--- DONE ---")
    print(f"Updated: {updated}")
    print(f"Skipped (no description): {skipped}")


if __name__ == "__main__":
    enrich_descriptions()