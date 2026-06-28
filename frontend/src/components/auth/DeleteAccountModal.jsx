import { useNavigate } from "react-router-dom";

export default function DeleteAccountModal({ setShowDelete }) {
    const navigate = useNavigate();
    //const { delete } = useAuth();

    function closeModal() {
        setShowDelete(false);
    }

    function handleDelete() {
        //delete();
        navigate("/register");
    }

    return (
        <div className="flex flex-col font-bold items-center bg-card-fill border-card-stroke rounded-md border-2 p-4 max-w-fit">
            <h1 className="text-lg text-primary mb-3">Delete Account?</h1>
            <div className="flex flex-row">
                <button
                    onClick={handleDelete}
                    className="bg-secondary text-sm py-3 px-8 rounded-full mx-3 my-2 hover:bg-logout-hover transition-colors"
                >
                    Confirm
                </button>
                <button
                    onClick={closeModal}
                    className="py-3 px-8 text-sm rounded-full mx-3 my-2 border-cancel-stroke border-2 hover:border-tertiary transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}