from fastapi import APIRouter, HTTPException, Query

from schemas.discussion_forum import (
    ReplyCreate,
	ThreadCreate,
	ThreadPost,
	ThreadReply,
	UserActivityResponse,
)
from services.discussion_service import (
	count_reply_likes,
	count_thread_likes,
	create_reply,
	create_thread,
	get_thread,
	get_user_activity,
	like_reply,
	like_thread,
	list_replies,
	list_threads,
	toggle_reply_like,
	toggle_thread_like,
	unlike_reply,
	unlike_thread,
	list_replies_tree,
)


router = APIRouter(prefix="/forum", tags=["Forum"])

@router.post("/threads", response_model=ThreadPost)
def create_forum_thread(payload: ThreadCreate):
	try:
		return create_thread(
		user_id=payload.user_id,
		title=payload.title,
		content=payload.content,
		tag_ids=payload.tag_ids,
		)
	except ValueError as exc:
		raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/threads", response_model=list[ThreadPost])
def read_forum_threads(book_id: str | None = Query(default=None)):
	return list_threads(book_id=book_id)


@router.get("/threads/{thread_id}", response_model=ThreadPost)
def read_forum_thread(thread_id: str):
	try:
		return get_thread(thread_id)
	except ValueError as exc:
		raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/threads/{thread_id}/replies", response_model=ThreadReply)
def create_forum_reply(thread_id: str, payload: ReplyCreate):
	try:
		return create_reply(
			thread_id=thread_id,
			user_id=payload.user_id,
			content=payload.content,
			parent_reply_id=payload.parent_reply_id,
		)
	except ValueError as exc:
		raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/threads/{thread_id}/replies", response_model=list[ThreadReply])
@router.get("/threads/{thread_id}/replies")
def read_forum_replies(thread_id: str, nested: bool = False):
    if nested:
        return list_replies_tree(thread_id=thread_id)
    return list_replies(thread_id=thread_id)

@router.get("/users/{user_id}/activity", response_model=UserActivityResponse)
def read_user_activity(user_id: str):
	"""
	Retrieves a user's activity in the discussion forum, including threads and replies.

	Args:
		user_id (str): The ID of the user.
	Returns:
		UserActivityResponse: The user's activity in the forum.
	"""
	try:
		return get_user_activity(user_id)
	except ValueError as exc:
		raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/threads/{thread_id}/like")
def like_forum_thread(thread_id: str, user_id: str):
	liked = toggle_thread_like(user_id=user_id, thread_id=thread_id)
	return {"liked": liked, "like_count": count_thread_likes(thread_id)}


@router.post("/replies/{reply_id}/like")
def like_forum_reply(reply_id: str, user_id: str):
	liked = toggle_reply_like(user_id=user_id, reply_id=reply_id)
	return {"liked": liked, "like_count": count_reply_likes(reply_id)}
	