/**
 * UserProvider.jsx
 *
 * Provides user authentication state and user-related actions to the application.
 * Wraps the app with UserContext, exposing:
 * - user: the authenticated user object (or null)
 * - update: function for updating profile information
 * - changePassword: function for updating the user's password
 *
 * Props:
 * @param {React.ReactNode} children - Components that will consume the user context.
 *
 * Dependencies:
 * - useAuth: Supplies user state and setUser() for updating it.
 * - updateRequest: API call for updating user profile data.
 * - changePasswordRequest: API call for updating user password.
 * - UserContext: React context used to expose user data and actions.
 */

import { useCallback } from "react";
import { UserContext } from "./UserContext";
import { useAuth } from "../../hooks/auth/useAuth";

import {
    update as updateRequest,
    changePassword as changePasswordRequest,
} from "../../api/auth/authService";

/**
 * UserProvider
 *
 * Wraps children with UserContext and exposes user state + update helpers.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Components that rely on user context.
 * @returns {JSX.Element}
 */
export default function UserProvider({ children }) {
    const { user, setUser } = useAuth();

    /**
     * update()
     *
     * Updates the user's profile information and syncs the new data into context.
     *
     * @async
     * @param {string} username - Updated username.
     * @param {string} bio - Updated biography text.
     * @param {string|File|null} profile_picture - New profile picture or null.
     * @returns {Promise<{success: boolean, message: string}>}
     */
    const update = useCallback(async (username, bio, profile_picture) => {
        try {
            const res = await updateRequest({ username, bio, profile_picture });
            if (res.data?.data) setUser(res.data.data);
            return { success: true, message: res.data?.message };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.detail || "Failed to update profile."
            };
        }
    }, [setUser]);

    /**
     * changePassword()
     *
     * Updates the user's password using backend authentication service.
     *
     * @async
     * @param {string} current_password - The user's current password.
     * @param {string} new_password - The new password to set.
     * @returns {Promise<{success: boolean, message: string}>}
     */
    const changePassword = useCallback(async (current_password, new_password) => {
        try {
            const res = await changePasswordRequest(current_password, new_password);
            return { success: true, message: res.data?.message };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.detail || "Failed to change password."
            };
        }
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                update,
                changePassword
            }}
        >
            {children}
        </UserContext.Provider>
    );
}