/**
 * LibraryItem.jsx
 *
 * Renders a single library entry row, including:
 * - Book metadata (cover, title, author)
 * - Variant‑specific UI (edit button visibility, date text)
 * - Delete and edit modals
 *
 * Delegates variant‑specific formatting to useLibraryActions.
 */

import { cn } from "../../../../utils/utils";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useLibraryActions } from "../../../../hooks/library/useLibraryActions";
import AddToCollectionModal from "../collections/AddToCollectionModal";
import DeleteEntryModal from "../modals/DeleteEntryModal";
import EditEntryModal from "../modals/EditEntryModal";
import GenericButton from "../../../../components/generic/GenericButton";
import Icon from "../../../../components/generic/Icon";

/**
 * LibraryItem
 *
 * @param {Object} props
 * @param {Object} props.libraryEntry - Full library entry object
 * @param {Object} props.libraryEntry.book - Book metadata
 * @param {string} props.libraryEntry.book.title
 * @param {string} props.libraryEntry.book.author
 * @param {string} props.libraryEntry.book.cover_image
 * @param {string} props.variant - Controls UI behavior (e.g., finished, reading, wishlist, favourite)
 * @param {string} [props.className] - Optional container classes
 *
 * @returns {JSX.Element}
 */
export default function LibraryItem({
    libraryEntry,
    variant = "finished",
    className = "",
    ...props
}) {
    /**
     * Provides variant‑specific helpers:
     * - getDateText: formatted date string for the entry
     */
    const { getDateText, doAction } = useLibraryActions();

    /** Controls visibility of delete and edit modals */
    const [deleteModal, setDeleteModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [collectionModal, setCollectionModal] = useState(false);

    return (
        <div
            {...props}
            className={cn(
                "flex flex-row justify-between items-start w-full py-2",
                className
            )}
        >
            {/* Delete modal */}
            {deleteModal && (
                <DeleteEntryModal
                    libraryEntry={libraryEntry}
                    setDeleteModal={setDeleteModal}
                />
            )}

            {/* Edit modal */}
            {editModal && (
                <EditEntryModal
                    libraryEntry={libraryEntry}
                    setEditModal={setEditModal}
                    variant={variant}
                />
            )}

            {collectionModal && createPortal(<AddToCollectionModal libraryEntry={libraryEntry} setCollectionModal={setCollectionModal} />, document.body)}

            {/* Left: cover, title, author, edit button */}
            <div className="flex flex-row space-x-3 flex-1">
                <Link to={`/books/${libraryEntry.book_id}`} target="_blank" rel="noopener noreferrer" aria-label={`View details for ${libraryEntry.book.title}`} className="shrink-0 rounded-md transition hover:opacity-80">
                    <img
                        src={libraryEntry.book.cover_image}
                        alt={`Cover image for ${libraryEntry.book.title}`}
                        className="w-16 h-24 object-cover rounded-md"
                    />
                </Link>

                <div className="flex flex-col w-1/2">
                    <Link to={`/books/${libraryEntry.book_id}`} target="_blank" rel="noopener noreferrer" className="max-w-fit">
                        <h3 className="text-sm text-[#F9EDCC] font-semibold break-words text-wrap transition hover:text-white hover:underline">
                            {libraryEntry.book.title}
                        </h3>
                    </Link>

                    <p className="text-xs text-[#BFB8AD] font-medium">
                        {libraryEntry.book.author}
                    </p>

                    {/* Edit button hidden for favourite variant */}
                    {variant !== "favourite" && (
                        <GenericButton
                            onClick={() => setEditModal(prev => !prev)}
                            variant="ghost"
                            className="max-w-fit py-1 px-4 mt-3 text-xs md:text-xs"
                        >
                            Edit
                        </GenericButton>
                    )}
                    
                    {/* Unfavourite button only for favourite variant */}
                    {variant === "favourite" && (
                        <GenericButton
                            onClick={() => doAction(libraryEntry, variant, false, null)}
                            variant="ghost"
                            className="max-w-fit py-1 px-4 mt-3 text-xs md:text-xs"
                        >
                            Unfavourite
                        </GenericButton>
                    )}

                    <GenericButton
                        type="button"
                        onClick={() => setCollectionModal(true)}
                        variant="ghost"
                        className="max-w-fit py-1 px-4 mt-2 text-xs md:text-xs"
                    >
                        Collections
                    </GenericButton>
                </div>
            </div>

            {/* Right: date text + delete icon */}
            <div className="flex flex-row items-center space-x-2 mr-2">
                <p className="hidden md:block text-xs text-[#BFB8AD] text-wrap">
                    {getDateText(libraryEntry, variant)}
                </p>

                {/* Close icon toggles modal */}
                <Icon
                    onClick={() => setDeleteModal(prev => !prev)}
                    className="text-slate-700"
                >
                    close
                </Icon>
            </div>
        </div>
    );
}
