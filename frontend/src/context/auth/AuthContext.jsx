/**
 * ./contexts/auth/AuthContext.jsx
 *
 * A React context used to store and provide authentication-related state
 * throughout the application. Components can access this context via the
 * `useAuth` custom hook, which exposes values such as:
 *
 * - isAuthenticated: Whether the user is logged in
 * - user: The current user's data (when available)
 * - tokens: Authentication tokens (if applicable)
 * - redirectMessage: Temporary message used when redirecting unauthenticated users
 * - setRedirectMessage: Setter for updating redirect messages
 *
 * Purpose:
 * - Centralizes authentication state so it can be shared across the app
 *   without prop drilling.
 * - Enables protected routes, login flows, logout flows, and user-specific UI.
 *
 * Dependencies:
 * - createContext (React): Used to create the context object.
 *
 * Notes:
 * - The default value is `null` because the actual context values are provided
 *   by the AuthProvider component.
 * - This file only defines the context; it does not contain any logic.
 */
import { createContext } from "react";

export const AuthContext = createContext(null);