from fastapi import APIRouter, HTTPException, Query

from schemas.discussion_forum import (
    ReplyCreate,
	ThreadCreate,
	ThreadPost,
	ThreadReply,
)
from services.discussion_service import (
	create_reply,
	create_thread,
	get_thread,
	list_replies,
	list_threads,
)


router = APIRouter(prefix="/forum", tags=["Forum"])



@router.post("/threads", response_model=ThreadPost)
def create_forum_thread(payload: ThreadCreate):
	try:
		return create_thread(
		book_id=payload.book_id,
		user_id=payload.user_id,
		title=payload.title,
		content=payload.content,
		category=payload.category,
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
def read_forum_replies(thread_id: str):
	return list_replies(thread_id=thread_id)