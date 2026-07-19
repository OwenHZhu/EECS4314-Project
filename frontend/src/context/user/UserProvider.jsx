/**
 * UserProvider.jsx
 *
 * Provides user authentication state and user-related actions to the application.
 * Wraps the app with UserContext, exposing:
 * - user: the authenticated user object (or null)
 * - updateProfile: function for updating profile information
 * - changePassword: function for updating the user's password
 *
 * Props:
 * @param {React.ReactNode} children - Components that will consume the user context.
 *
 * Dependencies:
 * - useAuth: Supplies user state and setUser() for updating it.
 * - updateProfileRequest: API call for updating user profile data.
 * - changePasswordRequest: API call for updating user password.
 * - UserContext: React context used to expose user data and actions.
 */
import { useEffect, useCallback } from "react";
import { UserContext } from "./UserContext";
import { useAuth } from "../../hooks/auth/useAuth";

import {
    updateProfile as updateProfileRequest,
    updateProfilePicture as updateProfilePictureRequest,
    getProfilePicture as getProfilePictureRequest,
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
     * updateProfile()
     *
     * Updates the user's username and bio and syncs the new data into context.
     *
     * @async
     * @param {string} username - Updated username.
     * @param {string} bio - Updated biography text.
     * @param {string} profile_picture - New profile picture or null.
     * @returns {Promise<{success: boolean, message: string}>}
     */
    const updateProfile = useCallback(async (username, bio, profile_picture) => {
        try {
            const res = await updateProfileRequest({ username, bio, profile_picture });
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
     * updateProfilePicture()
     *
     * Updates the user's profile picture.
     */
    const updateProfilePicture = async (profile_picture) => {
        try {
            const res = await updateProfilePictureRequest(profile_picture);
            console.log(res.data);
            if (res.data?.data) setUser(res.data.data);
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.detail || "Failed to update profile picture."
            };
        }
    };

    /**
    * getProfilePicture()
    *
    * Gets the user's profile picture.
    */
    const getProfilePicture = async (filename) => {
        try {
            const res = await getProfilePictureRequest(filename);

            console.log(res);
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.detail || "Failed to get profile picture."
            };
        }
    }

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

    useEffect(() => {
        if (!user?.profile_picture) return;

        async function fetchPfp() {
            const res = await getProfilePictureRequest(user.profile_picture);
            setUser(prev => ({ ...prev, profile_picture_blob: res.data }));
        }

        fetchPfp();
    }, [user?.profile_picture, setUser]);

    return (
        <UserContext.Provider
            value={{
                user,
                updateProfile,
                updateProfilePicture,
                getProfilePicture,
                changePassword
            }}
        >
            {children}
        </UserContext.Provider>
    );
}