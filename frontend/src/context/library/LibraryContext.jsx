/**
 * LibraryContext.jsx
 *
 * High-level responsibilities:
 * - Provide a React Context for sharing library-related state and actions
 * - Consumed by LibraryProvider and any component that needs access to
 *   the user's library entries or library manipulation functions
 *
 * This context acts as the central communication channel for all
 * library-related data within the application.
 */

import { createContext } from "react";

/**
 * LibraryContext
 *
 * @type {React.Context<{
 *   library: any,
 *   getLibraryEntries: Function,
 *   addLibraryEntry: Function,
 *   updateLibraryEntry: Function,
 *   deleteLibraryEntry: Function
 * } | null>}
 *
 * The context defaults to `null` and is populated by LibraryProvider.
 */
export const LibraryContext = createContext(null);