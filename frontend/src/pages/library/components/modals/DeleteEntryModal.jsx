/**
 * DeleteEntryModal.jsx
 *
 * High-level responsibilities:
 * - Present a confirmation modal for deleting a library entry
 * - Trigger the library deletion action when the user confirms
 * - Close the modal when the user cancels or after deletion completes
 *
 * This component is a thin wrapper around `GenericModal`, providing
 * the correct labels and wiring the delete action from `useLibrary`.
 */

import { useLibrary } from "../../../../hooks/library/useLibrary";
import GenericModal from "../../../../components/generic/GenericModal";

/**
 * DeleteEntryModal
 *
 * @param {object} props
 * @param {object} props.libraryEntry - The library entry to delete
 * @param {function} props.setDeleteModal - State setter controlling modal visibility
 *
 * @returns {JSX.Element} A confirmation modal for deleting a library entry
 */
export default function DeleteEntryModal({ libraryEntry, setDeleteModal }) {
    /**
     * useLibrary
     *
     * Provides library mutation functions, including:
     * - deleteLibraryEntry: removes an entry by its book_id
     */
    const { deleteLibraryEntry } = useLibrary();

    /**
     * handleConfirm
     *
     * Executes the deletion and closes the modal afterward.
     * This function is passed to GenericModal's onConfirm handler.
     */
    async function handleConfirm() {
        await deleteLibraryEntry(libraryEntry.book_id);
        setDeleteModal(false);
    }

    return (
        <GenericModal
            title="Delete from your library?"
            message={false}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={handleConfirm}
            onCancel={() => { setDeleteModal(prev => !prev); }}
        >
        </GenericModal>
    );
}