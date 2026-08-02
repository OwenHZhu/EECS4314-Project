import libraryClient from "../library/libraryClient";


export function getCollections() {
    return libraryClient.get("/collections");
}

export function getCollection(collectionId) {
    return libraryClient.get(`/collections/${collectionId}`);
}

export function createCollection(name, description) {
    return libraryClient.post("/collections", { name, description });
}

export function updateCollection(collectionId, name, description) {
    return libraryClient.patch(`/collections/${collectionId}`, { name, description });
}

export function deleteCollection(collectionId) {
    return libraryClient.delete(`/collections/${collectionId}`);
}

export function addBookToCollection(collectionId, bookId) {
    return libraryClient.post(`/collections/${collectionId}/books/${bookId}`);
}

export function removeBookFromCollection(collectionId, bookId) {
    return libraryClient.delete(`/collections/${collectionId}/books/${bookId}`);
}
