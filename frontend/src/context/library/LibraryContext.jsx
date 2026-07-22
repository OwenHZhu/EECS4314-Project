/**
 * LibraryContext.jsx
 *
 * React context for sharing library state and library-related actions.
 * Default value: null (no library data until provided by LibraryProvider).
 */

import { createContext } from "react";

/**
 * LibraryContext
 * Holds the user's library entries and CRUD functions supplied by LibraryProvider.
 */
export const LibraryContext = createContext(null);