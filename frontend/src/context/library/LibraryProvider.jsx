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

export default function LibraryProvider({ children }) {
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
            setLibrary(res.data);
        }
        catch (err) {
            alert(err.response);
        }
    }, [setLibrary]);

    const addLibraryEntry = async (book_id, status, is_favourite, rating) => {
        try {
            const res = await addEntry(book_id, status, is_favourite, rating);

            console.log(res);
            getLibraryEntries();
        }
        catch (err) {
            console.log(err);
        }
    };

    const updateLibraryEntry = async (book_id, status, is_favourite, rating) => {
        try {
            const res = await updateEntry(book_id, status, is_favourite, rating);

            console.log(res);

            getLibraryEntries();
        }
        catch (err) {
            console.log(err);
        }
    };

    const deleteLibraryEntry = async (book_id) => {
        try {
            const res = await deleteEntry(book_id);
            console.log(res);
            getLibraryEntries();
        }
        catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (!token) {
            return;
        }
        getLibraryEntries();
    }, [token, getLibraryEntries])

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