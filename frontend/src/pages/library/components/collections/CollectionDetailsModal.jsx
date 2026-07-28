import { useEffect, useState } from "react";
import { useCollection } from "../../../../hooks/collection/useCollection";
import { useLibrary } from "../../../../hooks/library/useLibrary";
import GenericButton from "../../../../components/generic/GenericButton";
import Icon from "../../../../components/generic/Icon";


export default function CollectionDetailsModal({ collection, setDetailsModal }) {
    const { getCollectionDetails, addCollectionBook, removeCollectionBook } = useCollection();
    const { library } = useLibrary();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionBookId, setActionBookId] = useState(null);
    const [modalError, setModalError] = useState(null);

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-[#7A581B] bg-[#1A1712] p-6 shadow-2xl">
                <header className="flex items-start justify-between gap-4 border-b border-[#3F2D0A] pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-[#EEE0CC]">{collection.name}</h2>
                        <p className="mt-1 text-xs text-[#7E7272]">{collection.description || "Add books from your library to this collection."}</p>
                    </div>

                    <button type="button" aria-label="Close collection" onClick={() => setDetailsModal(false)} className="text-[#7E7272] transition hover:text-[#F9EDCC]">
                        <Icon className="text-xl">close</Icon>
                    </button>
                </header>

                {loading && <p className="py-8 text-center text-xs text-[#BFB8AD]">Loading collection...</p>}
                {!loading && modalError && <p className="mt-4 text-xs text-[#F9CACC]">{modalError}</p>}

                {!loading && (!library || library.length === 0) && (
                    <div className="py-10 text-center">
                        <Icon className="cursor-default text-3xl text-[#7A581B]">menu_book</Icon>
                        <p className="mt-2 text-sm text-[#EEE0CC]">Your library is empty</p>
                        <p className="mt-1 text-xs text-[#7E7272]">Add books to your library before organizing them into collections.</p>
                    </div>
                )}

                {!loading && library && library.length > 0 && (
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
