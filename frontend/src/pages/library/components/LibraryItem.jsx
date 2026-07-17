/**
 * LibraryItem.jsx
 *
 * High-level responsibilities:
 * - Render a single library entry (book) inside a category list
 * - Display book metadata: cover, title, author
 * - Show a variant‑specific action button when applicable
 * - Display a formatted date string describing when the entry was added or updated
 * - Allow the user to delete the entry via a modal
 *
 * This component visually represents a user's book entry and delegates
 * variant‑specific behavior (button text, date text, actions) to `useLibraryActions`.
 */

import { cn } from "../../../utils/utils";
import { useState } from "react";
import { useLibraryActions } from "../../../hooks/library/useLibraryActions";
import DeleteEntryModal from "./DeleteEntryModal";
import GenericButton from "../../../components/generic/GenericButton";
import Icon from "../../../components/generic/Icon";


/**
 * LibraryItem
 *
 * @param {object} props
 * @param {object} props.libraryEntry - The full library entry object
 * @param {object} props.libraryEntry.book - Book metadata
 * @param {string} props.libraryEntry.book.title
 * @param {string} props.libraryEntry.book.author
 * @param {string} props.libraryEntry.book.cover_image
 * @param {string} props.variant - Category variant controlling behavior and styling.
 *   - "finished": hides the action button
 *   - other variants: show an action button with variant‑specific behavior
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
     * useLibraryActions
     *
     * Provides variant‑specific UI and behavior:
     * - buttonText: label for the action button (only used when variant !== "finished")
     * - dateText: formatted date string describing the entry's last update
     * - doAction: handler for the variant‑specific action (e.g., mark as reading/finished)
     *
     * The hook receives both the variant and the libraryEntry.
     */
    const { buttonText, dateText, doAction } = useLibraryActions(variant, libraryEntry);

    /**
     * Controls visibility of the DeleteEntryModal.
     * Toggled by clicking the delete icon in the right section.
     */
    const [deleteModal, setDeleteModal] = useState(false);

    return (
        <div
            {...props}
            className={cn(
                "flex flex-row justify-between items-start w-full py-2",
                className
            )}
        >
            {deleteModal && (
                <DeleteEntryModal
                    libraryEntry={libraryEntry}
                    setDeleteModal={setDeleteModal}
                />
            )}

            {/* Left section: cover image, title, author, and optional action button */}
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

                    {/* Action button shown only when the variant is not "finished" */}
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

            {/* Right section: date text and delete icon */}
            <div className="flex flex-row items-center space-x-2 mr-2">
                <p className="hidden md:block text-xs text-[#BFB8AD] text-wrap">
                    {dateText}
                </p>

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