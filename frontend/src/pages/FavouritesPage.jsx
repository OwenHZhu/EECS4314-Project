/**
 * ./pages/FavouritesPage.jsx
 *
 * Displays all books the user has marked as favourites. This page provides:
 *
 * 1. **Favourite book listing**
 *    - Uses `FAVOURITES_IDS` to look up full book objects from `BOOKS`.
 *    - Filters out any missing or invalid IDs using `.filter(Boolean)`.
 *    - Renders each favourite using the `BookCard` component.
 *    - Adds a “Favourite” badge with custom styling to each card.
 *
 * 2. **Empty state**
 *    - If the user has no favourites, shows a friendly message encouraging
 *      them to mark books as favourites from their library.
 *
 * 3. **Genre breakdown**
 *    - Extracts unique genres from the favourites list.
 *    - Displays each genre with a color badge derived from the book’s spine
 *      colors (spineColor, transparency, spineText, etc.).
 *
 * Dependencies:
 * - `BOOKS`: Full mock book catalog.
 * - `FAVOURITES_IDS`: Array of book IDs marked as favourites.
 * - `BookCard`: Component used to render individual book tiles.
 *
 * Behaviour:
 * - No user interaction on this page — purely presentational.
 */

import { BOOKS } from "../data/mockBook";
import { FAVOURITES_IDS } from "../data/mockUser";
import { BookCard } from "../components/books/BookCard";

export function FavouritesPage() {
  // Build an array of favourite book objects by matching IDs to BOOKS
  // `.filter(Boolean)` removes any undefined results (e.g., invalid IDs)
  const favourites = FAVOURITES_IDS.map((id) =>
    BOOKS.find((b) => b.id === id),
  ).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <title>My Favourites | BookAtlas</title>

      {/* Header section */}
      <div className="mb-10">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#444] mb-2">
          Favourites
        </p>

        <h1 className="text-[40px] font-semibold tracking-tight text-[#f0f0f0]">
          Your all-time favourites
        </h1>

        <p className="text-[14px] text-[#444] mt-2">
          {favourites.length} books you love most
        </p>
      </div>

      {/* Empty state if no favourites */}
      {favourites.length === 0 ? (
        <div className="text-center py-24 text-[#333] text-sm">
          <p className="text-3xl mb-3">❤️</p>
          No favourites yet — mark books you love from your library.
        </div>
      ) : (
        <>
          {/* Favourite books grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12">
            {favourites.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                badge="Favourite"
                badgeStyle={{
                  backgroundColor: "#2e1a1a",
                  color: "#f87171",
                  borderColor: "#991b1b",
                }}
              />
            ))}
          </div>

          {/* Genre breakdown section */}
          <div className="border-t border-[#1a1a1a] pt-8">
            <p className="text-[12px] text-[#333] uppercase tracking-widest mb-4">
              Genres in your favourites
            </p>

            <div className="flex gap-2 flex-wrap">
              {/* Extract unique genres using Set */}
              {[...new Set(favourites.map((b) => b.genre))].map((g) => {
                // Find any book with this genre to use its spine colors
                const book = favourites.find((b) => b.genre === g);

                return (
                  <span
                    key={g}
                    className="text-[11px] px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: book.spineColor + "28",
                      color: book.spineText,
                      border: `1px solid ${book.spineColor}50`,
                    }}
                  >
                    {g}
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}