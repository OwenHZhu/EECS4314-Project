/**
 * discussionService.js
 *
 * Provides all discussion‑related API calls for forum features:
 * - Tags
 * - Threads
 * - Replies
 * - User activity
 *
 * Endpoints follow backend routes under `forum/` and use discussionClient
 * for all HTTP requests. Token‑protected routes include Authorization headers.
 *
 * Dependencies:
 * - discussionClient: Axios instance for forum API requests
 */

import discussionClient from "./discussionClient";

/**
 * getUserActivity
 *
 * Fetches user activity (replies and threads) from a user.
 *
 * @param {string} userId
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getUserActivity(userId) {
    try {
        const res = await discussionClient.get(`forum/users/${userId}/activity`);
        return { success: true, data: res.data };
    } catch (err) {
        console.log(err.response);
    }
}

/**
 * getTags
 *
 * Fetches all available forum tags.
 *
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getTags() {
    try {
        const res = await discussionClient.get(`forum/tags`);
        return { success: true, data: res.data };
    } catch (err) {
        console.log(err.response);
    }
}

/**
 * postThread
 *
 * Creates a new discussion thread.
 *
 * @param {string} token - JWT for authorization
 * @param {string} title
 * @param {string} content
 * @param {string} book_id
 * @param {boolean} has_spoilers
 * @param {string[]} tags
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function postThread(token, title, content, book_id, has_spoilers, tags) {
    try {
        const res = await discussionClient.post(
            `forum/threads`,
            { title, content, book_id, has_spoilers, tags },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { success: true, data: res.data };
    } catch (err) {
        console.log(err.response);
    }
}

/**
 * getThreads
 *
 * Fetches all threads, optionally filtered by book ID.
 *
 * @param {string} book_id
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getThreads(book_id) {
    try {
        const res = await discussionClient.get(`forum/threads`, {
            params: { book_id }
        });
        return { success: true, data: res.data };
    } catch (err) {
        console.log(err.response);
    }
}

/**
 * getThreadById
 *
 * Fetches a single thread by its ID.
 *
 * @param {string} threadId
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getThreadById(threadId) {
    try {
        const res = await discussionClient.get(`forum/threads/${threadId}`);
        return { success: true, data: res.data };
    } catch (err) {
        console.log(err.response);
    }
}

/**
 * updateThread
 *
 * Updates an existing thread's title/content/spoiler flag.
 *
 * @param {string} token
 * @param {string} threadId
 * @param {string} title
 * @param {string} content
 * @param {boolean} has_spoilers
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function updateThread(token, threadId, title, content, has_spoilers) {
    try {
        const res = await discussionClient.patch(
            `forum/threads/${threadId}`,
            { title, content, has_spoilers },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { success: true, data: res.data };
    } catch (err) {
        console.log(err.response);
    }
}

/**
 * deleteThread
 *
 * Deletes a thread by ID.
 *
 * @param {string} token
 * @param {string} threadId
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function deleteThread(token, threadId) {
    try {
        const res = await discussionClient.delete(
            `forum/threads/${threadId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { success: true, data: res.data };
    } catch (err) {
        console.log(err.response);
    }
}

/**
 * getReplies
 *
 * Fetches replies for a thread. Supports nested or flat reply structures.
 *
 * @param {string} threadId
 * @param {boolean} [nested=true]
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function getReplies(threadId, nested = true) {
    try {
        const res = await discussionClient.get(
            `forum/threads/${threadId}/replies`,
            { params: { nested } }
        );
        return { success: true, data: res.data };
    } catch (err) {
        console.log(err.response);
    }
}

/**
 * postReply
 *
 * Creates a reply for a thread. Supports nested replies via parent_reply_id.
 *
 * @param {string} token
 * @param {string} threadId
 * @param {string} content
 * @param {string|null} parent_reply_id
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function postReply(token, threadId, content, parent_reply_id = null) {
    try {
        const res = await discussionClient.post(
            `forum/threads/${threadId}/replies`,
            { content, parent_reply_id },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { success: true, data: res.data };
    } catch (err) {
        console.log(err.response);
    }
}

/**
 * updateReply
 *
 * Updates an existing reply's content.
 *
 * @param {string} token
 * @param {string} threadId
 * @param {string} replyId
 * @param {string} content
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function updateReply(token, threadId, replyId, content) {
    try {
        const res = await discussionClient.patch(
            `forum/threads/${threadId}/replies/${replyId}`,
            { content },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { success: true, data: res.data };
    } catch (err) {
        console.log(err.response);
    }
}

/**
 * deleteReply
 *
 * Deletes a reply by ID.
 *
 * @param {string} token
 * @param {string} threadId
 * @param {string} replyId
 * @returns {Promise<{success: boolean, data: any}>}
 */
export async function deleteReply(token, threadId, replyId) {
    try {
        const res = await discussionClient.delete(
            `forum/threads/${threadId}/replies/${replyId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { success: true, data: res.data };
    } catch (err) {
        console.log(err.response);
    }
}