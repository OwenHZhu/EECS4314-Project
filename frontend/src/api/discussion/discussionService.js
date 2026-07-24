/**
 * ./api/discussion/discussionService.js
 *
 * Wraps all auth‑related API calls for the discussionClient.
 *
 * Endpoints assume the following backend routes:
 * - GET forum/tags
 * - GET forum/threads (connected)
 * - GET forum/threads/{thread_id}
 * - GET forum/threads/{thread_id}/replies
 * - GET forum/users/{user_id}/activity

 * - POST forum/threads
 * - POST forum/threads/{thread_id}/replies
 * - POST forum/threads/{thread_id}/like
 * - POST forum/threads/{reply_id}/like

 * - PATCH forum/threads/{thread_id}
 * - PATCH forum/threads/{thread_id}/replies/{reply_id}
 * 
 * - DELETE forum/threads/{thread_id}
 * - DELETE forum/threads/{thread_id}/replies/{reply_id}
 */

import discussionClient from "./discussionClient";

export async function getThreads() {
    try {
        const res = await discussionClient.get("forum/threads");
        return {
            success: true,
            data: res.data
        }
    }
    catch (err) {
        console.log(err.response);
    }
}

export async function getThreadById(threadId) {
    try {
        const res = await discussionClient.get(`forum/threads/${threadId}`);
        return {
            success: true,
            data: res.data
        }
    }
    catch (err) {
        console.log(err.response);
    }
}

export async function getReplies(threadId, nested = true) {
    try {
        const res = await discussionClient.get(`forum/threads/${threadId}/replies`,
            {
                params: {
                    nested: nested
                }
            }
        );
        return {
            success: true,
            data: res.data
        }
    }
    catch (err) {
        console.log(err.response);
    }
}

export async function postReply(token, threadId, content, parent_reply_id = null) {
    try {
        const res = await discussionClient.post(`forum/threads/${threadId}/replies`,
            { content, parent_reply_id },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return {
            success: true,
            data: res.data
        }
    }
    catch (err) {
        console.log(err.response);
    }
}
