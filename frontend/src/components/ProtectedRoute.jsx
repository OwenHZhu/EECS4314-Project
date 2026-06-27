import { useLocation } from "react-router-dom";
import RedirectWithMessage from "./RedirectWithMessage";
import { useAuth } from "../context/auth/useAuth";

export default function ProtectedRoute({ children }) {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        const path = location.pathname;
        const pageName = path.replace("/", "");
        return (
            <RedirectWithMessage message={`You must be logged in to access ${pageName}.`} />
        );
    }

    return children;
}
