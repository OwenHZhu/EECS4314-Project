/**
 * Reply.jsx
 *
 * Renders a single reply within a threaded discussion. Supports:
 * - Nested replies (recursive rendering)
 * - Inline editing for reply owners
 * - Child reply input when replying to a specific parent
 * - Delete confirmation flow (handled by parent component)
 *
 * Props:
 * @param {object} reply - Reply data (content, user, created_at, children, user_id)
 * @param {number} depth - Nesting level for indentation
 * @param {Function} onReply - Triggered when user clicks "Reply"
 * @param {string|null} activeParentId - ID of the reply currently being replied to
 * @param {Function} handleChildSubmit - Handles submitting a nested reply
 * @param {string} childReply - Controlled input for nested reply text
 * @param {Function} setChildReply - Updates nested reply text
 *
 * @param {string|null} editingReplyId - ID of the reply currently being edited
 * @param {string} editingContent - Controlled input for editing mode
 * @param {Function} setEditingContent - Updates editing input
 * @param {Function} onEditReply - Activates edit mode for a reply
 * @param {Function} onSaveEditReply - Saves edited reply content
 * @param {Function} onDeleteReply - Opens delete confirmation modal
 *
 * Dependencies:
 * - useAuth: Determines reply ownership
 * - Comment: Displays reply content + edit/delete actions
 * - ReplyInputBox: Input for nested replies
 */

import { useAuth } from "../../../../hooks/auth/useAuth.js";
import { format } from "date-fns";
import Comment from "../comments/Comment.jsx";
import ReplyInputBox from "./ReplyInputBox.jsx";

export default function Reply({
    reply,
    depth,
    onReply,
    activeParentId,
    handleChildSubmit,
    childReply,
    setChildReply,
    editingReplyId,
    editingContent,
    setEditingContent,
    onEditReply,
    onSaveEditReply,
    onDeleteReply
}) {
    const { user } = useAuth();

    const safeChildren = Array.isArray(reply.children) ? reply.children : [];
    const isOwner = user && user.id === reply.user_id;
    const isEditing = editingReplyId === reply.id;

    return (
        <div>
            {/* Main reply content */}
            <Comment
                user={reply.user}
                content={reply.content}
                created_at={format(reply.created_at, "MMMM dd, yyyy")}
                depth={depth}
                isOwner={isOwner}
                onReply={() => user && onReply(reply.id)}
                onEdit={() => onEditReply(reply)}
                onDelete={() => onDeleteReply(reply)}
                isEditing={isEditing}
                editingContent={editingContent}
                setEditingContent={setEditingContent}
                onSaveEdit={onSaveEditReply}
            />

            {/* Child reply input (authenticated user) */}
            {user && activeParentId === reply.id && (
                <ReplyInputBox
                    value={childReply}
                    onChange={setChildReply}
                    onSubmit={handleChildSubmit}
                    depth={depth}
                />
            )}

            {/* Child reply input (unauthenticated user) */}
            {!user && activeParentId === reply.id && (
                <p className="ml-12 my-3 text-xs text-[#7E7272]">
                    You must be logged in to reply.
                </p>
            )}

            {/* Render nested replies recursively */}
            {safeChildren.map(child => (
                <Reply
                    key={child.id}
                    reply={child}
                    depth={depth + 1}
                    onReply={onReply}
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
            ))}
        </div>
    );
}