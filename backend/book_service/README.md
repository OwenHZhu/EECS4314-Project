# 📚 Book Service (BookAtlas)

The Book Service is a standalone microservice responsible for managing the global catalogue of books for the BookAtlas platform.

It handles CRUD operations for book metadata and dynamically aggregates real-time user engagement metrics, such as ratings and reading statuses, from the Library Service.

## Architecture

- **Framework:** FastAPI (Python)
- **Data Validation:** Pydantic
- **Database:** Supabase (PostgreSQL)
- **Design Pattern:** Controller/Service pattern
  - `routers/books.py` handles HTTP routing and request validation.
  - `services/book_service.py` handles business logic and database operations.

---

## API Documentation

**Base URL:** `/api/v1/books`

## The Book Object

Successful single-book requests return a unified JSON response containing the book's metadata and aggregated `library_stats`.

```json
{
  "data": {
    "id": "6d896779-7fed-4ef3-a318-2784451571ec",
    "title": "Pride and Prejudice",
    "author": "Jane Austen",
    "description": "An 1813 novel of manners...",
    "isbn": "9798518711563",
    "cover_image": "https://covers.openlibrary.org/example.jpg",
    "genre": [
      "Romance",
      "Historical",
      "Fiction"
    ],
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
          "1": {
            "count": 0,
            "percentage": 0.0
          },
          "2": {
            "count": 0,
            "percentage": 0.0
          },
          "3": {
            "count": 0,
            "percentage": 0.0
          },
          "4": {
            "count": 1,
            "percentage": 50.0
          },
          "5": {
            "count": 1,
            "percentage": 50.0
          }
        }
      }
    }
  }
}
```

---

## API Endpoints

### `GET /`

Retrieves a list of books from the catalogue.

#### Query Parameters

- `q` — Optional string used to search book titles. The search is case-insensitive.
- `limit` — Optional integer specifying the maximum number of records to return. Defaults to `50`.

#### Responses

- **200 OK** — Returns an array of book objects.

---

### `GET /{book_id}`

Retrieves the details and aggregated library statistics for a single book.

#### Path Parameters

- `book_id` — Required UUIDv4 identifier of the book.

#### Responses

- **200 OK** — Returns the complete book object, including the dynamically generated `library_stats`.
- **404 Not Found** — Returned when the book does not exist.

---

### `POST /`

Adds a new book to the global catalogue.

#### Required Body Fields

- `title` — String with a maximum length of 300 characters.
- `author` — String containing the book author's name.

#### Optional Body Fields

- `description`
- `isbn`
- `cover_image`
- `genre` — Array of strings.
- `published_date`
- `page_count`
- `publisher`
- `series`
- `time_period`

#### Responses

- **201 Created** — Returns the newly created book object.
- **500 Internal Server Error** — Returned when the database insertion fails.

---

### `PATCH /{book_id}`

Updates selected fields of an existing book.

#### Path Parameters

- `book_id` — Required UUIDv4 identifier of the book to update.

#### Request Body

Send only the fields that need to be updated.

```json
{
  "page_count": 300
}
```

#### Responses

- **200 OK** — Returns the updated book object.
- **400 Bad Request** — Returned when no valid fields are provided.
- **404 Not Found** — Returned when the book does not exist.

---

### `DELETE /{book_id}`

Permanently removes a book from the catalogue.

#### Path Parameters

- `book_id` — Required UUIDv4 identifier of the book to delete.

#### Responses

- **204 No Content** — The book was deleted successfully. No response body is returned.
- **404 Not Found** — Returned when the book does not exist.