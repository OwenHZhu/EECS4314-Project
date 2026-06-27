import { useAuth } from "../context/auth/useAuth";
import { useNavigate } from "react-router-dom";

export default function LogoutModal({ setShowLogout }) {
    const navigate = useNavigate();
    const { logout } = useAuth();

    function closeModal() {
        setShowLogout(false);
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="flex flex-col font-bold items-center bg-card-fill border-card-stroke rounded-md border-2 p-4 max-w-fit">
            <h1 className="text-lg text-primary mb-3">Logout?</h1>
            <div className="flex flex-row">
                <button
                    onClick={handleLogout}
                    className="bg-secondary text-sm py-3 px-8 rounded-full mx-3 my-2 hover:bg-logout-hover transition-colors"
                >
                    Logout
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