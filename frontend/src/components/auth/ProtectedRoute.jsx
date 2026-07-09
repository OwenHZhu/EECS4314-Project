/**
 * ./components/auth/ProtectedRoute.jsx
 *
 * A wrapper component that restricts access to its child components
 * based on the user's authentication status. If the user is not
 * authenticated, they are redirected to a page that displays a message
 * explaining that login is required.
 *
 * Dependencies:
 * - useLocation (react-router-dom): Retrieves the current URL path so
 *   the component can display which page requires authentication.
 * - RedirectWithMessage: A custom component that handles redirecting
 *   the user while showing a helpful message.
 * - useAuth: Custom authentication hook providing `isAuthenticated`,
 *   which indicates whether the user is logged in.
 *
 * Props:
 * @param {React.ReactNode} children - The protected content that should
 * be rendered only when the user is authenticated.
 */

import { useLocation } from "react-router-dom";
import RedirectWithMessage from './RedirectWithMessage.jsx';
import { useAuth } from "../../context/auth/useAuth.js";

export default function ProtectedRoute({ children }) {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    // If the user is not authenticated, redirect them with a helpful message.
    if (!isAuthenticated) {
        const path = location.pathname;
        const pageName = path.replace("/", "");
        return (
            <RedirectWithMessage message={`You must be logged in to access ${pageName}.`} />
        );
    }

    // Otherwise, render the protected content.
    return children;
}