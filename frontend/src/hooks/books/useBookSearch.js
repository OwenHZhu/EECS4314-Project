/**
 * ./hooks/useBookSearch.js
 *
 * A custom hook that provides debounced searching and filtering for the
 * Discover page. It supports:
 * - Text search through the Book Service API
 * - Genre filtering on the returned book results
 * - Debounced updates to avoid excessive API requests while typing
 * - Loading and error state management for the Discover page
 *
 * Dependencies:
 * - useState, useEffect, useRef (React): Manage search results, loading state,
 *   error state, and debounce timer.
 * - getBooks: Frontend API helper used to request books from the Book Service.
 *
 * Arguments:
 * @param {string} query - The user's search input. Sent to the Book Service.
 * @param {string} genre - A genre key ("all", "sci-fi", "fantasy", etc.) used to filter results.
 *
 * Returns:
 * @returns {{ results: Array, loading: boolean, error: string }}
 *   - results: Array of books matching the search + genre filter.
 *   - loading: Boolean indicating whether the hook is currently fetching books.
 *   - error: Error message shown when the Book Service request fails.
 *
 * Notes:
 * - Search is debounced by 250ms to prevent an API request on every keystroke.
 * - Backend search handles the text query.
 * - Genre filtering is currently handled on the frontend because the Book
 *   Service GET books endpoint does not require a genre query parameter.
 * - When query is empty, the hook requests books up to the configured limit.
 */

import { useState, useEffect, useRef } from "react";
import { getBooks } from "../../api/books/bookService";

const SEARCH_DEBOUNCE_MS = 250;
const BOOK_SEARCH_LIMIT = 50;

/**
 * Checks whether a book matches the selected genre filter.
 *
 * The Book Service returns genre as an array, while older mock data may use a
 * single string. Supporting both formats keeps the Discover page compatible
 * during the transition from mock data to backend data.
 *
 * @param {object} book - Book object returned from the Book Service.
 * @param {string} selectedGenre - Currently selected genre filter.
 * @returns {boolean} True when the book should be shown.
 */
function matchesSelectedGenre(book, selectedGenre) {
  // Genre filter: "all" means no restriction
  if (selectedGenre === "all") {
    return true;
  }

  // Book Service format: genre is an array of strings
  if (Array.isArray(book.genre)) {
    return book.genre.some(
      (bookGenre) =>
        String(bookGenre).toLowerCase() ===
        String(selectedGenre).toLowerCase(),
    );
  }

  // Legacy mock data format: genre is a single string
  return (
    String(book.genre).toLowerCase() ===
    String(selectedGenre).toLowerCase()
  );
}

export function useBookSearch(query, genre) {
  // Search results returned from the Book Service
  const [results, setResults] = useState([]);

  // Indicates whether the hook is currently fetching books
  const [loading, setLoading] = useState(false);

  // Stores any Book Service request error message
  const [error, setError] = useState("");

  // Ref used to store the debounce timer ID
  const timer = useRef(null);

  useEffect(() => {
    // Clear any existing debounce timer before starting a new one
    clearTimeout(timer.current);

    setLoading(true);
    setError("");

    // Debounce search by 250ms
    timer.current = setTimeout(async () => {
      try {
        // Backend search handles the text query
        const books = await getBooks(query, BOOK_SEARCH_LIMIT);

        // Frontend genre filtering is applied to the returned results
        const filteredBooks = books.filter((book) =>
          matchesSelectedGenre(book, genre),
        );

        setResults(filteredBooks);
      } catch (requestError) {
        setResults([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load books.",
        );
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    // Cleanup: clear timer when query/genre changes or component unmounts
    return () => clearTimeout(timer.current);
  }, [query, genre]);

  return { results, loading, error };
}