/**
 * ReplyInputBox.jsx
 *
 * Input box for creating a nested (child) reply inside a threaded discussion.
 * Indents automatically based on reply depth and displays a compact inline
 * "Reply" button when text is present.
 *
 * Props:
 * @param {string} value - Current child reply text.
 * @param {Function} onChange - Updates the child reply text.
 * @param {Function} onSubmit - Handles submitting the nested reply.
 * @param {number} depth - Nesting level used to calculate indentation.
 *
 * Dependencies:
 * - GenericInput: Styled input component used across reply UI.
 */

import GenericInput from "../../../../components/generic/GenericInput.jsx";

export default function ReplyInputBox({
    value,
    onChange,
    onSubmit,
    depth
}) {
    const indent = depth * 32 + 48;

    return (
        <form
            onSubmit={onSubmit}
            style={{ marginLeft: indent }}
            className="mt-3"
        >
            <div className="relative w-full">
                <GenericInput
                    placeholder="Write a reply..."
                    variant="reply"
                    className="bg-transparent border py-2 px-3 pr-16 w-full text-sm text-[#C6C1B3]"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />

                {value.trim().length > 0 && (
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2
                            bg-[#1E3C36] text-[#C6C1B3] text-xs
                            px-3 py-1 rounded-full border border-[#2A4A45]
                            hover:bg-[#2A4A45] transition"
                    >
                        Reply
                    </button>
                )}
            </div>
        </form>
    );
}