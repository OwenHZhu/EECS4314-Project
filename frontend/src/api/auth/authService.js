/**
 * ./api/auth/authService.js
 *
 * Wraps all auth‑related API calls for the authClient.
 * AuthProvider handles state updates, error formatting, and side effects.
 *
 * Endpoints assume the following backend routes:
 * Authentication Endpoints:
 * - POST   auth/login
 * - POST   auth/register
 * - POST   auth/logout
 * - DELETE auth/me
 * 
 * User Account Ednpoints:
 * - GET    auth/me
 * - PUT    auth/me
 * - PUT    auth/me/password
 * 
 * Profile Picture Endpoints:
 * - PUT    users/profile-picture          
 * - GET    users/profile-picture/:filename 
 */

import authClient from "./authClient.js";

/**
 * Login with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export function login(email, password) {
    return authClient.post("auth/login", { email, password });
}

/**
 * Register a new user.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export function register(username, email, password) {
    return authClient.post("auth/register", { username, email, password });
}

/**
 * Logout the current user.
 * @param {string} token - JWT token to invalidate
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export function logout(token) {
    return authClient.post("auth/logout", { token });
}

/**
 * Fetch the authenticated user's profile.
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export function me() {
    return authClient.get("auth/me");
}

/**
 * Update user profile fields.
 * @param {Object} payload - Arbitrary profile fields to update
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export function updateProfile(payload) {
    return authClient.put("auth/me", payload);
}

/**
 * Update the user's profile picture.
 */
export function updateProfilePicture(profile_picture) {
    return authClient.put("users/profile-picture", profile_picture);
}

/**
 * Get the user's profile picture.
 *
 * Fetches the raw image bytes for the user's profile picture.
 * Returns a Blob (image/jpeg) that can be used to create an object URL.
 *
 * @param {string} filename - The stored filename/key of the user's profile picture.
 * @returns {Promise<import("axios").AxiosResponse<Blob>>}
 */
export function getProfilePicture(filename) {
    return authClient.get(`users/profile-picture/${filename}`, {
        responseType: "blob"
    });
}

/**
 * Change the user's password.
 * @param {string} current_password
 * @param {string} new_password
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export function changePassword(current_password, new_password) {
    return authClient.put("auth/me/password", { current_password, new_password });
}

/**
 * Delete the authenticated user's account.
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export function deleteAccount() {
    return authClient.delete("auth/me");
}