import { useState } from "react";
import { useBookSearch } from "../hooks/useBookSearch";
import { BookCard } from "./BookCard";
import { GENRES, GENRE_LABELS } from "../data/mockBook";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const { results, loading } = useBookSearch(query, genre);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
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
        <div className="relative mb-4">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"
            width="16"
            height="16"
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
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, or genre…"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f0f0f0] placeholder-[#444] outline-none focus:border-[#7c6af7] focus:ring-2 focus:ring-[#7c6af7]/20 transition-all"
          />
        </div>

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

        {/* Status */}
        <p className="text-xs text-[#444] mb-5">
          {loading
            ? "Searching…"
            : query
              ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
              : `Showing all ${results.length} books`}
        </p>

        {/* Grid */}
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
