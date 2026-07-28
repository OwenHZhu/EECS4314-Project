/**
 * PostContent.jsx
 *
 * Displays the main body of a discussion thread, supporting:
 * - Normal content display (with optional spoiler blurring)
 * - Inline editing mode for the thread owner
 * - Edit + delete actions
 *
 * Props:
 * @param {object} thread - Thread metadata (content, has_spoilers, user_id, etc.)
 * @param {object|null} user - Currently authenticated user
 * @param {boolean} isEditing - Whether the thread is being edited
 * @param {Function} setIsEditing - Toggles edit mode
 *
 * @param {string} editTitle - Controlled input for editing the thread title
 * @param {string} editContent - Controlled input for editing the thread content
 * @param {boolean} editSpoilers - Controlled checkbox for spoiler flag
 * @param {Function} setEditTitle
 * @param {Function} setEditContent
 * @param {Function} setEditSpoilers
 *
 * @param {Function} onSaveEdit - Saves edited thread data
 * @param {Function} onDelete - Deletes the thread
 *
 * @param {boolean} showSpoilers - Whether spoilers are currently visible
 *
 * Dependencies:
 * - GenericButton: Action buttons for saving/canceling edits
 * - Icon: Edit/delete icons
 */

import GenericButton from "../../../../components/generic/GenericButton.jsx";
import Icon from "../../../../components/generic/Icon.jsx";

export default function PostContent({
    thread,
    user,
    isEditing,
    setIsEditing,
    editTitle,
    editContent,
    editSpoilers,
    setEditTitle,
    setEditContent,
    setEditSpoilers,
    onSaveEdit,
    onDelete,
    showSpoilers
}) {
    return (
        <div className="relative bg-[#170E0F/65] border border-[#3a3d3e] w-full h-fit rounded-lg mt-5">

            {/* EDIT MODE */}
            {isEditing ? (
                <div className="p-5 flex flex-col gap-4">
                    {/* Title input */}
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-transparent border border-[#727C7E] rounded-lg px-3 py-2 text-sm text-[#C6C1B3]"
                    />

                    {/* Content input */}
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-transparent border border-[#727C7E] rounded-lg px-3 py-2 text-sm text-[#C6C1B3] h-40"
                    />

                    {/* Spoiler checkbox */}
                    <label className="flex items-center gap-2 text-sm text-[#C6C1B3]">
                        <input
                            type="checkbox"
                            checked={editSpoilers}
                            onChange={() => setEditSpoilers(prev => !prev)}
                        />
                        Contains spoilers
                    </label>

                    {/* Save / Cancel buttons */}
                    <div className="flex gap-3">
                        <GenericButton
                            variant="secondary"
                            className="px-4 py-2 text-sm"
                            onClick={onSaveEdit}
                        >
                            Save Changes
                        </GenericButton>

                        <GenericButton
                            variant="ghost"
                            className="px-4 py-2 text-sm"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </GenericButton>
                    </div>
                </div>
            ) : (
                <p
                    className={`text-[#C6C1B3] text-[14px] p-5 ${
                        thread.has_spoilers &&
                        user &&
                        user.id !== thread.user_id &&
                        !showSpoilers
                            ? "blur-sm"
                            : ""
                    }`}
                >
                    {thread.content}
                </p>
            )}

            {/* Edit/Delete icons (thread owner only) */}
            {user && user.id === thread.user_id && !isEditing && (
                <div className="absolute bottom-3 right-3 bg-transparent backdrop-blur-sm 
                border border-[#727C7E] rounded-full px-3 py-1 flex gap-3 items-center">
                    <Icon
                        className="text-[#3A2A2A] text-sm cursor-pointer"
                        onClick={() => setIsEditing(true)}
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
    );
}