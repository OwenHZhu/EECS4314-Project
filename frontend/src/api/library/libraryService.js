import libraryClient from "./libraryClient";

export function getLibrary() {
    return libraryClient.get("/library");
}

export function addEntry(book_id, status, is_favourite, rating) {
    return libraryClient.post("/library", { book_id, status, is_favourite, rating });
}

export function updateEntry(book_id, status, is_favourite, rating) {
    return libraryClient.patch("/library/update", { book_id, status, is_favourite, rating });
}

export function deleteEntry(book_id) {
    return libraryClient.delete(`/library/${book_id}`, { book_id });
}