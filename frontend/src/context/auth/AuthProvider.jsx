/**
 * ./context/auth/AuthProvider.jsx
 * 
 * Responsibilities:
 * - Store and persist `user` and `token`
 * - Sync JWT token to the authClient Authorization header
 * - Provide login, register, logout, update, changePassword, deleteAccount
 * - Restore session on mount or token change
 *
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
    // User object
    const [user, setUser] = useLocalStorage("user", null);

    // JWT
    const [token, setToken] = useLocalStorage("token", null);

    // Boolean indicating whether a user is authenticated
    const isAuthenticated = !!token;

    /**
     * Sync Authorization header with current token.
     * Runs whenever the token changes.
     */
    useEffect(() => {
        if (token) {
            authClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete authClient.defaults.headers.common["Authorization"];
        }
    }, [token]);

    /**
     * login(email, password)
     *
     * Attempts to authenticate the user.
     *
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const login = useCallback(async (email, password) => {
        try {
            const res = await loginRequest(email, password);

            // Store token + user in localStorage
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
     * register(username, email, password)
     *
     * Creates a new user account.
     *
     * @param {string} username - Desired username
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const register = useCallback(async (username, email, password) => {
        try {
            const res = await registerRequest(username, email, password);

            // Store token + user in localStorage
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
     * logout()
     *
     * Logs the user out and clears stored credentials.
     *
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const logout = useCallback(async () => {
        try {
            const res = await logoutRequest(token);

            // Clear session
            setToken(null);
            setUser(null);

            return { success: true, message: res.data?.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.detail };
        }
    }, [token, setToken, setUser]);

    /**
     * update(username, bio, profile_picture)
     *
     * Updates the user's profile information.
     *
     * @param {string} username - Updated username
     * @param {string} bio - Updated bio
     * @param {string} profile_picture - Updated profile picture URL
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const update = useCallback(async (username, bio, profile_picture) => {
        try {
            const payload = { username, bio, profile_picture };
            const res = await updateRequest(payload);

            // Update local user if backend returned new data
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
     * changePassword(current_password, new_password)
     *
     * Changes the user's password.
     *
     * @param {string} current_password - Current password
     * @param {string} new_password - New password
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
     * deleteAccount()
     *
     * Deletes the user's account and clears local session.
     *
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const deleteAccount = useCallback(async () => {
        try {
            const res = await deleteAccountRequest();

            // Clear session
            setToken(null);
            setUser(null);

            return { success: true, message: res.data?.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.detail };
        }
    }, [setToken, setUser]);

    /**
     * restoreSession()
     *
     * Attempts to restore the user's session using the stored token.
     * Called on mount and whenever the token changes.
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

                // Token invalid or expired: clear session
                setToken(null);
                setUser(null);
            }
        }

        restoreSession();
    }, [token, setToken, setUser]);

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