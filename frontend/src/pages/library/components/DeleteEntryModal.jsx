import { useLibrary } from "../../../hooks/library/useLibrary";
import GenericModal from "../../../components/generic/GenericModal";

export default function DeleteEntryModal({ libraryEntry, setDeleteModal }) {
    const {deleteLibraryEntry} = useLibrary(); 

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
            onCancel={() => {setDeleteModal(prev => !prev)}}
        >

        </GenericModal>
    );
}