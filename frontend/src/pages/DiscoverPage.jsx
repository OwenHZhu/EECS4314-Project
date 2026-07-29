/**
 * DiscoverPage.jsx
 *
 * The main catalog browsing screen for BookAtlas. Users can search the catalog,
 * filter by genre, and explore results in a responsive grid. Search queries are
 * handled through `useBookSearch`, which provides debounced backend results,
 * while genre filtering is applied client‑side.
 *
 * Selecting a book opens the details modal, where authenticated users can
 * favourite, rate, or update their reading status. Library interactions are
 * powered by `useLibrary`, which creates or updates entries as needed.
 *
 * State overview:
 * - `query`: current search text
 * - `genre`: active genre filter
 * - `selectedBook`: book opened in the details modal
 * 
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookSearch } from "../hooks/books/useBookSearch";
import { BookCard } from "../components/books/BookCard";
import { GENRES, GENRE_LABELS } from "../data/genres";
import BookDetailsModal from "../components/books/BookDetailsModal";
import { useAuth } from "../hooks/auth/useAuth";
import { useLibrary } from "../hooks/library/useLibrary";

export function DiscoverPage() {
  // Search text input
  const [query, setQuery] = useState("");

  // Selected genre filter ("all" by default)
  const [genre, setGenre] = useState("all");

  // Debounced search results + loading state
  const { results, loading, error } = useBookSearch(query, genre);

  // Book currently selected for the details modal
  const [selectedBook, setSelectedBook] = useState(null);

  // Allows redirecting to login or a book detail route when needed
  const navigate = useNavigate();

  // Accesses the current authentication state
  const { isAuthenticated } = useAuth();

  // Library Service state/actions for user-specific book interactions
  const {
    library,
    addLibraryEntry,
    updateLibraryEntry,
  } = useLibrary();

  // Current user's saved library entry for the selected modal book
  const selectedLibraryEntry =
    selectedBook && Array.isArray(library)
      ? library.find((entry) => entry.book_id === selectedBook.id)
      : null;

  /**
   * Saves a user-specific library change from the modal.
   *
   * If the selected book is already in the user's library, the existing entry
   * is updated. Otherwise, a new library entry is created. When the user clicks
   * favourite or rating before selecting a status, "wishlist" is used as the
   * default status so the Library Service can create the entry.
   *
   * @param {object} book - Book being updated.
   * @param {object} changes - Library fields to update.
   */
  async function saveLibraryChange(
    book,
    {
      nextStatus = selectedLibraryEntry?.status ?? null,
      nextFavourite = Boolean(selectedLibraryEntry?.is_favourite),
      nextRating = selectedLibraryEntry?.rating ?? 0,
    },
  ) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!book) {
      return;
    }

    const statusToSave = nextStatus || "wishlist";
    const ratingToSave = nextRating || null;

    if (selectedLibraryEntry) {
      await updateLibraryEntry(
        book.id,
        statusToSave,
        nextFavourite,
        ratingToSave,
      );
    } else {
      await addLibraryEntry(
        book.id,
        statusToSave,
        nextFavourite,
        ratingToSave,
      );
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <title>Discover Books | BookAtlas</title>

      {/* Header / Hero section */}
      <div className="mb-12">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#444] mb-3">
          Book Atlas
        </p>

        <h1 className="text-[56px] font-semibold leading-[1.05] tracking-tight text-[#f0f0f0] mb-4">
          Map your
          <br />
          <span className="text-secondary">reading world.</span>
        </h1>

        <p className="text-[15px] text-[#555] max-w-md leading-relaxed">
          Track every book you've read, are reading, or dream of reading.
          Discuss, rate, and build your library — all in one place.
        </p>
      </div>

      {/* Stats section */}
      <div className="flex gap-6 mb-10 pb-10 border-b border-[#1a1a1a]">
        {[
          { label: "Books in catalog", value: "12" },
          { label: "Active readers", value: "1.2k" },
          { label: "Forum threads", value: "340" },
          { label: "Ratings submitted", value: "8.4k" },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-[22px] font-semibold text-[#f0f0f0]">
              {s.value}
            </p>
            <p className="text-[11px] text-[#444] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        {/* Search icon */}
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        {/* Search input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or genre…"
          className="w-full bg-[#141414] border border-[#222] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-[#e8e8e8] placeholder-[#3a3a3a] outline-none focus:border-[#7c6af7] focus:ring-2 focus:ring-[#7c6af7]/15 transition-all"
        />
      </div>

      {/* Genre filter buttons */}
      <div className="flex gap-2 flex-wrap mb-6">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-3 py-1 rounded-full text-[12px] border transition-colors ${
              genre === g
                ? "bg-[#2d2845] border-[#7c6af7] text-[#b8b0ff]"
                : "bg-[#141414] border-[#222] text-[#555] hover:border-[#333] hover:text-[#888]"
            }`}
          >
            {GENRE_LABELS[g]}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-secondary bg-error-bg px-4 py-3 text-sm text-error-text">
          {error}
        </div>
      )}

      {/* Search result summary */}
      <p className="text-[11px] text-[#333] mb-5">
        {loading
          ? "Searching…"
          : query
            ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
            : `Showing all ${results.length} books`}
      </p>

      {/* No results message */}
      {results.length === 0 ? (
        <div className="text-center py-20 text-[#333] text-sm">
          No books found for "{query}"
        </div>
      ) : (
        /* Results grid */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((book) => (
            <div key={book.id} className="flex justify-center">
              <BookCard
                book={book}
                onClick={() => setSelectedBook(book)}
              />
            </div>
          ))}
        </div>
      )}

      <BookDetailsModal
        book={selectedBook}
        isOpen={Boolean(selectedBook)}
        isAuthenticated={isAuthenticated}
        initialFavourite={Boolean(selectedLibraryEntry?.is_favourite)}
        initialStatus={selectedLibraryEntry?.status ?? null}
        initialRating={selectedLibraryEntry?.rating ?? 0}
        onClose={() => setSelectedBook(null)}
        onAuthRequired={() => {
          navigate("/login");
        }}
        onViewMore={(book) => {
          navigate(`/books/${book.id}`);
        }}
        onFavouriteChange={async (nextFavourite, book) => {
          await saveLibraryChange(book, {
            nextFavourite,
          });
        }}
        onStatusChange={async (nextStatus, book) => {
          await saveLibraryChange(book, {
            nextStatus,
          });
        }}
        onRatingChange={async (nextRating, book) => {
          await saveLibraryChange(book, {
            nextRating,
          });
        }}
      />
    </div>
  );
}