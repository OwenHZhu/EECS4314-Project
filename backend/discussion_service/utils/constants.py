"""
utils/constants.py

Supabase table names used throughout the Discussion Service.

Centralized here (rather than duplicated in services/discussion_service.py
and utils/helpers.py) so both modules can import the same constants without
services importing from helpers or vice versa.
"""

DISCUSSION_THREADS_TABLE = "thread_forum"
DISCUSSION_REPLIES_TABLE = "replies"
DISCUSSION_THREAD_TAGS_TABLE = "thread_tags"
DISCUSSION_THREAD_LIKES_TABLE = "thread_likes"
DISCUSSION_REPLY_LIKES_TABLE = "reply_likes"