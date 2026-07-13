/**
 * ./hooks/auth/useAuth.jsx
 *
 * Provides convenient access to the AuthContext.
 *
 * Dependencies:
 * - useContext: Reads the current AuthContext value.
 * - AuthContext: Supplies authentication state and actions.
 *
 * Purpose:
 * - Allows components to access auth data and functions such as:
 *   isAuthenticated, user info, tokens, redirect messages, and setters.
 *
 * Notes:
 * - Must be used within an AuthProvider; otherwise returns null.
 */

import { useContext } from "react";
import { AuthContext } from "../../context/auth/AuthContext";

export function useAuth() {
    return useContext(AuthContext);
}