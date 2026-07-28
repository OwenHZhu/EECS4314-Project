import { useCallback, useEffect, useState } from "react";
import { CollectionContext } from "./CollectionContext";
import { useAuth } from "../../hooks/auth/useAuth";
import libraryClient from "../../api/library/libraryClient";
import {
    addBookToCollection,
    createCollection,
    deleteCollection,
    getCollection,
    getCollections,
    removeBookFromCollection,
    updateCollection
} from "../../api/collection/collectionService";


export default function CollectionProvider({ children }) {
    const { token } = useAuth();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCollectionEntries = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getCollections();
            setCollections(res.data);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to load collections");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getCollectionDetails = async (collectionId) => {
        try {
            const res = await getCollection(collectionId);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to load collection");
            return null;
        }
    };

    const createCollectionEntry = async (name, description = null) => {
        try {
            const res = await createCollection(name, description);
            await getCollectionEntries();
            return res.data;
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to create collection");
            return null;
        }
    };

    const updateCollectionEntry = async (collectionId, name, description) => {
        try {
            const res = await updateCollection(collectionId, name, description);
            await getCollectionEntries();
            return res.data;
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to update collection");
            return null;
        }
    };

    const deleteCollectionEntry = async (collectionId) => {
        try {
            const res = await deleteCollection(collectionId);
            await getCollectionEntries();
            return res.data;
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to delete collection");
            return null;
        }
    };

    const addCollectionBook = async (collectionId, bookId) => {
        try {
            const res = await addBookToCollection(collectionId, bookId);
            await getCollectionEntries();
            return res.data;
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to add book to collection");
            return null;
        }
    };

    const removeCollectionBook = async (collectionId, bookId) => {
        try {
            const res = await removeBookFromCollection(collectionId, bookId);
            await getCollectionEntries();
            return res.data;
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to remove book from collection");
            return null;
        }
    };

    useEffect(() => {
        if (!token) {
            setCollections([]);
            setError(null);
            return;
        }

        libraryClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        getCollectionEntries();
    }, [token, getCollectionEntries]);

    return (
        <CollectionContext.Provider value={{ collections, loading, error, setError, getCollectionEntries, getCollectionDetails, createCollectionEntry, updateCollectionEntry, deleteCollectionEntry, addCollectionBook, removeCollectionBook }}>
            {children}
        </CollectionContext.Provider>
    );
}
