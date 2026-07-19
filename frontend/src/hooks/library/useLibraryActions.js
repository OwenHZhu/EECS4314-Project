/**
 * useLibraryActions.js
 *
 * Provides UI-ready text and actions for library entry variants.
 * Centralizes variant-specific behavior (labels, dates, update actions)
 * so UI components remain simple and consistent.
 */

import { useLibrary } from "./useLibrary";
import { format } from "date-fns";

/**
 * useLibraryActions
 *
 * Supplies helper functions for rendering and updating library entries.
 *
 * @returns {{
 *   getDateText: (entry: Object, variant: string) => string,
 *   doAction: (entry: Object, variant: string, isFavourite: boolean, rating: number|null) => Promise<any>|null
 * }}
 */
export function useLibraryActions() {
    const { updateLibraryEntry } = useLibrary();

    /**
     * Produce formatted date text based on the entry's variant.
     *
     * @param {Object} entry - The library entry
     * @param {string} variant - UI variant representing the entry's state
     * @returns {string}
     */
    function getDateText(entry, variant) {
        switch (variant) {
            case "finished":
                // Show full reading range
                return `${format(entry.added_at, "MMM d, yyy")} to ${format(entry.updated_at, "MMM d, yyy")}`;

            case "reading":
                // Show start date only
                return `Since ${format(entry.added_at, "MMM d, yyy")}`;

            case "dropped":
                // Show range until dropped
                return `${format(entry.added_at, "MMM d, yyy")} to ${format(entry.updated_at, "MMM d, yyy")}`;

            case "wishlist":
            case "favourite":
                // Wishlist/favourite use updated_at as the "added" date
                return `Added on ${format(entry.updated_at, "MMM d, yyy")}`;

            default:
                // Fallback to added_at
                return `${format(entry.added_at, "MMM d, yyy")}`;
        }
    }

    /**
     * Execute the correct update action for the given variant.
     * Each variant maps to a specific updateLibraryEntry call.
     *
     * @param {Object} entry - The library entry
     * @param {string} variant - UI variant representing the action
     * @param {boolean} isFavourite - Updated favourite flag
     * @param {number|null} rating - Updated rating
     * @returns {Promise<any>|null}
     */
    async function doAction(entry, variant, isFavourite, rating) {
        switch (variant) {
            case "finished":
                // Mark as read with favourite + rating updates
                return updateLibraryEntry(entry.book_id, "read", isFavourite, rating);

            case "reading":
            case "wishlist":
                // Keep variant as-is; no favourite/rating updates
                return updateLibraryEntry(entry.book_id, variant, null, null);

            case "dropped":
                // Mark as dropped with favourite + rating updates
                return updateLibraryEntry(entry.book_id, "dropped", isFavourite, rating);

            case "favourite":
                // Toggle favourite off; preserve existing status + rating
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