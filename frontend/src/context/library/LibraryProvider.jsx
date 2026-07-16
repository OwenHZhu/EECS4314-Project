import { useEffect, useCallback } from "react";
import { LibraryContext } from "./LibraryContext.jsx"
import { useLocalStorage } from "../../hooks/useLocalStorage";

import {
    getLibrary,
    addEntry,
    updateEntry,
    deleteEntry
} from "../../api/library/libraryService.js";

import libraryClient from "../../api/library/libraryClient.js";

export default function AuthProvider({ children }) {
    const [token] = useLocalStorage("token", null);
    const [library, setLibrary] = useLocalStorage("library", null);

    useEffect(() => {
        if (token) {
            libraryClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete libraryClient.defaults.headers.common["Authorization"];
        }
    }, [token]);

    const getLibraryEntries = useCallback(async () => {
        try {
            const res = await getLibrary();

            console.log(res);
        }
        catch (err) {
            console.log(err);
        }
    });

    const addLibraryEntry = useCallback(async (book_id, status, is_favourite, rating) => {
        try {
            const res = await addEntry(book_id, status, is_favourite, rating);

            console.log(res);
        }
        catch (err) {
            console.log(err);
        }
    });

    const updateLibraryEntry = useCallback(async (book_id, status, is_favourite, rating) => {
        try {
            const res = await updateEntry(book_id, status, is_favourite, rating);

            console.log(res);
        }
        catch (err) {
            console.log(err);
        }
    });

    const deleteLibraryEntry = useCallback(async (book_id) => {
        try {
            const res = await deleteEntry(book_id);
            console.log(res);
        }
        catch (err) {
            console.log(err);
        }
    });

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