/**
 * ./context/auth/AuthProvider.jsx
 *
 * The main authentication provider for the application. This component wraps
 * the React tree and exposes authentication-related state and functions through
 * the AuthContext. It manages login, logout, registration, token persistence,
 * session restoration, and redirect messages.
 *
 * Dependencies:
 * - axios: Used for all HTTP requests to the backend authentication API.
 * - useState, useEffect, useCallback (React): Manage local state, side effects,
 *   and callback functions.
 * - AuthContext: Provides the authentication context to child components.
 * - useLocalStorage: Custom hook that syncs state with localStorage, ensuring
 *   user and token persist across page reloads.
 *
 * Provided Context Values:
 * - user: The authenticated user's data (or null).
 * - token: The authentication token (or null).
 * - isAuthenticated: Boolean indicating whether a user is logged in.
 * - redirectMessage: Temporary message used when redirecting unauthenticated users.
 * - setRedirectMessage: Setter for updating redirect messages.
 * - login(email, password): Attempts to authenticate the user.
 * - register(username, email, password): Creates a new user account.
 * - logout(): Logs the user out and clears stored credentials.
 *
 * Behavior Overview:
 * - Login & Register:
 *   - Send credentials to the backend.
 *   - Store returned token and user data in localStorage.
 *   - Return success/failure objects for UI handling.
 *
 * - Logout:
 *   - Sends a logout request (best-effort).
 *   - Clears token and user from localStorage.
 *
 * - Token Handling:
 *   - Automatically attaches the token to axios Authorization headers.
 *   - Removes the header when no token is present.
 *
 * - Session Restoration:
 *   - On mount or token change, attempts to restore the user's session by
 *     calling `/auth/me`.
 *   - If the token is invalid or expired, clears user and token.
 *
 * Notes:
 * - API_BASE_URL is read from Vite environment variables.
 * - All API endpoints assume a backend structure like:
 *     POST auth/login
 *     POST auth/register
 *     POST auth/logout
 *     GET  auth/me
 * - This provider must wrap the entire application for authentication to work.
 */
import axios from "axios";
import { useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export default function AuthProvider({ children }) {
    // Persisted user object (null when logged out)
    const [user, setUser] = useLocalStorage("user", null);

    // Persisted auth token (null when logged out)
    const [token, setToken] = useLocalStorage("token", null);

    const API_BASE_URL = import.meta.env.VITE_AUTH_SERVICE_URL;

    // Boolean indicating whether the user is authenticated
    const isAuthenticated = !!token;

    /**
     * login(email, password)
     *
     * Attempts to authenticate the user.
     *
     * @param {string} email - User's email address
     * @param {string} password - User's password
     *
     * @returns {Promise<{success: boolean, message?: string}>}
     *   - success: true if login succeeded
     *   - message: optional error message if login failed
     */
    const login = useCallback(async (email, password) => {
        try {
            const res = await axios.post(API_BASE_URL + "auth/login", { email, password });

            // Store token + user in localStorage
            setToken(res.data.token);
            setUser(res.data.data);

            return { success: true };
        }
        catch (err) {
            const message = err.response?.data?.message || "Login failed. Please try again.";
            return { success: false, message };
        }
    }, [setToken, setUser, API_BASE_URL]);

    /**
     * register(username, email, password)
     *
     * Creates a new user account.
     *
     * @param {string} username - User's username
     * @param {string} email - User's email
     * @param {string} password - User's password
     *
     * @returns {Promise<{success: boolean, message?: string}>}
     *   - success: true if registration succeeded
     *   - message: optional error message if registration failed
     */
    const register = useCallback(async (username, email, password) => {
        try {
            const res = await axios.post(API_BASE_URL + "auth/register", { username, email, password });

            // Store token and user in localStorage
            setToken(res.data.token);
            setUser(res.data.data);

            return { success: true };
        }
        catch (err) {
            const message = err.response?.data?.message || "Registration failed. Please try again.";
            return { success: false, message };
        }
    }, [setToken, setUser, API_BASE_URL]);

    /**
     * update(username, bio, profile picture)
     *
     * Updates the user's account details.
     *
     * @param {string} username - User's username
     * @param {string} bio - User's bio
     * @param {string} profile_picture - User's new profile picture
     *
     * @returns {Promise<{success: boolean, message?: string}>}
     *   - success: true if update succeeded
     *   - message: optional error message if update failed
     */
    const update = useCallback(async (username, bio, profile_picture) => {
        try {
            const res = await axios.put(API_BASE_URL + "auth/me", { username, bio, profile_picture });

            if (res.data.data) {
                setUser(res.data.data);
            }

            return { success: true, message: res.data.message };
        }
        catch (err) {
            const message = err.response?.data?.detail || "Failed to update profile. Please try again.";
            return { success: false, message };
        }
    }, [setUser, API_BASE_URL]);

    /**
     * changePassword(current_password, new_password)
     *
     * Changes the user's password.
     *
     * @param {string} current_password - User's current password
     * @param {string} new_password - User's new password
     *
     * @returns {Promise<{success: boolean, message?: string}>}
     *   - success: true if update succeeded
     *   - message: optional error message if update failed
     */
    const changePassword = useCallback(async (current_password, new_password) => {
        try {
            await axios.put(API_BASE_URL + "auth/me/password", { current_password, new_password });
            return { success: true };
        }
        catch (err) {
            const message = err.response?.data?.detail || "Failed to change password. Please try again.";
            return { success: false, message };
        }
    }, [API_BASE_URL]);

    /**
     * logout()
     *
     * Logs the user out.
     *
     * @returns {Promise<void>}
     *
     * Notes:
     * - Attempts to notify the backend.
     * - Clears token and user from localStorage.
     */
    const logout = useCallback(async () => {
        try {
            await axios.post(API_BASE_URL + "auth/logout", { token });
        } catch (err) {
            console.log(err);
        }

        setToken(null);
        setUser(null);
    }, [token, setToken, setUser, API_BASE_URL]);

    /**
     * delete_account()
     *
     * Deletes the user's account
     *
     * @returns {Promise<void>}
     *
     * Notes:
     * - Attempts to notify the backend.
     * - Clears token and user from localStorage.
     */
    const deleteAccount = useCallback(async () => {
        try {
            await axios.delete(API_BASE_URL + "auth/me");
        } catch (err) {
            console.log(err);
        }

        setToken(null);
        setUser(null);
    }, [setToken, setUser, API_BASE_URL]);

    /**
     * Sync axios Authorization header with current token.
     *
     * Runs whenever the token changes.
     */
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [token]);

    /**
     * restoreSession()
     *
     * Attempts to restore the user's session using the stored token.
     * Called on mount and whenever the token changes.
     *
     * Behavior:
     * - If no token exists: clear user and exit.
     * - If token exists: call /auth/me to validate it.
     * - If token is invalid: clear token and user.
     */
    useEffect(() => {
        async function restoreSession() {
            if (!token) {
                setUser(null);
                return;
            }

            try {
                const res = await axios.get(API_BASE_URL + "auth/me");
                setUser(res.data.data);
            } catch (err) {
                console.log(err);

                // Token invalid or expired: clear session
                setToken(null);
                setUser(null);
            }
        }

        restoreSession();
    }, [token, setToken, setUser, API_BASE_URL]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                login,
                logout,
                register,
                update,
                changePassword,
                deleteAccount
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}