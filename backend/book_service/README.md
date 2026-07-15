# 📚 Book Service (BookAtlas)

The Book Service is a standalone microservice responsible for managing the global catalogue of books for the BookAtlas platform. It handles all CRUD operations for book metadata and dynamically aggregates real-time user engagement metrics (ratings and reading statuses) from the Library Service.

## Architecture

*   **Framework:** FastAPI (Python)
*   **Data Validation:** Pydantic
*   **Database:** Supabase (PostgreSQL)
*   **Design Pattern:** Controller/Service pattern. 
    *   `routers/books.py` handles HTTP routing and strict data validation.
    *   `services/book_service.py` handles business logic and database execution.

---

## API Documentation

**Base URL:** `/api/v1/books`

### The Book Object

All successful single-book `GET` requests return a unified JSON payload combining the core book details with aggregated `library_stats`.

```json
{
  "data": {
    "id": "6d896779-7fed-4ef3-a318-2784451571ec",
    "title": "Pride and Prejudice",
    "author": "Jane Austen",
    "description": "An 1813 novel of manners...",
    "isbn": "9798518711563",
    "cover_image": "[https://covers.openlibrary.org/](https://covers.openlibrary.org/)...",
    "genre": ["Romance", "Historical", "Fiction"],
    "published_date": "1813",
    "page_count": 351,
    "publisher": "Crafting 52",
    "series": null,
    "time_period": "1789-1820",
    "library_stats": {
      "wishlist_count": 12,
      "reading_count": 4,
      "ratings": {
        "average": 4.5,
        "total_ratings": 2,
        "distribution": {
          "1": { "count": 0, "percentage": 0.0 },
          "2": { "count": 0, "percentage": 0.0 },
          "3": { "count": 0, "percentage": 0.0 },
          "4": { "count": 1, "percentage": 50.0 },
          "5": { "count": 1, "percentage": 50.0 }
        }
      }
    }
  }
}

## API Endpoints

**Base URL:** `/api/v1/books`

### GET /
Retrieves a list of all books in the catalogue.

*   **Query `q`:** Optional string to search against book titles (case-insensitive).
*   **Query `limit`:** Optional integer for the maximum number of records to return. Defaults to `50`.
*   **Success (200):** Returns an array of Book Objects.

### GET /{book_id}
Retrieves the full details and aggregated library statistics for a single book.

*   **Path `book_id`:** Required UUIDv4 of the book.
*   **Success (200):** Returns the full Book Object, including the dynamically generated `library_stats`.
*   **Error (404):** Returned if the book does not exist.

### POST /
Adds a completely new book to the global catalogue.

*   **Body (Required):** `title` (string, max 300 chars) and `author` (string).
*   **Body (Optional):** `description`, `isbn`, `cover_image`, `genre` (array of strings), `published_date`, `page_count`, `publisher`, `series`, `time_period`.
*   **Success (201):** Returns the newly generated Book Object.
*   **Error (500):** Returned if database insertion fails.

### PATCH /{book_id}
Modifies specific fields of an existing book using a partial update. 

*   **Path `book_id`:** Required UUIDv4 of the book to update.
*   **Body:** Send only the specific keys you wish to update (e.g., `{"page_count": 300}`).
*   **Success (200):** Returns the fully updated Book Object.
*   **Error (400):** Returned if no valid fields are provided in the request body.
*   **Error (404):** Returned if the book does not exist.

### DELETE /{book_id}
Permanently removes a book from the catalogue.

*   **Path `book_id`:** Required UUIDv4 of the book to delete.
*   **Success (204):** No body content is returned upon successful deletion.
*   **Error (404):** Returned if the book does not exist.