/**
 * LibraryItem.jsx
 *
 * High-level responsibilities:
 * - Render a single library entry (book) inside a category list
 * - Display book metadata: cover, title, author
 * - Show an action button when the entry is not in the "finished" category
 * - Display a formatted date string describing when the entry was added/updated
 *
 * This component acts as the visual representation of a user's book entry
 * and delegates variant-specific behavior (button text, date text, actions)
 * to `useLibraryActions`.
 */

import { cn } from "../../../utils/utils";
import { useState } from "react";
import { useLibraryActions } from "../../../hooks/library/useLibraryActions";
import DeleteEntryModal from "./DeleteEntryModal";
import GenericButton from "../../../components/generic/GenericButton";
import Icon from "../../../components/generic/Icon"


/**
 * LibraryItem
 *
 * @param {object} props
 * @param {object} props.libraryEntry - The full library entry object
 * @param {object} props.libraryEntry.book - Book metadata
 * @param {string} props.libraryEntry.book.title
 * @param {string} props.libraryEntry.book.author
 * @param {string} props.libraryEntry.book.cover_image
 * @param {string} props.variant - Category variant controlling behavior/styling
 * @param {string} [props.className] - Additional classes for the outer container
 *
 * @returns {JSX.Element} A styled library item row
 */
export default function LibraryItem({
    libraryEntry,
    variant = "finished",
    className = "",
    ...props
}) {
    /**
     * useLibraryActions provides:
     * - buttonText: label for the action button
     * - dateText: formatted date string
     * - doAction: variant-specific update function
     */
    const { buttonText, dateText, doAction } = useLibraryActions(variant, libraryEntry);
    const [deleteModal, setDeleteModal] = useState(false);

    return (
        <div
            {...props}
            className={cn(
                "flex flex-row justify-between items-start w-full py-2",
                className
            )}
        >
            {
                deleteModal && 
                <DeleteEntryModal
                    libraryEntry={libraryEntry}
                    setDeleteModal={setDeleteModal}
                />
            }

            {/* Left section: cover image, title, author, action button */}
            <div className="flex flex-row space-x-3 flex-1">
                <img
                    src={libraryEntry.book.cover_image}
                    alt={`Cover image for ${libraryEntry.book.title}`}
                    className="w-16 h-24 object-cover rounded-md"
                />

                <div className="flex flex-col w-1/2">
                    <h3 className="text-sm text-[#F9EDCC] font-semibold break-words text-wrap">
                        {libraryEntry.book.title}
                    </h3>

                    <p className="text-xs text-[#BFB8AD] font-medium">
                        {libraryEntry.book.author}
                    </p>

                    {variant !== "finished" && (
                        <GenericButton
                            onClick={doAction}
                            variant="ghost"
                            className="max-w-fit py-1 px-4 mt-3 text-xs md:text-xs"
                        >
                            {buttonText}
                        </GenericButton>
                    )}
                </div>
            </div>

            {/* Right section: date text */}
            <div className="flex flex-row items-center space-x-2">
                <p className="hidden md:block text-xs text-[#BFB8AD] text-wrap">
                    {dateText}
                </p>

                <Icon
                    onClick={() => {setDeleteModal(prev => !prev)}}
                    className="text-slate-700"
                >
                    close
                </Icon>
            </div>
        </div>
    );
}