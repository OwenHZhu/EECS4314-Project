/**
 * SearchPage.jsx
 *
 * Dedicated search interface for exploring the book catalog.
 * Displays full search results using the same SearchResult component
 * used in the navbar. 
 *
 * Dependencies:
 * - useBookSearch: Fetches search results from backend
 * - SearchBar: Search input component
 * - SearchResult: Reusable compact book result row
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useBookSearch } from "../../hooks/books/useBookSearch";
import SearchBar from "../../components/search/SearchBar";
import SearchResult from "../../components/search/SearchResult";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [query, setQuery] = useState(initialQuery);

  // Always search "all" genres for this page
  const { results, loading, error } = useBookSearch(query, "all");

  // Keep URL query and input field in sync
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <div className="min-h-screen">
      <title>Search Books | BookAtlas</title>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="border-b border-[#222] pb-6 mb-6">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#444] mb-1">
            Book Atlas
          </p>
          <h1 className="text-[22px] font-medium text-[#f0f0f0]">
            Search the catalog
          </h1>
        </header>

        {/* Search bar */}
        <SearchBar query={query} setQuery={setQuery} />

        {error && (
          <div className="mb-4 rounded-lg border border-secondary bg-error-bg px-4 py-3 text-sm text-error-text">
            {error}
          </div>
        )}

        {/* Status message */}
        <p className="text-xs text-[#444] mb-5">
          {loading
            ? "Searching…"
            : query
              ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
              : `Showing all ${results.length} books`}
        </p>

        {/* Results or empty state */}
        {results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#333] text-sm">No books found for "{query}"</p>
            <p className="text-[#2a2a2a] text-xs mt-1">
              Try a different title or author
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#222]">
            {results.map((book) => (
              <SearchResult key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}