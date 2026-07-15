/**
 * ./hooks/auth/useAuth.jsx
 *
 * Provides convenient access to the AuthContext.
 *
 * Dependencies:
 * - useContext: Reads the current AuthContext value.
 * - AuthContext: Supplies authentication state and actions.
 *
 */

import { useContext } from "react";
import { AuthContext } from "../../context/auth/AuthContext";

export function useAuth() {
    return useContext(AuthContext);
}