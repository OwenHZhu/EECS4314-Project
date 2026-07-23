/**
 * LibraryProvider.jsx
 *
 * Provides library state and CRUD actions for the authenticated user.
 * Persists the library in localStorage and syncs the Authorization header
 * for library API requests based on the current JWT.
 *
 * Props:
 * @param {React.ReactNode} children - Components that consume library context.
 *
 * Dependencies:
 * - useAuth: Supplies JWT token for authenticated requests.
 * - useLocalStorage: Persists the library array.
 * - libraryService: Provides CRUD operations for library entries.
 * - libraryClient: Axios instance for library API calls.
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

/**
 * LibraryProvider
 *
 * Wraps children with LibraryContext and exposes library state + CRUD actions.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export default function LibraryProvider({ children }) {
    const { token } = useAuth();

    /**
     * @typedef {Object} LibraryEntry
     * @property {string} book_id
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
     * @param {string} book_id
     * @param {string} status
     * @param {boolean} is_favourite
     * @param {number|null} rating
     * @returns {Promise<void>}
     */
    const addLibraryEntry = async (book_id, status, is_favourite, rating) => {
        try {
            const res = await addEntry(book_id, status, is_favourite, rating);
            console.log(res);
            getLibraryEntries();
        } catch (err) {
            console.log(err);
        }
    };

    /**
     * Update an existing library entry.
     *
     * @param {string} book_id
     * @param {string} status
     * @param {boolean} is_favourite
     * @param {number|null} rating
     * @returns {Promise<void>}
     */
    const updateLibraryEntry = async (book_id, status, is_favourite, rating) => {
        try {
            const res = await updateEntry(book_id, status, is_favourite, rating);
            console.log(res);
            getLibraryEntries();
        } catch (err) {
            console.log(err);
        }
    };

    /**
     * Delete a library entry by book ID.
     *
     * @param {string} book_id
     * @returns {Promise<void>}
     */
    const deleteLibraryEntry = async (book_id) => {
        try {
            const res = await deleteEntry(book_id);
            console.log(res);
            getLibraryEntries();
        } catch (err) {
            console.log(err);
        }
    };

    /**
     * Sync Authorization header and fetch library entries when token changes.
     *
     * - If no token: clear Authorization header and reset library.
     * - If token exists: set Authorization header and fetch library.
     */
    useEffect(() => {
        if (!token) {
            delete libraryClient.defaults.headers.common["Authorization"];
            setLibrary(null);
            return;
        }

        libraryClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        getLibraryEntries();
    }, [token, setLibrary, getLibraryEntries]);

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