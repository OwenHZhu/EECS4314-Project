import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useCollection } from "../../../../hooks/collection/useCollection";
import { useLibrary } from "../../../../hooks/library/useLibrary";
import GenericButton from "../../../../components/generic/GenericButton";
import Icon from "../../../../components/generic/Icon";


export default function CollectionDetailsModal({ collection, setDetailsModal }) {
    const { getCollectionDetails, updateCollectionEntry, addCollectionBook, removeCollectionBook } = useCollection();
    const { library } = useLibrary();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionBookId, setActionBookId] = useState(null);
    const [modalError, setModalError] = useState(null);
    const [manageBooks, setManageBooks] = useState(false);
    const [editCollection, setEditCollection] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [savingCollection, setSavingCollection] = useState(false);

    async function loadDetails() {
        setLoading(true);
        const result = await getCollectionDetails(collection.id);
        setDetails(result);
        setModalError(result ? null : "Failed to load collection");
        setLoading(false);
    }

    useEffect(() => {
        loadDetails();
    }, []);

    function containsBook(bookId) {
        return details?.collection_books?.some((entry) => entry.book_id === bookId) || false;
    }

    async function handleBookAction(bookId) {
        setActionBookId(bookId);
        setModalError(null);

        const result = containsBook(bookId)
            ? await removeCollectionBook(collection.id, bookId)
            : await addCollectionBook(collection.id, bookId);

        if (result) {
            const updatedDetails = await getCollectionDetails(collection.id);
            setDetails(updatedDetails);
        } else {
            setModalError("Failed to update collection");
        }

        setActionBookId(null);
    }

    function openEditCollection() {
        setEditName(details?.name || collection.name);
        setEditDescription(details?.description || collection.description || "");
        setModalError(null);
        setEditCollection(true);
    }

    async function handleCollectionUpdate(event) {
        event.preventDefault();
        const trimmedName = editName.trim();
        if (!trimmedName) {
            setModalError("Collection name is required");
            return;
        }

        setSavingCollection(true);
        setModalError(null);
        const result = await updateCollectionEntry(collection.id, trimmedName, editDescription.trim() || null);

        if (result) {
            const updatedDetails = await getCollectionDetails(collection.id);
            setDetails(updatedDetails);
            setEditCollection(false);
        } else {
            setModalError("Failed to update collection");
        }

        setSavingCollection(false);
    }

    const collectionBooks = details?.collection_books || [];
    const collectionName = details?.name || collection.name;
    const collectionDescription = details?.description || collection.description;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-[#7A581B] bg-[#1A1712] p-6 shadow-2xl">
                <header className="flex items-start justify-between gap-4 border-b border-[#3F2D0A] pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-[#EEE0CC]">{editCollection ? "Edit Collection" : manageBooks ? "Manage Books" : collectionName}</h2>
                        <p className="mt-1 text-xs text-[#7E7272]">{editCollection ? "Update the collection name or description." : manageBooks ? `Add or remove books from ${collectionName}.` : collectionDescription || "No description"}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {!manageBooks && !editCollection && (
                            <button type="button" aria-label="Manage collection books" title="Add books" onClick={() => setManageBooks(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3F2D0A] text-[#EEE0CC] transition hover:bg-[#7A581B]">
                                <Icon className="text-xl">add</Icon>
                            </button>
                        )}

                        {!manageBooks && !editCollection && (
                            <button type="button" aria-label="Edit collection" title="Edit collection" onClick={openEditCollection} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3F2D0A] text-[#EEE0CC] transition hover:bg-[#7A581B]">
                                <Icon className="text-lg">edit</Icon>
                            </button>
                        )}

                        {manageBooks && !editCollection && (
                            <button type="button" aria-label="Back to collection details" title="Back" onClick={() => setManageBooks(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3F2D0A] text-[#EEE0CC] transition hover:bg-[#7A581B]">
                                <Icon className="text-xl">arrow_back</Icon>
                            </button>
                        )}

                        <button type="button" aria-label="Close collection" onClick={() => setDetailsModal(false)} className="text-[#7E7272] transition hover:text-[#F9EDCC]">
                            <Icon className="text-xl">close</Icon>
                        </button>
                    </div>
                </header>

                {loading && <p className="py-8 text-center text-xs text-[#BFB8AD]">Loading collection...</p>}
                {!loading && modalError && <p className="mt-4 text-xs text-[#F9CACC]">{modalError}</p>}

                {!loading && !manageBooks && !editCollection && details && (
                    <div className="mt-4 flex min-h-0 flex-1 flex-col">
                        <div className="flex items-center gap-4 text-[11px] text-[#7E7272]">
                            <span>{collectionBooks.length} {collectionBooks.length === 1 ? "book" : "books"}</span>
                            <span>Created {format(new Date(details.created_at), "MMM d, yyyy")}</span>
                        </div>

                        {!collectionBooks.length && (
                            <div className="py-10 text-center">
                                <Icon className="cursor-default text-3xl text-[#7A581B]">collections_bookmark</Icon>
                                <p className="mt-2 text-sm text-[#EEE0CC]">This collection is empty</p>
                                <p className="mt-1 text-xs text-[#7E7272]">Click + to add books from your library.</p>
                            </div>
                        )}

                        {collectionBooks.length > 0 && (
                            <div className="custom-scrollbar mt-4 grid grid-cols-2 gap-3 overflow-auto pr-2 sm:grid-cols-3">
                                {collectionBooks.map((entry) => (
                                    <article key={entry.book_id} className="overflow-hidden rounded-lg border border-white/5 bg-black/20">
                                        <div className="aspect-[3/4] overflow-hidden bg-[#0F0E0C]">
                                            {entry.book?.cover_image ? <img src={entry.book.cover_image} alt={`Cover image for ${entry.book.title}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center p-3 text-center text-[10px] text-[#7E7272]">{entry.book?.title || "Unknown book"}</div>}
                                        </div>
                                        <div className="p-2">
                                            <h3 className="truncate text-xs font-semibold text-[#F9EDCC]">{entry.book?.title || "Unknown book"}</h3>
                                            <p className="mt-1 truncate text-[11px] text-[#7E7272]">{entry.book?.author || "Unknown author"}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!loading && editCollection && (
                    <form onSubmit={handleCollectionUpdate} className="mt-4">
                        <label className="block text-xs font-semibold text-[#BFB8AD]" htmlFor="edit-collection-name">Name</label>
                        <input id="edit-collection-name" value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={100} autoFocus className="mt-2 w-full rounded-lg border border-[#3F2D0A] bg-[#0F0E0C] px-3 py-2 text-sm text-[#F9EDCC] outline-none transition focus:border-[#7A581B]" />

                        <label className="mt-4 block text-xs font-semibold text-[#BFB8AD]" htmlFor="edit-collection-description">Description</label>
                        <textarea id="edit-collection-description" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={500} rows={4} className="mt-2 w-full resize-none rounded-lg border border-[#3F2D0A] bg-[#0F0E0C] px-3 py-2 text-sm text-[#F9EDCC] outline-none transition focus:border-[#7A581B]" />

                        <div className="mt-5 flex gap-3">
                            <GenericButton type="submit" disabled={savingCollection} variant="secondary" className="px-4 py-2 text-xs md:text-xs">{savingCollection ? "Saving..." : "Save"}</GenericButton>
                            <GenericButton type="button" disabled={savingCollection} onClick={() => { setEditCollection(false); setModalError(null); }} variant="ghost" className="px-4 py-2 text-xs md:text-xs">Cancel</GenericButton>
                        </div>
                    </form>
                )}

                {!loading && manageBooks && !editCollection && (!library || library.length === 0) && (
                    <div className="py-10 text-center">
                        <Icon className="cursor-default text-3xl text-[#7A581B]">menu_book</Icon>
                        <p className="mt-2 text-sm text-[#EEE0CC]">Your library is empty</p>
                        <p className="mt-1 text-xs text-[#7E7272]">Add books to your library before organizing them into collections.</p>
                    </div>
                )}

                {!loading && manageBooks && !editCollection && library && library.length > 0 && (
                    <div className="custom-scrollbar mt-4 flex flex-col gap-2 overflow-auto pr-2">
                        {library.map((entry) => {
                            const isAdded = containsBook(entry.book_id);
                            const isWorking = actionBookId === entry.book_id;

                            return (
                                <div key={entry.book_id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 p-2">
                                    <div className="h-16 w-11 shrink-0 overflow-hidden rounded bg-[#0F0E0C]">
                                        {entry.book.cover_image ? <img src={entry.book.cover_image} alt={`Cover image for ${entry.book.title}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-1 text-center text-[8px] text-[#7E7272]">{entry.book.title}</div>}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-xs font-semibold text-[#F9EDCC]">{entry.book.title}</h3>
                                        <p className="mt-1 truncate text-[11px] text-[#7E7272]">{entry.book.author}</p>
                                    </div>

                                    <GenericButton type="button" disabled={isWorking} onClick={() => handleBookAction(entry.book_id)} variant={isAdded ? "ghost" : "secondary"} className="shrink-0 px-3 py-1 text-xs md:text-xs">
                                        {isWorking ? "Saving..." : isAdded ? "Remove" : "Add"}
                                    </GenericButton>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
