import { useState } from "react";
import { useCollection } from "../../../../hooks/collection/useCollection";
import CollectionCard from "./CollectionCard";
import CreateCollectionModal from "./CreateCollectionModal";
import GenericButton from "../../../../components/generic/GenericButton";
import Icon from "../../../../components/generic/Icon";


export default function CollectionSection({ className = "" }) {
    const { collections, loading, error, setError, getCollectionEntries } = useCollection();
    const [createModal, setCreateModal] = useState(false);

    return (
        <section className={className}>
            {createModal && <CreateCollectionModal setCreateModal={setCreateModal} />}

            <header className="flex items-center justify-between gap-4 border-b-2 border-[#5A4B4B] p-2 pb-3">
                <div>
                    <h2 className="font-bold text-[#C6C1B3] text-lg md:text-xl">My Collections</h2>
                    <p className="mt-1 text-sm text-[#7E7272]">Organize your library your way.</p>
                </div>

                <GenericButton type="button" onClick={() => { setError(null); setCreateModal(true); }} variant="secondary" className="flex items-center gap-1 px-4 py-2 text-xs md:text-xs">
                    <Icon className="text-base">add</Icon>
                    New Collection
                </GenericButton>
            </header>

            {loading && <p className="mt-5 text-xs text-[#BFB8AD]">Loading collections...</p>}

            {!loading && error && (
                <div className="mt-5 flex items-center gap-3 rounded-lg border border-[#3A0B0D] bg-[#170808] p-3">
                    <p className="text-xs text-[#F9CACC]">{error}</p>
                    <GenericButton type="button" onClick={getCollectionEntries} variant="ghost" className="ml-auto px-3 py-1 text-xs md:text-xs">Retry</GenericButton>
                </div>
            )}

            {!loading && !error && !collections.length && (
                <div className="mt-5 rounded-xl border border-dashed border-[#3F2D0A] bg-[#20170C]/40 px-5 py-10 text-center">
                    <Icon className="cursor-default text-3xl text-[#7A581B]">collections_bookmark</Icon>
                    <p className="mt-2 text-sm font-semibold text-[#EEE0CC]">No collections yet</p>
                    <p className="mt-1 text-xs text-[#7E7272]">Create one to start organizing your books.</p>
                </div>
            )}

            {!loading && !error && collections.length > 0 && (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {collections.map((collection) => <CollectionCard key={collection.id} collection={collection} />)}
                </div>
            )}
        </section>
    );
}
