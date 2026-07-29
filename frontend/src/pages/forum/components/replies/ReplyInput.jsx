/**
 * ReplyInput.jsx
 *
 * Input box for creating a new top‑level reply. Appears at the top of the
 * comment section when the user is authenticated.
 *
 * Features:
 * - Controlled input for reply text
 * - Submit button that appears only when text is non‑empty
 *
 * Props:
 * @param {string} value - Current reply text.
 * @param {Function} onChange - Updates reply text.
 * @param {Function} onSubmit - Handles reply submission (form submit).
 *
 * Dependencies:
 * - GenericInput: Styled input component for consistent UI.
 */

import GenericInput from "../../../../components/generic/GenericInput";

export default function ReplyInput({
    value,
    onChange,
    onSubmit
}) {
    return (
        <form onSubmit={onSubmit} className="relative">
            <GenericInput
                placeholder="Write a reply..."
                variant="reply"
                className="bg-transparent border py-2 px-3 w-full text-sm text-[#C6C1B3]"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />

            {value.trim().length > 0 && (
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
    );
}