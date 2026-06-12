import { useState } from "react";
import { useBookSearch } from "../hooks/useBookSearch";
import { BookCard } from "./BookCard";
import { GENRES, GENRE_LABELS } from "../data/mockBook";

export function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const { results, loading } = useBookSearch(query, genre);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
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

      <div className="relative mb-4">
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
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or genre…"
          className="w-full bg-[#141414] border border-[#222] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-[#e8e8e8] placeholder-[#3a3a3a] outline-none focus:border-[#7c6af7] focus:ring-2 focus:ring-[#7c6af7]/15 transition-all"
        />
      </div>

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

      <p className="text-[11px] text-[#333] mb-5">
        {loading
          ? "Searching…"
          : query
            ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
            : `Showing all ${results.length} books`}
      </p>

      {results.length === 0 ? (
        <div className="text-center py-20 text-[#333] text-sm">
          No books found for "{query}"
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {results.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
