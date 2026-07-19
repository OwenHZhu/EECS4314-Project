/**
 * ./pages/DiscoverPage.jsx
 *
 * The main book discovery screen. Allows users to:
 *
 * 1. **Search the catalog**
 *    - Text search across title, author, and genre.
 *    - Debounced search handled by `useBookSearch`.
 *
 * 2. **Filter by genre**
 *    - Uses GENRES and GENRE_LABELS to render filter buttons.
 *    - Selecting a genre updates the search results instantly.
 *
 * 3. **Browse results**
 *    - Displays a responsive grid of BookCard components.
 *    - Shows a loading indicator while search is processing.
 *    - Shows a “no results” message when nothing matches.
 *
 * Dependencies:
 * - `useBookSearch`: Custom hook providing debounced search and filtering.
 * - `BookCard`: Component for rendering individual book tiles.
 * - `GENRES`, `GENRE_LABELS`: Mock data for genre filtering UI.
 *
 * State:
 * - `query`: The current search text.
 * - `genre`: The selected genre filter.
 *
 * Behaviour:
 * - Typing in the search bar updates `query`.
 * - Clicking a genre button updates `genre`.
 * - Search results update automatically based on both values.
 * - Loading state is shown while the debounced search runs.
 *
 * Notes:
 * - No backend calls — all search/filtering is client-side.
 */

import { useState } from "react";
import { useBookSearch } from "../hooks/useBookSearch";
import { BookCard } from "../components/books/BookCard";
import { GENRES, GENRE_LABELS } from "../data/mockBook";
import BookDetailsModal from "../components/books/BookDetailsModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuth";


export function DiscoverPage() {
  // Search text input
  const [query, setQuery] = useState("");

  // Selected genre filter ("all" by default)
  const [genre, setGenre] = useState("all");

  // Debounced search results + loading state
  const { results, loading, error } = useBookSearch(query, genre);

  const [selectedBook, setSelectedBook] = useState(null);

  // Allows redirecting to a book detail route when needed
  const navigate = useNavigate();

  // Accesses the current authentication state
  const { isAuthenticated } = useAuth();

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
          <span className="text-[#7c6af7]">reading world.</span>
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
              onClose={() => setSelectedBook(null)}
              onAuthRequired={() => {
                
                navigate("/login");
              }}
              onViewMore={(book) => {
                
                navigate(`/books/${book.id}`);
              }}
              onFavouriteChange={(isFavourite, book) => {
                console.log("Favourite:", isFavourite, book.title);
              }}
              onStatusChange={(status, book) => {
                console.log("Status:", status, book.title);
              }}
              onRatingChange={(rating, book) => {
                console.log("Rating:", rating, book.title);
              }}
          />
  
    </div>
  );
}