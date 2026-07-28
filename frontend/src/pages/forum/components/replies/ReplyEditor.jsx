/**
 * ReplyEditor.jsx
 *
 * Inline editor for modifying an existing reply. Used when a reply enters
 * "editing mode" inside the threaded discussion UI.
 *
 * Props:
 * @param {string} editingContent - Controlled input value for the reply text.
 * @param {Function} setEditingContent - Updates the editing text.
 * @param {Function} onSave - Handles saving the edited reply (form submit).
 *
 * Dependencies:
 * - GenericInput: Reusable styled input component.
 */

import GenericInput from "../../../../components/generic/GenericInput";

export default function ReplyEditor({
    editingContent,
    setEditingContent,
    onSave
}) {
    return (
        <form onSubmit={onSave}>
            <GenericInput
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                variant="reply"
                className="bg-transparent border py-2 px-3 ml-12 mt-2 w-full text-sm text-[#C6C1B3]"
            />
        </form>
    );
}