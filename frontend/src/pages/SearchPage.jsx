/**
 * SearchPage.jsx
 *
 * Dedicated search interface for exploring the book catalog.
 * Supports:
 * - Text search (title, author, genre)
 * - Genre filtering via selectable chips
 * - Responsive result grid with BookCard components
 *
 * Dependencies:
 * - useBookSearch: Debounced search + filtering
 * - BookCard: Renders individual book tiles
 * - SearchBar: Search input component
 * - GENRES, GENRE_LABELS: Genre filter options
 *
 * State:
 * - query: Current search text
 * - genre: Selected genre filter ("all" by default)
 */

import { useState } from "react";
import { useBookSearch } from "../hooks/useBookSearch";
import { BookCard } from "../components/BookCard";
import SearchBar from "../components/search/SearchBar";
import { GENRES, GENRE_LABELS } from "../data/mockBook";

/**
 * SearchPage
 *
 * Renders the search interface with text search, genre filters,
 * loading indicator, and responsive results grid.
 *
 * @returns {JSX.Element}
 */
export function SearchPage() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");

  const { results, loading } = useBookSearch(query, genre);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <title>Search Books | BookAtlas</title>
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="border-b border-[#222] pb-6 mb-6">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#444] mb-1">
            Book Atlas
          </p>
          <h1 className="text-[22px] font-medium text-[#f0f0f0]">
            Find your next read
          </h1>
        </header>

        {/* Search bar */}
        <SearchBar
          query={query}
          setQuery={setQuery}
        />

        {/* Genre chips */}
        <div className="flex gap-2 flex-wrap mb-6">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                genre === g
                  ? "bg-[#2d2845] border-[#7c6af7] text-[#b8b0ff]"
                  : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:border-[#444] hover:text-[#999]"
              }`}
            >
              {GENRE_LABELS[g]}
            </button>
          ))}
        </div>

        {/* Status message */}
        <p className="text-xs text-[#444] mb-5">
          {loading
            ? "Searching…"
            : query
              ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
              : `Showing all ${results.length} books`}
        </p>

        {/* Results grid or empty state */}
        {results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#333] text-sm">No books found for "{query}"</p>
            <p className="text-[#2a2a2a] text-xs mt-1">
              Try a different title or author
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {results.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}