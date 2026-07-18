/**
 * useLibraryActions.js
 *
 * High-level responsibilities:
 * - Provide UI-ready text and actions for different library entry variants
 * - Map a library entry's status (reading, dropped, wishlist, favourite, etc.)
 *   to appropriate button labels, date text, and update actions
 * - Encapsulate variant-specific logic so UI components remain simple
 *
 * This hook centralizes all "what should this button do?" logic for
 * library entries, ensuring consistent behavior across the app.
 */

import { useLibrary } from "./useLibrary";
import { format } from "date-fns";

/**
 * useLibraryActions
 *
 * @param {string} variant - The UI variant representing the entry's state
 * @param {Object} entry - The library entry object
 * @param {number} entry.book_id
 * @param {string} entry.status
 * @param {boolean} entry.is_favourite
 * @param {number|null} entry.rating
 * @param {Date|string|number} entry.added_at
 * @param {Date|string|number} entry.updated_at
 *
 * @returns {{
 *   buttonText: string,
 *   dateText: string,
 *   doAction: Function
 * }}
 */
export function useLibraryActions() {
    const { updateLibraryEntry } = useLibrary();

    /**
     * Get the formatted date text associated with the current variant.
     *
     * @returns {string}
     */
    function getDateText(entry, variant) {
        switch (variant) {
            case "finished":
                return `${format(entry.added_at, "MMM d, yyy")} to ${format(entry.updated_at, "MMM d, yyy")}`;

            case "reading":
                return `Since ${format(entry.added_at, "MMM d, yyy")}`;

            case "dropped":
                return `${format(entry.added_at, "MMM d, yyy")} to ${format(entry.updated_at, "MMM d, yyy")}`;

            case "wishlist":
            case "favourite":
                return `Added on ${format(entry.updated_at, "MMM d, yyy")}`;

            default:
                return `${format(entry.added_at, "MMM d, yyy")}`;
        }
    }

    /**
     * Execute the appropriate action for the current variant.
     * Each variant maps to a specific updateLibraryEntry call.
     *
     * @returns {Promise<any>|null}
     */
    async function doAction(entry, variant, isFavourite, rating) {
        switch (variant) {
            case "finished":
                return updateLibraryEntry(entry.book_id, "read", isFavourite, rating);

            case "reading":
            case "wishlist":
                return updateLibraryEntry(entry.book_id, variant, null, null);

            case "dropped":
                return updateLibraryEntry(entry.book_id, "dropped", isFavourite, rating);

            case "favourite":
                return updateLibraryEntry(entry.book_id, entry.status, false, entry.rating);

            default:
                return null;
        }
    }

    return {
        getDateText,
        doAction
    };
}