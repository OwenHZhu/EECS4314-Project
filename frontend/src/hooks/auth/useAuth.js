/**
 * ./hooks/auth/useAuth.jsx
 *
 * A convenience hook that provides access to the authentication context.
 * This hook wraps React's `useContext` to simplify retrieving auth-related
 * values and functions throughout the application.
 *
 * Dependencies:
 * - useContext (React): Reads the current value of the AuthContext.
 * - AuthContext: The authentication context object created in AuthContext.jsx.
 *
 * Purpose:
 * - Allows components to easily access authentication state such as:
 *   - isAuthenticated
 *   - user information
 *   - tokens
 *   - redirect messages
 *   - setters for updating auth-related state
 *
 * Notes:
 * - This hook assumes that an AuthProvider is wrapping the component tree.
 * - If used outside of an AuthProvider, the returned value will be `null`.
 */
import { useContext } from "react";
import { AuthContext } from "../../context/auth/AuthContext";

export function useAuth() {
    return useContext(AuthContext);
}