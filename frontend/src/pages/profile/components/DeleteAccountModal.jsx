/**
 * DeleteAccountModal.jsx
 *
 * Confirmation modal for deleting a user account.
 * Handles user confirmation, account deletion, and navigation.
 *
 * Props:
 * @param {function} setShowDelete - State setter used to hide the modal.
 *
 * Dependencies:
 * - useAuth: Provides deleteAccount() for backend account removal.
 * - useNavigate: Redirects user after account deletion.
 * - GenericModal: Reusable confirmation modal component.
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/auth/useAuth";
import GenericModal from "../../../components/generic/GenericModal";

export default function DeleteAccountModal({ setShowDelete }) {
    const navigate = useNavigate(); 
    const { deleteAccount } = useAuth();

    /**
     * handleConfirm()
     *
     * Deletes the user account and redirects to the registration page.
     *
     * @returns {void}
     */
    function handleConfirm() {
        deleteAccount();
        navigate("/register");
    }

    /**
     * handleCancel()
     *
     * Closes the delete confirmation modal.
     *
     * @returns {void}
     */
    function handleCancel() {
        setShowDelete(false);
    }

    return (
        <GenericModal
            title="Delete Account?"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );
}