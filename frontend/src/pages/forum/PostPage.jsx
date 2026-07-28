/**
 * PostPage.jsx
 *
 * Full thread view page. Handles:
 * - Loading thread and book metadata
 * - Spoiler‑controlled content display
 * - Editing thread title/content/spoiler flag (owner only)
 * - Deleting a thread with confirmation modal
 * - Rendering comments + nested replies
 *
 * Dependencies:
 * - useAuth: Provides authenticated user + token
 * - getThreadById / updateThread / deleteThread: Thread CRUD operations
 * - getBookById: Fetches book metadata
 * - PostHeader: Book and thread header section
 * - PostContent: Thread body and edit/delete controls
 * - CommentSection: Reply tree and reply creation
 * - GenericModal: Confirmation modal for deletion
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth.js";
import {
    getThreadById,
    updateThread,
    deleteThread
} from "../../api/discussion/discussionService.js";
import { getBookById } from "../../api/books/bookService.js";
import { getUser } from "../../api/auth/authService.js";

import GenericModal from "../../components/generic/GenericModal.jsx";
import CommentSection from "./components/comments/CommentSection.jsx";
import PostHeader from "./components/posts/PostHeader.jsx";
import PostContent from "./components/posts/PostContent.jsx";

export default function PostPage() {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const { threadId } = useParams();

    const [thread, setThread] = useState(null);
    const [book, setBook] = useState(null);
    const [author, setAuthor] = useState(null);

    const [showSpoilers, setShowSpoilers] = useState(false);

    // Editing state
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editSpoilers, setEditSpoilers] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    /**
     * Load thread metadata.
     */
    useEffect(() => {
        async function loadThread() {
            const threadRes = await getThreadById(threadId);
            setThread(threadRes.data);

            // Pre-fill editing fields
            setEditTitle(threadRes.data.title);
            setEditContent(threadRes.data.content);
            setEditSpoilers(threadRes.data.has_spoilers);
        }
        loadThread();
    }, [threadId]);

    /**
     * Load book metadata once thread is available.
     */
    useEffect(() => {
        if (!thread) return;

        async function loadBook() {
            const bookRes = await getBookById(thread.book_id);
            setBook(bookRes);
        }

        loadBook();
    }, [thread]);

    /**
     * Load thread author once thread is available.
     */
    useEffect(() => {
        if (!thread) return;

        async function loadAuthor() {
            const res = await getUser(thread.user_id);
            if (res?.success) {
                setAuthor(res.data);
            }
        }

        loadAuthor();
    }, [thread]);

    /**
     * Save edited thread content.
     */
    async function handleSaveEdit() {
        const res = await updateThread(
            token,
            threadId,
            editTitle,
            editContent,
            editSpoilers
        );

        setThread(res.data);
        setIsEditing(false);
    }

    /**
     * Delete thread and redirect.
     */
    async function handleDelete() {
        await deleteThread(token, threadId);
        navigate("/forums");
    }

    if (!thread || !book || !author) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12">
                <p className="text-center text-[#888]">Loading post...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <p className="text-sm text-[#7E7272] mb-2">COMMUNITY</p>

            <PostHeader
                book={book}
                thread={thread}
                author={author}
                user={user}
                showSpoilers={showSpoilers}
                setShowSpoilers={setShowSpoilers}
            />

            {/* Tags */}
            {thread.tags && thread.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                    {thread.tags.map(tag => (
                        <span
                            key={tag.id}
                            className="px-3 py-1 rounded-full text-xs bg-[#2A4A45] text-[#C6C1B3] border border-[#3A4A45]"
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            )}

            <PostContent
                thread={thread}
                user={user}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editTitle={editTitle}
                editContent={editContent}
                editSpoilers={editSpoilers}
                setEditTitle={setEditTitle}
                setEditContent={setEditContent}
                setEditSpoilers={setEditSpoilers}
                onSaveEdit={handleSaveEdit}
                onDelete={() => setShowDeleteModal(true)}
                showSpoilers={showSpoilers}
            />

            <CommentSection thread={thread} />

            {showDeleteModal && (
                <GenericModal
                    title="Delete Discussion?"
                    message={true}
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
}