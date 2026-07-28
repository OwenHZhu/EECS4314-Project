import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../hooks/auth/useAuth.js";
import {
    getReplies,
    postReply,
    updateReply,
    deleteReply
} from "../../../../api/discussion/discussionService.js";

import { getUser } from "../../../../api/auth/authService.js";

import ReplyList from "../replies/ReplyList.jsx";
import ReplyInput from "../replies/ReplyInput.jsx";
import DeleteReplyModal from "../modal/DeleteReplyModal.jsx";

export default function CommentSection({ thread }) {
    const { user, token } = useAuth();

    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newReply, setNewReply] = useState("");
    const [childReply, setChildReply] = useState("");
    const [activeParentId, setActiveParentId] = useState(null);

    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editingContent, setEditingContent] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Cache user lookups to avoid duplicate requests
    const [userCache, setUserCache] = useState({});

    /**
     * Resolve user_id → user object
     */
    async function resolveUser(userId) {
        if (userCache[userId]) return userCache[userId];

        const res = await getUser(userId);
        if (res?.success) {
            const updatedCache = { ...userCache, [userId]: res.data };
            setUserCache(updatedCache);
            return res.data;
        }

        return null;
    }

    /**
     * Recursively attach user objects to replies
     */
    async function attachUsersToReplies(list) {
        const resolved = [];

        for (const reply of list) {
            const author = await resolveUser(reply.user_id);

            const newReply = {
                ...reply,
                user: author
            };

            if (reply.children && reply.children.length > 0) {
                newReply.children = await attachUsersToReplies(reply.children);
            }

            resolved.push(newReply);
        }

        return resolved;
    }

    /**
     * Load all replies for the thread (nested structure).
     */
    useEffect(() => {
        async function loadReplies() {
            try {
                const res = await getReplies(thread.id, true);
                const rawReplies = res.data || [];

                const resolvedReplies = await attachUsersToReplies(rawReplies);
                setReplies(resolvedReplies);
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
     */
    async function handleSubmit(e) {
        e.preventDefault();
        if (!newReply.trim()) return;

        try {
            const res = await postReply(token, thread.id, newReply, null);
            const author = await resolveUser(res.data.user_id);

            setReplies(prev => [
                ...prev,
                { ...res.data, user: author, children: [] }
            ]);

            setNewReply("");
        } catch (err) {
            console.error("Failed to create reply:", err);
        }
    }

    /**
     * Submit a nested (child) reply.
     */
    async function handleChildSubmit(e) {
        e.preventDefault();
        if (!childReply.trim()) return;

        try {
            const res = await postReply(token, thread.id, childReply, activeParentId);
            const author = await resolveUser(res.data.user_id);
            const newReplyObj = { ...res.data, user: author, children: [] };

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

    function handleReplyClick(parentId) {
        if (!user) return;
        setActiveParentId(parentId);
        setChildReply("");
    }

    function onEditReply(reply) {
        setEditingReplyId(reply.id);
        setEditingContent(reply.content);
    }

    async function onSaveEditReply(e) {
        e.preventDefault();

        try {
            await updateReply(token, thread.id, editingReplyId, editingContent);

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

    function onDeleteReply(reply) {
        setEditingReplyId(reply.id);
        setShowDeleteModal(true);
    }

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

            {showDeleteModal && (
                <DeleteReplyModal
                    onConfirm={confirmDeleteReply}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
}