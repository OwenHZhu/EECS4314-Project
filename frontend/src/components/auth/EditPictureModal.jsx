/**
 * ./components/auth/EditPictureModal.jsx
 *
 * A modal that allows the user to update their profile picture.
 * Provides three actions:
 *  - Upload a new photo (not yet implemented)
 *  - Remove the current photo (not yet implemented)
 *  - Cancel and close the modal
 *
 * The modal's visibility is controlled externally through the
 * `setEditPicture` state setter passed in as a prop.
 * 
 * Dependencies: 
 * - GenericButton: Reusable button component used for the modal's actions.
 *
 * Props:
 * @param {Function} setEditPicture - Setter used to toggle the modal's visibility.
 */
import GenericButton from "../generic/GenericButton";

export default function EditPictureModal({ setEditPicture }) {
    /**
     * Closes the modal by disabling the edit-picture state.
    */
    function closeModal() {
        setEditPicture(false);
    }

    return (
        <div className="flex flex-col font-bold items-center bg-card-fill border-card-stroke rounded-md border-2 p-4 max-w-fit">
            <h1 className="text-lg text-primary mb-3">Change Profile Photo</h1>

            {/* TODO: Connect this to a file upload handler */}
            <GenericButton
                variant="ghost"
                size="md"
                className="py-2 md:py-3 px-6 md:px-8 rounded-full"
            >
                Upload Photo
            </GenericButton>

            {/* TODO: Connect this to a remove photo backend handler */}
            <GenericButton
                variant="ghost"
                size="md"
                className="py-2 my-2 md:py-3 px-6 md:px-8 rounded-full"
            >
                Remove Photo
            </GenericButton>

            <GenericButton
                onClick={closeModal}
                variant="ghost"
                size="md"
                className="py-2 md:py-3 px-6 md:px-8 rounded-full"
            >
                Cancel
            </GenericButton>
        </div>
    );
}