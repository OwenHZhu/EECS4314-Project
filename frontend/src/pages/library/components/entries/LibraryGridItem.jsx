/**
 * A compact card used by the library grid view.
 *
 * The card intentionally reuses the existing edit, delete, and favourite
 * actions so switching layouts does not change the available functionality.
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../../utils/utils";
import { useLibraryActions } from "../../../../hooks/library/useLibraryActions";
import DeleteEntryModal from "../modals/DeleteEntryModal";
import EditEntryModal from "../modals/EditEntryModal";
import GenericButton from "../../../../components/generic/GenericButton";
import Icon from "../../../../components/generic/Icon";

export default function LibraryGridItem({
    libraryEntry,
    variant = "finished",
    className = "",
    ...props
}) {
    const { getDateText, doAction } = useLibraryActions();
    const [deleteModal, setDeleteModal] = useState(false);
    const [editModal, setEditModal] = useState(false);

    const rating = libraryEntry.rating || 0;

    return (
        <article
            {...props}
            className={cn(
                "group relative flex min-w-0 flex-col rounded-xl border border-white/10 bg-black/20 transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:shadow-xl",
                className
            )}
        >
            {deleteModal && createPortal(
                <DeleteEntryModal
                    libraryEntry={libraryEntry}
                    setDeleteModal={setDeleteModal}
                />,
                document.body
            )}

            {editModal && createPortal(
                <EditEntryModal
                    libraryEntry={libraryEntry}
                    setEditModal={setEditModal}
                    variant={variant}
                />,
                document.body
            )}

            <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-[#0B0B0A]">
                {libraryEntry.book.cover_image ? (
                    <img
                        src={libraryEntry.book.cover_image}
                        alt={`Cover image for ${libraryEntry.book.title}`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-xs font-semibold text-[#7E7272]">
                        {libraryEntry.book.title}
                    </div>
                )}

                <button
                    type="button"
                    aria-label={`Delete ${libraryEntry.book.title} from library`}
                    onClick={() => setDeleteModal(true)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-[#D9D3C7] opacity-100 transition hover:bg-[#3A0B0D] hover:text-white md:opacity-0 md:group-hover:opacity-100"
                >
                    <Icon className="text-lg">close</Icon>
                </button>

                {libraryEntry.is_favourite && (
                    <div
                        className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-[#EDCFE5]"
                        title="Favourite"
                    >
                        <Icon className="text-lg cursor-default">favorite</Icon>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col px-2.5 py-2">
                <h3
                    className="truncate text-xs font-semibold text-[#F9EDCC]"
                    title={libraryEntry.book.title}
                >
                    {libraryEntry.book.title}
                </h3>

                <p
                    className="mt-1 truncate text-[11px] text-[#BFB8AD]"
                    title={libraryEntry.book.author}
                >
                    {libraryEntry.book.author}
                </p>

                <div
                    className="mt-2 flex items-center gap-0.5"
                    aria-label={rating ? `${rating} out of 5 stars` : "Not rated"}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                            key={star}
                            className={cn(
                                "text-xs cursor-default",
                                star <= rating
                                    ? "text-yellow-400"
                                    : "text-gray-400"
                            )}
                        >
                            star
                        </Icon>
                    ))}
                </div>

                <p className="mt-1.5 truncate text-[11px] text-[#7E7272]">
                    {getDateText(libraryEntry, variant)}
                </p>

                <div className="mt-2 flex gap-2">
                    {variant === "favourite" ? (
                        <GenericButton
                            type="button"
                            onClick={() => doAction(libraryEntry, variant, false, null)}
                            variant="ghost"
                            className="px-2.5 py-1 text-[11px] md:text-[11px]"
                        >
                            Unfavourite
                        </GenericButton>
                    ) : (
                        <GenericButton
                            type="button"
                            onClick={() => setEditModal(true)}
                            variant="ghost"
                            className="px-2.5 py-1 text-[11px] md:text-[11px]"
                        >
                            Edit
                        </GenericButton>
                    )}
                </div>
            </div>
        </article>
    );
}
