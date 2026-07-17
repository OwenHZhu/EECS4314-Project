/**
 * useLibrary.js
 *
 * High-level responsibilities:
 * - Provide a simple, typed wrapper around LibraryContext
 * - Allow components to easily access library state and actions
 *
 * This hook ensures that consuming components interact with the
 * LibraryContext in a consistent and ergonomic way.
 */

import { useContext } from "react";
import { LibraryContext } from "../../context/library/LibraryContext";

/**
 * useLibrary
 *
 * Returns the current value of LibraryContext.
 * Should be used inside components wrapped by LibraryProvider.
 *
 * @returns {{
 *   library: any,
 *   getLibraryEntries: Function,
 *   addLibraryEntry: Function,
 *   updateLibraryEntry: Function,
 *   deleteLibraryEntry: Function
 * } | null}
 */
export function useLibrary() {
    return useContext(LibraryContext);
}