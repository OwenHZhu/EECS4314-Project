/**
 * ./api/book.js
 *
 * Frontend API helper functions for the Book Service.
 *
 * This file centralizes Book Service requests so pages, hooks, and components
 * do not need to build fetch URLs directly.
 */

const BOOK_SERVICE_URL =
  import.meta.env.VITE_BOOK_SERVICE_URL || "http://localhost:8001/api/v1/";

/**
 * Builds a Book Service URL while safely handling leading/trailing slashes.
 *
 * @param {string} path - Endpoint path after the Book Service base URL.
 * @returns {string} Complete request URL.
 */
function buildBookServiceUrl(path) {
  const baseUrl = BOOK_SERVICE_URL.endsWith("/")
    ? BOOK_SERVICE_URL
    : `${BOOK_SERVICE_URL}/`;

  const normalizedPath = path.startsWith("/")
    ? path.slice(1)
    : path;

  return `${baseUrl}${normalizedPath}`;
}

/**
 * Fetches books from the Book Service.
 *
 * Used by the Discover page search flow. The backend response returns books
 * inside a `data` array.
 *
 * @param {string} query - Optional search query for title or author.
 * @param {number} limit - Maximum number of books to return.
 * @returns {Promise<Array>} List of book objects.
 */
export async function getBooks(query = "", limit = 50) {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query.trim());
  }

  params.set("limit", String(limit));

  const response = await fetch(
    buildBookServiceUrl(`books/?${params.toString()}`)
  );

  if (!response.ok) {
    throw new Error("Failed to fetch books.");
  }

  const result = await response.json();

  return result.data ?? [];
}

/**
 * Fetches one book by ID from the Book Service.
 *
 * Used by the Book Page after the user clicks View More. The backend response
 * returns the selected book inside a `data` object.
 *
 * @param {string} bookId - UUID of the selected book.
 * @returns {Promise<object>} Book object.
 */
export async function getBookById(bookId) {
  const response = await fetch(
    buildBookServiceUrl(`books/${bookId}`)
  );

  if (!response.ok) {
    throw new Error("Failed to fetch book details.");
  }

  const result = await response.json();

  return result.data;
}