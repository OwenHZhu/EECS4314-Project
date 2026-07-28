from fastapi import APIRouter, Depends, HTTPException, Query

from discussion_service.schemas.discussion_forum import (
	LikeStatus,
	ReplyCreate,
	ReplyUpdate,
	Tag,
	ThreadCreate,
	ThreadPost,
	ThreadReply,
	ThreadUpdate,
	UserActivityResponse,
)
from discussion_service.services.discussion_service import (
	create_reply,
	create_thread,
	delete_reply,
	delete_thread,
	get_thread,
	get_user_activity,
	list_replies,
	list_replies_tree,
	list_tags,
	list_threads,
	toggle_reply_like,
	toggle_thread_like,
	update_reply,
	update_thread,
	list_popular_threads,
)
from auth_service.utils.jwt import get_current_user_id

router = APIRouter(prefix="/forum", tags=["Forum"])


def _status_for(message: str) -> int:
	"""
	Maps a service-layer failure message to an HTTP status code.

	discussion_service.py returns {"success": False, "message": ...}
	instead of raising, so the router decides the status code from the
	message itself rather than from an exception type.
	"""
	lowered = message.lower()
	if "not found" in lowered:
		return 404
	if "author" in lowered:
		return 403
	return 400


@router.get("/tags", response_model=list[Tag])
def read_forum_tags():
	"""Public read — no auth required to see available tags."""
	result = list_tags()
	return result["data"]

@router.post("/threads", response_model=ThreadPost)
def create_forum_thread(payload: ThreadCreate, user_id: str = Depends(get_current_user_id)):
	"""
	Creates a new thread.

	user_id comes from the verified token (get_current_user_id, imported
	from auth_service.utils.jwt), never from the request body — otherwise
	a caller could post as any user just by setting a different user_id in
	their JSON. ThreadCreate has no user_id field for exactly this reason.
	"""
	result = create_thread(user_id, payload)
	if not result["success"]:
		raise HTTPException(status_code=_status_for(result["message"]), detail=result["message"])
	return result["data"]


@router.get("/threads", response_model=list[ThreadPost])
def read_forum_threads(book_id: str | None = Query(default=None)):
	"""
	Public read — no auth required. Browses threads for a specific book
	via ?book_id=..., or every thread across all books if book_id is
	omitted entirely.
	"""
	result = list_threads(book_id=book_id)
	return result["data"]

@router.get("/threads/popular", response_model=list[ThreadPost])
def read_popular_threads(limit: int = Query(default=10, ge=1, le=100)):
	"""
	Public read — no auth required. Returns the most popular threads
	across all books, sorted by number of likes. The `limit` query
	parameter controls how many threads to return (default 10, max 100).
	"""
	result = list_popular_threads(limit=limit)
	return result["data"]


@router.get("/threads/{thread_id}", response_model=ThreadPost)
def read_forum_thread(thread_id: str):
	"""Public read — no auth required to view a single thread."""
	result = get_thread(thread_id)
	if not result["success"]:
		raise HTTPException(status_code=_status_for(result["message"]), detail=result["message"])
	return result["data"]


@router.patch("/threads/{thread_id}", response_model=ThreadPost)
def update_forum_thread(
	thread_id: str,
	payload: ThreadUpdate,
	user_id: str = Depends(get_current_user_id),
):
	"""
	Edits a thread's title/content/spoiler flag. Only the original author
	may edit — enforced in services/discussion_service.update_thread(),
	which returns success: False if user_id doesn't match the thread's
	author.
	"""
	result = update_thread(thread_id, user_id, payload)
	if not result["success"]:
		raise HTTPException(status_code=_status_for(result["message"]), detail=result["message"])
	return result["data"]


@router.delete("/threads/{thread_id}")
def delete_forum_thread(thread_id: str, user_id: str = Depends(get_current_user_id)):
	"""
	Deletes a thread. Only the original author may delete — enforced in
	services/discussion_service.delete_thread(). Deleting the thread
	cascades at the DB level to remove its replies, tag links, and likes.
	"""
	result = delete_thread(thread_id, user_id)
	if not result["success"]:
		raise HTTPException(status_code=_status_for(result["message"]), detail=result["message"])
	return {"message": result["message"]}


@router.post("/threads/{thread_id}/replies", response_model=ThreadReply)
def create_forum_reply(
	thread_id: str,
	payload: ReplyCreate,
	user_id: str = Depends(get_current_user_id),
):
	"""Creates a reply on a thread. user_id comes from the verified token."""
	result = create_reply(thread_id, user_id, payload)
	if not result["success"]:
		raise HTTPException(status_code=_status_for(result["message"]), detail=result["message"])
	return result["data"]


@router.patch("/threads/{thread_id}/replies/{reply_id}", response_model=ThreadReply)
def update_forum_reply(
	thread_id: str,
	reply_id: str,
	payload: ReplyUpdate,
	user_id: str = Depends(get_current_user_id),
):
	"""
	Edits a reply's content. Only the original author may edit —
	enforced in services/discussion_service.update_reply().

	thread_id in the path isn't used by the service lookup itself
	(reply_id alone identifies the row) — it's kept for REST nesting
	consistency with the other /threads/{thread_id}/replies routes.
	"""
	result = update_reply(reply_id, user_id, payload)
	if not result["success"]:
		raise HTTPException(status_code=_status_for(result["message"]), detail=result["message"])
	return result["data"]


@router.delete("/threads/{thread_id}/replies/{reply_id}")
def delete_forum_reply(thread_id: str, reply_id: str, user_id: str = Depends(get_current_user_id)):
	"""
	Deletes a reply. Only the original author may delete — enforced in
	services/discussion_service.delete_reply(). Child replies nested
	under this one are NOT deleted — they become top-level replies on
	the thread (parent_reply_id is ON DELETE SET NULL at the DB level).
	"""
	result = delete_reply(reply_id, user_id)
	if not result["success"]:
		raise HTTPException(status_code=_status_for(result["message"]), detail=result["message"])
	return {"message": result["message"]}


@router.get("/threads/{thread_id}/replies")
def read_forum_replies(thread_id: str, nested: bool = False):
	"""
	Public read — no auth required to view replies.

	No response_model here since this legitimately returns two different
	shapes (flat list[ThreadReply] vs. nested tree of dicts) depending on
	`nested` — see list_replies_tree()'s docstring for why the tree isn't
	a formal schema.
	"""
	result = list_replies_tree(thread_id) if nested else list_replies(thread_id)
	return result["data"]


@router.get("/users/{user_id}/activity", response_model=UserActivityResponse)
def read_user_activity(user_id: str):
	"""
	Retrieves a user's activity in the discussion forum, including threads and replies.

	Left as a public read — flag if you'd rather restrict this to the user
	themselves via Depends(get_current_user_id) plus a match check.
	"""
	result = get_user_activity(user_id)
	if not result["success"]:
		raise HTTPException(status_code=_status_for(result["message"]), detail=result["message"])
	return result["data"]


@router.post("/threads/{thread_id}/like", response_model=LikeStatus)
def like_forum_thread(thread_id: str, user_id: str = Depends(get_current_user_id)):
	"""user_id comes from the verified token — a user can only like as themselves."""
	result = toggle_thread_like(user_id, thread_id)
	return result["data"]


@router.post("/replies/{reply_id}/like", response_model=LikeStatus)
def like_forum_reply(reply_id: str, user_id: str = Depends(get_current_user_id)):
	"""Same as like_forum_thread — user_id comes from the verified token."""
	result = toggle_reply_like(user_id, reply_id)
	return result["data"]

