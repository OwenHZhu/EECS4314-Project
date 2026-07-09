/**
 * ./components/auth/RedirectWithMessage.jsx
 *
 * A helper component that redirects the user to the login page while
 * storing a temporary message in the authentication context. This is
 * used by protected routes to explain why the user was redirected
 * (e.g., "You must be logged in to access X").
 *
 * Dependencies:
 * - useEffect (React): Runs a side effect to store the redirect message
 *   when the component mounts or when the message changes.
 * - Navigate (react-router-dom): Performs the actual redirect to the
 *   login page.
 * - useAuth: Custom authentication hook providing `setRedirectMessage`,
 *   which stores a message that can be displayed on the login page.
 *
 * Props:
 * @param {string} message - The message explaining the reason for the redirect.
 */

import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth";

export default function RedirectWithMessage({ message }) {
    const { setRedirectMessage } = useAuth();

    // Store the redirect message in global auth context.
    useEffect(() => {
        setRedirectMessage(message);
    }, [message, setRedirectMessage]);

    // Redirect the user to the login page.
    return <Navigate to="/login" replace />;
}