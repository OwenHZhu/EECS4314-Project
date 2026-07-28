import { useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { useCollection } from "../../../../hooks/collection/useCollection";
import CollectionDetailsModal from "./CollectionDetailsModal";
import GenericButton from "../../../../components/generic/GenericButton";
import GenericModal from "../../../../components/generic/GenericModal";
import Icon from "../../../../components/generic/Icon";


export default function CollectionCard({ collection }) {
    const { deleteCollectionEntry } = useCollection();
    const [deleteModal, setDeleteModal] = useState(false);
    const [detailsModal, setDetailsModal] = useState(false);

    async function handleDelete() {
        const result = await deleteCollectionEntry(collection.id);
        if (result) {
            setDeleteModal(false);
        }
    }

    return (
        <article className="group flex min-h-40 flex-col rounded-xl border border-[#3F2D0A] bg-[#20170C] p-4 transition duration-200 hover:-translate-y-1 hover:border-[#7A581B] hover:shadow-xl">
            {deleteModal && (
                <GenericModal title="Delete this collection?" message={false} confirmLabel="Delete" cancelLabel="Cancel" onConfirm={handleDelete} onCancel={() => setDeleteModal(false)} />
            )}

            {detailsModal && createPortal(<CollectionDetailsModal collection={collection} setDetailsModal={setDetailsModal} />, document.body)}

            <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3F2D0A] text-[#EEE0CC]">
                    <Icon className="cursor-default text-xl">collections_bookmark</Icon>
                </div>

                <button type="button" aria-label={`Delete ${collection.name}`} onClick={() => setDeleteModal(true)} className="text-[#7E7272] opacity-100 transition hover:text-[#F9CACC] md:opacity-0 md:group-hover:opacity-100">
                    <Icon className="text-lg">delete</Icon>
                </button>
            </div>

            <h3 className="mt-4 truncate text-sm font-semibold text-[#F9EDCC]" title={collection.name}>{collection.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-[#BFB8AD]">{collection.description || "No description"}</p>

            <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                <p className="text-[11px] text-[#7E7272]">Created {format(new Date(collection.created_at), "MMM d, yyyy")}</p>
                <GenericButton type="button" onClick={() => setDetailsModal(true)} variant="ghost" className="px-3 py-1 text-xs md:text-xs">Open</GenericButton>
            </div>
        </article>
    );
}
