/**
 * ReplyList.jsx
 *
 * Renders the top‑level list of replies for a discussion thread.
 * Delegates all reply behavior (editing, deleting, nesting, child replies)
 * to the `Reply` component, which handles recursion internally.
 *
 * Props:
 * @param {Array<object>} replies - Array of top‑level reply objects.
 * @param {Function} onReply - Triggered when a user clicks "Reply" on any item.
 * @param {string|null} activeParentId - ID of the reply currently being replied to.
 * @param {Function} handleChildSubmit - Handles submitting a nested reply.
 * @param {string} childReply - Controlled input for nested reply text.
 * @param {Function} setChildReply - Updates nested reply text.
 *
 * @param {string|null} editingReplyId - ID of the reply currently being edited.
 * @param {string} editingContent - Controlled input for editing mode.
 * @param {Function} setEditingContent - Updates editing input.
 * @param {Function} onEditReply - Activates edit mode for a reply.
 * @param {Function} onSaveEditReply - Saves edited reply content.
 * @param {Function} onDeleteReply - Opens delete confirmation modal.
 *
 * Dependencies:
 * - Reply: Recursive reply component that renders nested replies.
 */

import Reply from "./Reply.jsx";

export default function ReplyList({
    replies,
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
    return (
        <>
            {replies.map(reply => (
                <Reply
                    key={reply.id}
                    reply={reply}
                    depth={0}
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
        </>
    );
}