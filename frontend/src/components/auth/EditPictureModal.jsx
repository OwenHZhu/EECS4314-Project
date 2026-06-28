export default function LogoutModal({ setEditPicture }) {
    function closeModal() {
        setEditPicture(false);
    }

    return (
        <div className="flex flex-col font-bold items-center bg-card-fill border-card-stroke rounded-md border-2 p-4 max-w-fit">
            <h1 className="text-lg text-primary mb-3">Change Profile Photo</h1>
            <button
                className="text-sm text-tertiary py-3 px-8 mx-3 my-2 border-b-2 hover:text-primary border-background"
            >
                Upload Photo
            </button>
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