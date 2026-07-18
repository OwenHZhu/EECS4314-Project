/**
 * AuthProvider.jsx
 *
 * High-level responsibilities:
 * - Persist and expose `user` and `token` via context
 * - Keep authClient's Authorization header in sync with the stored JWT
 * - Provide authentication actions: login, register, logout
 * - Provide account actions: update profile, change password, delete account
 * - Restore user session on mount or whenever the token changes
 *
 * This provider centralizes all authentication state and actions so that
 * consuming components can easily access and modify auth-related data.
 */

import { useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { useLocalStorage } from "../../hooks/useLocalStorage.js";

import {
    login as loginRequest,
    register as registerRequest,
    logout as logoutRequest,
    me as meRequest,
    update as updateRequest,
    changePassword as changePasswordRequest,
    deleteAccount as deleteAccountRequest
} from "../../api/auth/authService.js";

import authClient from "../../api/auth/authClient";

export default function AuthProvider({ children }) {
    /**
     * @typedef {Object|null} User
     * @property {string} id
     * @property {string} username
     * @property {string} email
     * @property {string} bio
     * @property {string} profile_picture
     */

    /** @type {[User, Function]} */
    const [user, setUser] = useLocalStorage("user", null);

    /** @type {[string|null, Function]} JWT token */
    const [token, setToken] = useLocalStorage("token", null);

    /** @type {[any, Function]} User library data */
    const [, setLibrary] = useLocalStorage("library", null);

    /** Whether a user is authenticated */
    const isAuthenticated = !!token;

    /**
     * Sync the Authorization header with the current token.
     * Ensures all authenticated requests automatically include the JWT.
     */
    useEffect(() => {
        if (token) {
            authClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete authClient.defaults.headers.common["Authorization"];
        }
    }, [token]);

    /**
     * Authenticate the user using email + password.
     *
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const login = useCallback(async (email, password) => {
        try {
            const res = await loginRequest(email, password);

            setToken(res.data.token);
            setUser(res.data.data);

            return { success: true, message: res.data?.message };
        } catch (err) {
            const message =
                err.response?.data?.detail || "Login failed. Please try again.";
            return { success: false, message };
        }
    }, [setToken, setUser]);

    /**
     * Register a new user account.
     *
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const register = useCallback(async (username, email, password) => {
        try {
            const res = await registerRequest(username, email, password);

            setToken(res.data.token);
            setUser(res.data.data);

            return { success: true, message: res.data?.message };
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                "Registration failed. Please try again.";
            return { success: false, message };
        }
    }, [setToken, setUser]);

    /**
     * Log the user out and clear all stored session data.
     *
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const logout = useCallback(async () => {
        try {
            const res = await logoutRequest(token);

            setToken(null);
            setUser(null);
            setLibrary(null);

            return { success: true, message: res.data?.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.detail };
        }
    }, [token, setToken, setUser, setLibrary]);

    /**
     * Update the user's profile information.
     *
     * @param {string} username
     * @param {string} bio
     * @param {string} profile_picture
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const update = useCallback(async (username, bio, profile_picture) => {
        try {
            const payload = { username, bio, profile_picture };
            const res = await updateRequest(payload);

            if (res.data?.data) {
                setUser(res.data.data);
            }

            return { success: true, message: res.data?.message };
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                "Failed to update profile. Please try again.";
            return { success: false, message };
        }
    }, [setUser]);

    /**
     * Change the user's password.
     *
     * @param {string} current_password
     * @param {string} new_password
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const changePassword = useCallback(async (current_password, new_password) => {
        try {
            const res = await changePasswordRequest(current_password, new_password);
            return { success: true, message: res.data?.message };
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                "Failed to change password. Please try again.";
            return { success: false, message };
        }
    }, []);

    /**
     * Permanently delete the user's account.
     * Clears all local session data afterward.
     *
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const deleteAccount = useCallback(async () => {
        try {
            const res = await deleteAccountRequest();

            setToken(null);
            setUser(null);
            setLibrary(null);

            return { success: true, message: res.data?.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.detail };
        }
    }, [setToken, setUser, setLibrary]);

    /**
     * Restore the user's session using the stored token.
     * Called on mount and whenever the token changes.
     *
     * If the token is invalid or expired, the session is cleared.
     */
    useEffect(() => {
        async function restoreSession() {
            if (!token) {
                setUser(null);
                return;
            }

            try {
                const res = await meRequest();
                setUser(res.data.data);
            } catch (err) {
                console.log(err);

                setToken(null);
                setUser(null);
                setLibrary(null);
            }
        }

        restoreSession();
    }, [token, setToken, setUser, setLibrary]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                login,
                register,
                logout,
                update,
                changePassword,
                deleteAccount
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}