/**
 * useAuth.js
 *
 * Custom hook for accessing authentication state and actions
 * from AuthContext.
 *
 * Dependencies:
 * - AuthContext: Provides user, token, and auth-related functions.
 */

import { useContext } from "react";
import { AuthContext } from "../../context/auth/AuthContext";

/**
 * useAuth
 * Returns the current authentication context value.
 * @returns {object|null} Auth context value.
 */
export function useAuth() {
    return useContext(AuthContext);
}