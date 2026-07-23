# BookAtlas — Library Service

Standalone library microservice for BookAtlas. Owns each authenticated
user's personal book library, including reading status, wishlist/favourites,
and optional per-book ratings stored on library entries.

## What this service owns

- Add a book to the authenticated user's library
- Retrieve the authenticated user's library
- Update a library entry's reading status or rating
- Remove a book from the authenticated user's library

## API routes

All routes are mounted under `/api/v1`.

```text
POST   /library
GET    /library
PATCH  /library/update
DELETE /library/{book_id}
GET    /health
```

Protected library routes require:

```text
Authorization: Bearer <token>
```

The user ID is extracted from the JWT token. The frontend should not send
`user_id` in the request body.

## Run locally

Run from the `backend/` directory:

```bash
uvicorn library_service.library_service:app --reload --port 8003
```

or:

```bash
python -m library_service.library_service
```

## Environment variables

This service uses shared Supabase and JWT configuration:

```text
SUPABASE_URL
SUPABASE_KEY
JWT_SECRET
```

## Shared dependencies

- `shared.db` provides the Supabase client.
- `shared.constants` provides shared CORS origins.
- `auth_service.utils.jwt` provides JWT validation for protected routes.
