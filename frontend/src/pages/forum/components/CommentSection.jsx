import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/auth/useAuth.js";
import { getReplies, postReply } from "../../../api/discussion/discussionService.js";
import Reply from "./Reply.jsx";
import GenericInput from "../../../components/generic/GenericInput.jsx";

export default function CommentSection({ thread }) {
    const { token } = useAuth();

    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReply, setNewReply] = useState("");

    const [activeParentId, setActiveParentId] = useState(null);
    const [childReply, setChildReply] = useState("");

    function handleReplyClick(parentId) {
        setActiveParentId(parentId);
        setChildReply("");
    }

    async function handleChildSubmit(e) {
        e.preventDefault();
        if (!childReply.trim()) return;

        try {
            const res = await postReply(token, thread.id, childReply, activeParentId);
            const newReply = res.data;

            // Insert reply into nested structure
            function insertReply(list) {
                return list.map(r => {
                    if (r.id === activeParentId) {
                        return {
                            ...r,
                            children: [...(r.children || []), newReply]
                        };
                    }

                    if (r.children && r.children.length > 0) {
                        return {
                            ...r,
                            children: insertReply(r.children)
                        };
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

    if (loading) {
        return <p className="text-[#888] mt-6">Loading replies...</p>;
    }

    return (
        <div className="mt-10">
            {/* Top-level reply input */}
            <form onSubmit={handleSubmit} className="relative">
                <GenericInput
                    placeholder="Write a reply..."
                    variant="reply"
                    className="bg-transparent border py-2 px-3 w-full text-sm text-[#C6C1B3]"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                />

                {newReply.trim().length > 0 && (
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 
                            bg-[#1E3C36] text-[#C6C1B3] text-xs 
                            px-3 py-1 rounded-full border border-[#2A4A45]
                            hover:bg-[#2A4A45] transition"
                    >
                        Reply
                    </button>
                )}
            </form>

            {/* Replies list */}
            <div className="mt-6">
                {replies.length === 0 ? (
                    <div className="flex flex-col text-center p-4 m-2 border-2 rounded-lg border-[#1E3C36] shadow-md">
                        <p className="text-sm text-[#5A4B4B]">
                            No comments yet. Get the conversation started!
                        </p>
                    </div>
                ) : (
                    replies.map(reply => (
                        <Reply
                            key={reply.id}
                            reply={reply}
                            depth={0}
                            onReply={handleReplyClick}
                            activeParentId={activeParentId}
                            childReply={childReply}
                            setChildReply={setChildReply}
                            handleChildSubmit={handleChildSubmit}
                        />
                    ))
                )}
            </div>
        </div>
    );
}