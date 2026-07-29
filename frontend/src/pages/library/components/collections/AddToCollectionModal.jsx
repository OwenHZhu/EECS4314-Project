import { useEffect, useState } from "react";
import { useCollection } from "../../../../hooks/collection/useCollection";
import GenericButton from "../../../../components/generic/GenericButton";
import Icon from "../../../../components/generic/Icon";


export default function AddToCollectionModal({ libraryEntry, setCollectionModal }) {
    const { collections, loading, getCollectionDetails, addCollectionBook, removeCollectionBook } = useCollection();
    const [memberships, setMemberships] = useState({});
    const [loadingMemberships, setLoadingMemberships] = useState(true);
    const [workingCollectionId, setWorkingCollectionId] = useState(null);
    const [modalError, setModalError] = useState(null);

    useEffect(() => {
        async function loadMemberships() {
            if (!collections.length) {
                setLoadingMemberships(false);
                return;
            }

            setLoadingMemberships(true);
            const collectionDetails = await Promise.all(collections.map((collection) => getCollectionDetails(collection.id)));
            const nextMemberships = {};

            collections.forEach((collection, index) => {
                nextMemberships[collection.id] = collectionDetails[index]?.collection_books?.some((entry) => entry.book_id === libraryEntry.book_id) || false;
            });

            setMemberships(nextMemberships);
            setLoadingMemberships(false);
        }

        loadMemberships();
    }, [collections, libraryEntry.book_id]);

    async function handleCollectionAction(collectionId) {
        setWorkingCollectionId(collectionId);
        setModalError(null);
        const isAdded = memberships[collectionId];
        const result = isAdded ? await removeCollectionBook(collectionId, libraryEntry.book_id) : await addCollectionBook(collectionId, libraryEntry.book_id);

        if (result) {
            setMemberships((current) => ({ ...current, [collectionId]: !isAdded }));
        } else {
            setModalError("Failed to update collection");
        }

        setWorkingCollectionId(null);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="flex max-h-[75vh] w-full max-w-md flex-col rounded-xl border border-[#7A581B] bg-[#1A1712] p-6 shadow-2xl">
                <header className="flex items-start justify-between gap-4 border-b border-[#3F2D0A] pb-4">
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-[#EEE0CC]">Add to Collection</h2>
                        <p className="mt-1 truncate text-xs text-[#7E7272]">{libraryEntry.book.title}</p>
                    </div>

                    <button type="button" aria-label="Close collections" onClick={() => setCollectionModal(false)} className="text-[#7E7272] transition hover:text-[#F9EDCC]">
                        <Icon className="text-xl">close</Icon>
                    </button>
                </header>

                {(loading || loadingMemberships) && <p className="py-8 text-center text-xs text-[#BFB8AD]">Loading collections...</p>}
                {modalError && <p className="mt-4 text-xs text-[#F9CACC]">{modalError}</p>}

                {!loading && !loadingMemberships && !collections.length && (
                    <div className="py-10 text-center">
                        <Icon className="cursor-default text-3xl text-[#7A581B]">collections_bookmark</Icon>
                        <p className="mt-2 text-sm text-[#EEE0CC]">No collections yet</p>
                        <p className="mt-1 text-xs text-[#7E7272]">Create a collection below your library first.</p>
                    </div>
                )}

                {!loading && !loadingMemberships && collections.length > 0 && (
                    <div className="custom-scrollbar mt-4 flex flex-col gap-2 overflow-auto pr-2">
                        {collections.map((collection) => {
                            const isAdded = memberships[collection.id];
                            const isWorking = workingCollectionId === collection.id;

                            return (
                                <div key={collection.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 p-3">
                                    <div className={isAdded ? "text-[#CCEED6]" : "text-[#7E7272]"}>
                                        <Icon className="cursor-default text-xl">{isAdded ? "check_circle" : "radio_button_unchecked"}</Icon>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-xs font-semibold text-[#F9EDCC]">{collection.name}</h3>
                                        <p className="mt-1 truncate text-[11px] text-[#7E7272]">{collection.description || "No description"}</p>
                                    </div>

                                    <GenericButton type="button" disabled={isWorking} onClick={() => handleCollectionAction(collection.id)} variant={isAdded ? "ghost" : "secondary"} className="shrink-0 px-3 py-1 text-xs md:text-xs">
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
