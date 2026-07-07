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
 * Props:
 * @param {Function} setEditPicture - Setter used to toggle the modal's visibility.
 */

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
            <button
                className="text-sm text-tertiary py-3 px-8 mx-3 my-2 border-b-2 hover:text-primary border-background"
            >
                Upload Photo
            </button>

            {/* TODO: Connect this to a remove photo backend handler */}
            <button
                className="text-sm text-tertiary py-3 px-8 mx-3 my-2 border-b-2 hover:text-primary border-background"
            >
                Remove Current Photo
            </button>

            <button
                onClick={closeModal}
                className="text-sm text-tertiary py-3 px-8 mx-3 my-2 hover:text-primary"
            >
                Cancel
            </button>
        </div>
    );
}