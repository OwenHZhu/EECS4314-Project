/**
 * useUser.js
 *
 * Custom hook for accessing authenticated user data and user-related actions
 * from UserContext.
 *
 * Dependencies:
 * - UserContext: Provides user object and update helpers.
 */

import { useContext } from "react";
import { UserContext } from "../../context/user/UserContext";

/**
 * useUser
 * Returns the current user context value.
 * @returns {object|null} User context value.
 */
export function useUser() {
    return useContext(UserContext);
}