/**
 * AuthContext.jsx
 *
 * React context for authentication state and actions.
 * Default value: null (no authenticated session).
 */

import { createContext } from "react";

/**
 * AuthContext
 * Holds user, token, and auth-related actions provided by AuthProvider.
 */
export const AuthContext = createContext(null);