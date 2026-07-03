import { useLocation } from "react-router-dom";
import RedirectWithMessage from './RedirectWithMessage.jsx';
import { useAuth } from "../../context/auth/useAuth.js";

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
