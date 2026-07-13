import { useAuth } from "../../hooks/auth/useAuth.js";
import AuthRequiredModal from "./AuthRequiredModal.jsx";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <>
                {/* Blur the background */}
                <div className="fixed inset-0 backdrop-blur-sm bg-black/40 z-40" />

                {/* Modal asking user to log in */}
                <AuthRequiredModal />
            </>
        );
    }

    return children;
}