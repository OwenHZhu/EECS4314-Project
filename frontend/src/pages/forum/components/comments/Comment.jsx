/**
 * Comment.jsx
 *
 * Renders a single comment within a discussion thread. Supports:
 * - Nested replies (via `depth`)
 * - Inline editing for comment owners
 * - Reply, edit, and delete actions
 *
 * Props:
 * @param {object} user - Author of the comment.
 * @param {string} created_at - Timestamp of when the comment was posted.
 * @param {string} content - Comment text.
 * @param {number} [depth=0] - Nesting level for threaded replies.
 * @param {boolean} isOwner - Whether the current user owns this comment.
 * @param {Function} onReply - Triggered when the reply button is clicked.
 * @param {Function} onEdit - Triggered when the edit icon is clicked.
 * @param {Function} onDelete - Triggered when the delete icon is clicked.
 * @param {boolean} isEditing - Whether the comment is currently being edited.
 * @param {string} editingContent - Controlled input for editing mode.
 * @param {Function} setEditingContent - Updates the editing input.
 * @param {Function} onSaveEdit - Handles saving the edited comment.
 *
 * Dependencies:
 * - Icon: Generic icon component for avatars and action icons.
 */

import { useState, useEffect } from "react";
import Icon from "../../../../components/generic/Icon.jsx";
import { getProfilePictureUrl } from "../../../../utils/getProfilePictureUrl.js";

export default function Comment({
    user,
    created_at,
    content,
    depth = 0,
    isOwner,
    onReply,
    onEdit,
    onDelete,
    isEditing,
    editingContent,
    setEditingContent,
    onSaveEdit
}) {
    const [profilePictureUrl, setProfilePictureUrl] = useState(null);

    useEffect(() => {
        async function loadPic() {
            if (!user?.profile_picture) {
                setProfilePictureUrl(null);
                return;
            }

            const url = await getProfilePictureUrl(user.profile_picture);
            setProfilePictureUrl(url);
        }

        loadPic();
    }, [user?.profile_picture]);

    return (
        <div
            className="mb-6"
            style={{ marginLeft: depth * 32 }}
        >
            {/* User information */}
            <div className="flex flex-row items-center">
                {profilePictureUrl ? (
                    <img
                        src={profilePictureUrl}
                        alt={`${user?.username}'s profile`}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <Icon className="text-[#923F3F] text-4xl">account_circle</Icon>
                )}

                <div className="ml-2 mt-1">
                    <h4 className="text-sm text-[#998888]">
                        {user?.username || "Unknown User"}
                    </h4>
                    <p className="text-xs text-[#5A4B4B]">{created_at}</p>
                </div>
            </div>

            {/* Comment content OR inline edit input */}
            {isEditing ? (
                <form onSubmit={onSaveEdit}>
                    <input
                        type="text"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="text-sm text-[#C6C1B3] ml-12 mt-2 bg-transparent border border-[#2A4A45] px-3 py-2 w-full rounded-lg"
                    />
                </form>
            ) : (
                <p className="text-sm text-[#C6C1B3] ml-12 mt-2">
                    {content}
                </p>
            )}

            {/* Reply and Edit/Delete row */}
            <div className="ml-12 mt-3 flex items-center justify-between">
                <button
                    onClick={onReply}
                    className="flex items-center gap-1 text-xs text-[#7E7272] hover:text-[#C6C1B3] transition"
                >
                    <Icon className="text-sm">mode_comment</Icon>
                    Reply
                </button>

                {isOwner && (
                    <div className="flex gap-3 items-center">
                        <Icon
                            className="text-[#3A2A2A] text-sm cursor-pointer"
                            onClick={onEdit}
                        >
                            edit
                        </Icon>

                        <Icon
                            className="text-[#3A2A2A] text-sm cursor-pointer"
                            onClick={onDelete}
                        >
                            delete
                        </Icon>
                    </div>
                )}
            </div>
        </div>
    );
}