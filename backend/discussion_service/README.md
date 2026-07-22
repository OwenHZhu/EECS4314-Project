# Discussion Service

This service manages discussion threads, replies, likes, and user activity for BookAtlas.

## Overview

- FastAPI app exposing discussion forum endpoints.
- Uses Supabase (Postgres) via `shared.db.supabase` for persistence.
- Runs as a separate microservice on port 8004 (development).

## Key Endpoints (prefixed with `/api/v1`)

- `GET /health` — service health check
- `GET /forum/threads` — list threads (optional `book_id` query)
- `POST /forum/threads` — create a thread
- `GET /forum/threads/{thread_id}` — get a thread
- `POST /forum/threads/{thread_id}/replies` — add a reply
- `GET /forum/threads/{thread_id}/replies` — list replies
- `POST /threads/{thread_id}/like` — toggle like for a thread
- `POST /replies/{reply_id}/like` — toggle like for a reply
- `GET /users/{user_id}/activity` — get user threads & replies

Request and response models are defined in `schemas/discussion_forum.py`.

## Database Tables (used)

- `thread_forum` — threads
- `replies` — replies to threads
- `thread_tags` — many-to-many thread tags
- `thread_likes` — thread likes
- `reply_likes` — reply likes

## Running (development)

1. Activate project virtualenv.

```powershell
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. From the `backend/discussion_service` folder run:

```powershell
python discussion_service.py
```

This starts uvicorn on `0.0.0.0:8004` with reload enabled.

## Notes

- The router currently expects `user_id` in request bodies for some endpoints; consider switching to JWT-based `Depends` authentication (see `utils.jwt`) for production.
- CORS origins are configured from `shared.constants.ORIGINS`.
- See `services/discussion_service.py` for business logic and `routers/forum.py` for route definitions.

## Shared dependencies

- `shared.db` provides the Supabase client.
- `shared.constants` provides shared CORS origins.
