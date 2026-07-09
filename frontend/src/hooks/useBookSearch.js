/**
 * ./hooks/useBookSearch.js
 *
 * A custom hook that provides debounced client-side searching and filtering
 * over the BOOKS dataset. It supports:
 * - Text search (title, author, genre)
 * - Genre filtering
 * - Debounced updates to avoid excessive re-renders
 *
 * Dependencies:
 * - useState, useEffect, useRef (React): Manage search results, loading state,
 *   and debounce timer.
 * - BOOKS: Static mock book data used as the search source.
 *
 * Arguments:
 * @param {string} query - The user's search input. Can match title, author, or genre.
 * @param {string} genre - A genre key ("all", "sci-fi", "fantasy", etc.) used to filter results.
 *
 * Returns:
 * @returns {{ results: Array, loading: boolean }}
 *   - results: Array of books matching the search + genre filter.
 *   - loading: Boolean indicating whether the hook is currently processing a search.
 *
 * Notes:
 * - Search is debounced by 250ms to prevent rapid filtering on every keystroke.
 * - Filtering is case-insensitive.
 * - When query is empty, all books matching the genre are returned.
 */
import { useState, useEffect, useRef } from "react";
import { BOOKS } from "../data/mockBook";

export function useBookSearch(query, genre) {
  // Search results (default: all books)
  const [results, setResults] = useState(BOOKS);

  // Indicates whether the hook is currently processing a search
  const [loading, setLoading] = useState(false);

  // Ref used to store the debounce timer ID
  const timer = useRef(null);

  useEffect(() => {
    // Clear any existing debounce timer before starting a new one
    clearTimeout(timer.current);

    setLoading(true);

    // Debounce search by 250ms
    timer.current = setTimeout(() => {
      const q = query.trim().toLowerCase();

      // Filter books based on genre + query
      setResults(
        BOOKS.filter((b) => {
          // Genre filter: "all" means no restriction
          const matchGenre = genre === "all" || b.genre === genre;

          // Query filter: match title, author, or genre
          const matchQuery =
            !q ||
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.genre.toLowerCase().includes(q);

          return matchGenre && matchQuery;
        }),
      );

      setLoading(false);
    }, 250);

    // Cleanup: clear timer when query/genre changes or component unmounts
    return () => clearTimeout(timer.current);
  }, [query, genre]);

  return { results, loading };
}