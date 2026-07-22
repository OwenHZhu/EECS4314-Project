/**
 * AuthProvider.jsx
 *
 * Provides authentication state and actions across the application.
 * Stores user, token, and library data in localStorage and syncs the
 * Authorization header for authenticated API requests.
 *
 * Props:
 * @param {React.ReactNode} children - Components that rely on authentication context.
 *
 * Dependencies:
 * - useLocalStorage: Persists user, token, and library data.
 * - authService: Handles login, registration, logout, account deletion, and session restore.
 * - authClient: Axios instance used for authenticated requests.
 */

import { useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { useLocalStorage } from "../../hooks/useLocalStorage.js";

import {
    login as loginRequest,
    register as registerRequest,
    logout as logoutRequest,
    deleteAccount as deleteAccountRequest,
    me as meRequest
} from "../../api/auth/authService.js";

import authClient from "../../api/auth/authClient";

/**
 * AuthProvider
 *
 * Wraps children with AuthContext and exposes authentication state and actions.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Components that consume auth context.
 * @returns {JSX.Element}
 */
export default function AuthProvider({ children }) {
    const [user, setUser] = useLocalStorage("user", null);
    const [token, setToken] = useLocalStorage("token", null);
    const [, setLibrary] = useLocalStorage("library", null);

    const isAuthenticated = !!token;

    // Sync Authorization header
    useEffect(() => {
        if (token) {
            authClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete authClient.defaults.headers.common["Authorization"];
        }
    }, [token]);

    /**
     * login()
     *
     * Authenticates the user and stores token + user data.
     *
     * @async
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{success: boolean, message: string}>}
     */
    const login = useCallback(async (email, password) => {
        try {
            const res = await loginRequest(email, password);
            setToken(res.data.token);
            setUser(res.data.data);
            return { success: true, message: res.data?.message };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.detail || "Login failed."
            };
        }
    }, [setToken, setUser]);

    /**
     * register()
     *
     * Registers a new user and stores token + user data.
     *
     * @async
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{success: boolean, message: string}>}
     */
    const register = useCallback(async (username, email, password) => {
        try {
            const res = await registerRequest(username, email, password);
            setToken(res.data.token);
            setUser(res.data.data);
            return { success: true, message: res.data?.message };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.detail || "Registration failed."
            };
        }
    }, [setToken, setUser]);

    /**
     * logout()
     *
     * Logs out the user and clears all stored authentication data.
     *
     * @async
     * @returns {Promise<{success: boolean, message: string}>}
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
     * deleteAccount()
     *
     * Deletes the user's account and clears all stored authentication data.
     *
     * @async
     * @returns {Promise<{success: boolean, message: string}>}
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

    // Restore session
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
                deleteAccount,
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}