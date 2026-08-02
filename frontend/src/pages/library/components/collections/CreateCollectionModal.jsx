import { useState } from "react";
import { useCollection } from "../../../../hooks/collection/useCollection";
import GenericButton from "../../../../components/generic/GenericButton";


export default function CreateCollectionModal({ setCreateModal }) {
    const { createCollectionEntry } = useCollection();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    async function handleSubmit(event) {
        event.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setFormError("Collection name is required");
            return;
        }

        setSubmitting(true);
        setFormError(null);
        const result = await createCollectionEntry(trimmedName, description.trim() || null);
        setSubmitting(false);

        if (result) {
            setCreateModal(false);
        } else {
            setFormError("Failed to create collection");
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-[#7A581B] bg-[#1A1712] p-6 shadow-2xl">
                <h2 className="text-lg font-bold text-[#EEE0CC]">New Collection</h2>
                <p className="mt-1 text-xs text-[#7E7272]">Create a custom list for books in your library.</p>

                <label className="mt-5 block text-xs font-semibold text-[#BFB8AD]" htmlFor="collection-name">Name</label>
                <input id="collection-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} autoFocus className="mt-2 w-full rounded-lg border border-[#3F2D0A] bg-[#0F0E0C] px-3 py-2 text-sm text-[#F9EDCC] outline-none transition focus:border-[#7A581B]" placeholder="e.g. Summer Reading" />

                <label className="mt-4 block text-xs font-semibold text-[#BFB8AD]" htmlFor="collection-description">Description</label>
                <textarea id="collection-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} className="mt-2 w-full resize-none rounded-lg border border-[#3F2D0A] bg-[#0F0E0C] px-3 py-2 text-sm text-[#F9EDCC] outline-none transition focus:border-[#7A581B]" placeholder="Optional description" />

                {formError && <p className="mt-3 text-xs text-[#F9CACC]">{formError}</p>}

                <div className="mt-5 flex gap-3">
                    <GenericButton type="submit" disabled={submitting} variant="secondary" className="px-4 py-2 text-xs md:text-xs">{submitting ? "Creating..." : "Create"}</GenericButton>
                    <GenericButton type="button" disabled={submitting} onClick={() => setCreateModal(false)} variant="ghost" className="px-4 py-2 text-xs md:text-xs">Cancel</GenericButton>
                </div>
            </form>
        </div>
    );
}
