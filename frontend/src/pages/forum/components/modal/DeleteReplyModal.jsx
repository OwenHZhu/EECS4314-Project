/**
 * DeleteReplyModal.jsx
 *
 * Confirmation modal for deleting a reply within a discussion thread.
 * Wraps the generic modal component and provides fixed labels + title.
 *
 * Props:
 * @param {Function} onConfirm - Called when the user confirms deletion.
 * @param {Function} onCancel  - Called when the user cancels the action.
 *
 * Dependencies:
 * - GenericModal: Reusable modal component for confirmations and alerts.
 */

import GenericModal from "../../../../components/generic/GenericModal";

export default function DeleteReplyModal({ onConfirm, onCancel }) {
    return (
        <GenericModal
            title="Delete Reply?"
            message={true}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    );
}