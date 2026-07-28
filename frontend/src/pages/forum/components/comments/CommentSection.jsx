/**
 * CommentSection.jsx
 *
 * Handles all reply-related functionality for a discussion thread, including:
 * - Fetching nested replies
 * - Creating new top-level replies
 * - Creating child replies (threaded)
 * - Editing existing replies
 * - Deleting replies with confirmation modal
 *
 * Props:
 * @param {object} thread - The active discussion thread (id, title, etc.)
 *
 * Dependencies:
 * - useAuth: Provides authenticated user + token
 * - discussionService: Reply CRUD operations (getReplies, postReply, updateReply, deleteReply)
 * - ReplyList: Renders nested replies recursively
 * - ReplyInput: Controlled input for new replies
 * - DeleteReplyModal: Confirmation modal for deleting replies
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../hooks/auth/useAuth.js";
import {
    getReplies,
    postReply,
    updateReply,
    deleteReply
} from "../../../../api/discussion/discussionService.js";

import ReplyList from "../replies/ReplyList.jsx";
import ReplyInput from "../replies/ReplyInput.jsx";
import DeleteReplyModal from "../modal/DeleteReplyModal.jsx";

/**
 * CommentSection
 *
 * Manages reply loading, creation, editing, deletion, and nested threading.
 *
 * @param {object} props
 * @param {object} props.thread
 * @returns {JSX.Element}
 */
export default function CommentSection({ thread }) {
    const { user, token } = useAuth();

    // Loaded replies
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);

    // New top-level reply
    const [newReply, setNewReply] = useState("");

    // Child reply (nested)
    const [childReply, setChildReply] = useState("");
    const [activeParentId, setActiveParentId] = useState(null);

    // Editing state
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editingContent, setEditingContent] = useState("");

    // Delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    /**
     * Load all replies for the thread (nested structure).
     */
    useEffect(() => {
        async function loadReplies() {
            try {
                const res = await getReplies(thread.id, true);
                setReplies(res.data);
            } catch (err) {
                console.error("Failed to load replies:", err);
            } finally {
                setLoading(false);
            }
        }
        loadReplies();
    }, [thread.id]);

    /**
     * Submit a new top-level reply.
     *
     * @param {Event} e
     */
    async function handleSubmit(e) {
        e.preventDefault();
        if (!newReply.trim()) return;

        try {
            const res = await postReply(token, thread.id, newReply, null);
            setReplies(prev => [...prev, res.data]);
            setNewReply("");
        } catch (err) {
            console.error("Failed to create reply:", err);
        }
    }

    /**
     * Submit a nested (child) reply.
     *
     * @param {Event} e
     */
    async function handleChildSubmit(e) {
        e.preventDefault();
        if (!childReply.trim()) return;

        try {
            const res = await postReply(token, thread.id, childReply, activeParentId);
            const newReplyObj = res.data;

            // Insert reply into nested tree
            function insertReply(list) {
                return list.map(r => {
                    if (r.id === activeParentId) {
                        return {
                            ...r,
                            children: [...(r.children || []), newReplyObj]
                        };
                    }
                    if (r.children) {
                        return { ...r, children: insertReply(r.children) };
                    }
                    return r;
                });
            }

            setReplies(prev => insertReply(prev));
            setChildReply("");
            setActiveParentId(null);
        } catch (err) {
            console.error("Failed to create child reply:", err);
        }
    }

    /**
     * Activate child reply input for a specific parent.
     *
     * @param {string} parentId
     */
    function handleReplyClick(parentId) {
        if (!user) return;
        setActiveParentId(parentId);
        setChildReply("");
    }

    /**
     * Begin editing an existing reply.
     *
     * @param {object} reply
     */
    function onEditReply(reply) {
        setEditingReplyId(reply.id);
        setEditingContent(reply.content);
    }

    /**
     * Save edited reply content.
     *
     * @param {Event} e
     */
    async function onSaveEditReply(e) {
        e.preventDefault();

        try {
            await updateReply(token, thread.id, editingReplyId, editingContent);

            // Update nested tree
            function updateTree(list) {
                return list.map(r => {
                    if (r.id === editingReplyId) {
                        return { ...r, content: editingContent };
                    }
                    if (r.children) {
                        return { ...r, children: updateTree(r.children) };
                    }
                    return r;
                });
            }

            setReplies(prev => updateTree(prev));
            setEditingReplyId(null);
        } catch (err) {
            console.error("Failed to update reply:", err);
        }
    }

    /**
     * Trigger delete confirmation modal.
     *
     * @param {object} reply
     */
    function onDeleteReply(reply) {
        setEditingReplyId(reply.id);
        setShowDeleteModal(true);
    }

    /**
     * Confirm deletion and remove reply from nested tree.
     */
    async function confirmDeleteReply() {
        try {
            await deleteReply(token, thread.id, editingReplyId);

            function removeFromTree(list) {
                return list
                    .filter(r => r.id !== editingReplyId)
                    .map(r => ({
                        ...r,
                        children: r.children ? removeFromTree(r.children) : []
                    }));
            }

            setReplies(prev => removeFromTree(prev));
            setShowDeleteModal(false);
            setEditingReplyId(null);
        } catch (err) {
            console.error("Failed to delete reply:", err);
        }
    }

    if (loading) {
        return <p className="text-[#888] mt-6">Loading replies...</p>;
    }

    return (
        <div className="mt-10">

            {/* Top-level reply input OR login prompt */}
            {user ? (
                <ReplyInput
                    value={newReply}
                    onChange={setNewReply}
                    onSubmit={handleSubmit}
                />
            ) : (
                <div className="text-sm text-[#7E7272] border border-[#2A4A45] rounded-lg p-4 text-center">
                    Login or Register to post a reply:
                    <div className="flex justify-center gap-4 mt-3">
                        <Link to="/login" className="text-primary hover:underline">
                            Login
                        </Link>
                        <Link to="/register" className="text-primary hover:underline">
                            Register
                        </Link>
                    </div>
                </div>
            )}

            {/* Replies list */}
            <div className="mt-6">
                <ReplyList
                    replies={replies}
                    onReply={handleReplyClick}
                    activeParentId={activeParentId}
                    handleChildSubmit={handleChildSubmit}
                    childReply={childReply}
                    setChildReply={setChildReply}
                    editingReplyId={editingReplyId}
                    editingContent={editingContent}
                    setEditingContent={setEditingContent}
                    onEditReply={onEditReply}
                    onSaveEditReply={onSaveEditReply}
                    onDeleteReply={onDeleteReply}
                />
            </div>

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <DeleteReplyModal
                    onConfirm={confirmDeleteReply}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
}