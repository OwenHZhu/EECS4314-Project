/**
 * LibraryProvider.jsx
 *
 * High-level responsibilities:
 * - Persist and expose the user's `library` collection via context
 * - Sync the libraryClient Authorization header with the current JWT
 * - Provide CRUD operations for library entries:
 *      - getLibraryEntries()
 *      - addLibraryEntry()
 *      - updateLibraryEntry()
 *      - deleteLibraryEntry()
 * - Automatically fetch the library when authentication changes
 *
 * This provider centralizes all library-related state and actions so that
 * consuming components can easily read and modify the user's book entries.
 */

import { useEffect, useCallback } from "react";
import { LibraryContext } from "./LibraryContext.jsx";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useAuth } from "../../hooks/auth/useAuth.js";

import {
    getLibrary,
    addEntry,
    updateEntry,
    deleteEntry
} from "../../api/library/libraryService.js";

import libraryClient from "../../api/library/libraryClient.js";

export default function LibraryProvider({ children }) {
    /**
     * JWT token from AuthProvider.
     * Used to authorize library API requests.
     */
    const { token } = useAuth();

    /**
     * @typedef {Object} LibraryEntry
     * @property {number} book_id
     * @property {string} status
     * @property {boolean} is_favourite
     * @property {number|null} rating
     */

    /** @type {[LibraryEntry[]|null, Function]} */
    const [library, setLibrary] = useLocalStorage("library", null);

    /**
     * Fetch all library entries for the authenticated user.
     *
     * @returns {Promise<void>}
     */
    const getLibraryEntries = useCallback(async () => {
        try {
            const res = await getLibrary();
            setLibrary(res.data);
        } catch (err) {
            alert(err.response);
        }
    }, [setLibrary]);

    /**
     * Add a new entry to the user's library.
     *
     * @param {number} book_id
     * @param {string} status
     * @param {boolean} is_favourite
     * @param {number|null} rating
     * @returns {Promise<void>}
     */
    const addLibraryEntry = async (book_id, status, is_favourite, rating) => {
        try {
            const res = await addEntry(book_id, status, is_favourite, rating);
            console.log(res);

            // Refresh library after mutation
            getLibraryEntries();
        } catch (err) {
            console.log(err);
        }
    };

    /**
     * Update an existing library entry.
     *
     * @param {number} book_id
     * @param {string} status
     * @param {boolean} is_favourite
     * @param {number|null} rating
     * @returns {Promise<void>}
     */
    const updateLibraryEntry = async (book_id, status, is_favourite, rating) => {
        try {
            const res = await updateEntry(book_id, status, is_favourite, rating);
            console.log(res);

            // Refresh library after mutation
            getLibraryEntries();
        } catch (err) {
            console.log(err);
        }
    };

    /**
     * Delete a library entry by book ID.
     *
     * @param {number} book_id
     * @returns {Promise<void>}
     */
    const deleteLibraryEntry = async (book_id) => {
        try {
            const res = await deleteEntry(book_id);
            console.log(res);

            // Refresh library after mutation
            getLibraryEntries();
        } catch (err) {
            console.log(err);
        }
    };

    /**
     * Sync Authorization header and fetch library entries when token changes.
     *
     * - If no token: remove Authorization header and skip fetching.
     * - If token exists: set Authorization header and fetch library.
     */
    useEffect(() => {
        if (!token) {
            delete libraryClient.defaults.headers.common["Authorization"];
            return;
        }

        libraryClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        getLibraryEntries();
    }, [token, getLibraryEntries]);

    return (
        <LibraryContext.Provider
            value={{
                library,
                getLibraryEntries,
                addLibraryEntry,
                updateLibraryEntry,
                deleteLibraryEntry
            }}
        >
            {children}
        </LibraryContext.Provider>
    );
}