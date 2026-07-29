/**
 * DiscardChangesModal.jsx
 *
 * Confirmation modal for discarding unsaved profile edits.
 * Handles user confirmation and closing the modal.
 *
 * Props:
 * @param {function} setDiscardChanges - State setter used to hide the modal.
 *
 * Dependencies:
 * - useNavigate: Redirects user back to the profile page.
 * - GenericModal: Reusable confirmation modal component.
 */

import { useNavigate } from "react-router-dom";
import GenericModal from "../../../../components/generic/GenericModal";

export default function DeleteAccountModal({ setDiscardChanges }) {
    const navigate = useNavigate();

    /**
     * handleConfirm()
     *
     * Confirms discarding changes and navigates back to the profile page.
     *
     * @returns {void}
     */
    function handleConfirm() {
        navigate("/profile");
    }

    /**
     * handleCancel()
     *
     * Closes the discard confirmation modal.
     *
     * @returns {void}
     */
    function handleCancel() {
        setDiscardChanges(false); 
    }

    return (
        <GenericModal
            title="Discard changes?"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );
}