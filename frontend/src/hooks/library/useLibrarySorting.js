/**
 * useLibrarySorting.js
 *
 * These functions provide pure, reusable logic for transforming
 * library entry lists. They are intentionally UI‑agnostic and
 * operate only on the data passed to them.
 *
 * Responsibilities:
 * - Filter a full library list by category variant (finished, reading, etc.)
 * - Sort a filtered list using a selected sort label (Newest, Oldest, Title, Author)
 * - Provide small, focused sorting helpers for each sort mode
 *
 * All functions return new arrays or sorted copies, ensuring predictable behavior
 * when used inside React components.
 */

/**
 * Filter a library list based on a category variant.
 *
 * @param {Array<object>} libraryList - Full list of library entries
 * @param {string} variant - Category identifier (finished, reading, wishlist, etc.)
 * @returns {Array<object>} A filtered list containing only entries matching the variant
 */
export function filterLibraryListByVariant(libraryList, variant) {
    switch (variant) {
        case "finished":
            // Entries marked as fully read
            return libraryList.filter(e => e.status === "read");

        case "reading":
            // Entries currently being read
            return libraryList.filter(e => e.status === "reading");

        case "dropped":
            // Entries the user stopped reading
            return libraryList.filter(e => e.status === "dropped");

        case "wishlist":
            // Entries the user intends to read later
            return libraryList.filter(e => e.status === "wishlist");

        case "favourite":
            // Entries marked as favourites
            return libraryList.filter(e => e.is_favourite);

        default:
            // Unknown variant: return full list unchanged
            return libraryList;
    }
}

/**
 * Sort a list of filtered entries using a selected sort label.
 *
 * @param {Array<object>} selectedEntries - Filtered list of library entries
 * @param {string} label - Sorting mode label (Newest, Oldest, Title (A-Z), Author (A-Z))
 * @returns {Array<object>} A new sorted list based on the selected mode
 */
export function sortSelectedEntries(selectedEntries, label) {
    // Clone to avoid mutating the original array
    const copy = [...selectedEntries];

    switch (label) {
        case "Newest":
            // Sort by most recently updated first
            return sortNewest(copy);

        case "Oldest":
            // Sort by earliest updated first
            return sortOldest(copy);

        case "Title (A-Z)":
            // Alphabetical sort by book title
            return sortTitle(copy);

        case "Author (A-Z)":
            // Alphabetical sort by book author
            return sortAuthor(copy);

        default:
            // Unknown sort label: return original list
            return selectedEntries;
    }
}

/**
 * Sort entries by newest updated date first.
 *
 * @param {Array<object>} entries
 * @returns {Array<object>}
 */
function sortNewest(entries) {
    return entries.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

/**
 * Sort entries by oldest updated date first.
 *
 * @param {Array<object>} entries
 * @returns {Array<object>}
 */
function sortOldest(entries) {
    return entries.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
}

/**
 * Sort entries alphabetically by book title (A → Z).
 *
 * @param {Array<object>} entries
 * @returns {Array<object>}
 */
function sortTitle(entries) {
    return entries.sort((a, b) => {
        // Normalize to lowercase for consistent alphabetical comparison
        const titleA = a.book.title.toLowerCase();
        const titleB = b.book.title.toLowerCase();

        if (titleA > titleB) {
            return 1;
        }
        if (titleA < titleB) {
            return -1;
        }
        return 0;
    });
}

/**
 * Sort entries alphabetically by book author (A → Z).
 *
 * @param {Array<object>} entries
 * @returns {Array<object>}
 */
function sortAuthor(entries) {
    return entries.sort((a, b) => {
        // Normalize to lowercase for consistent alphabetical comparison
        const authorA = a.book.author.toLowerCase();
        const authorB = b.book.author.toLowerCase();

        if (authorA > authorB) {
            return 1;
        }
        if (authorA < authorB) {
            return -1;
        }
        return 0;
    });
}