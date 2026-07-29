/**
 * SearchResult.jsx
 *
 * Renders a single search result item for the navbar or search page.
 * Displays book title, author, a single genre, and the book's cover image.
 * Clicking the result navigates to the individual book page.
 *
 * Props:
 * @param {object} book - Book data containing id, title, author, cover_image, and genre array.
 *
 * Dependencies:
 * - Link: Enables navigation to the book page
 */

import { Link } from "react-router-dom";

/**
 * SearchResult
 *
 * Displays a compact book result row with cover image,
 * title/author text, and a single genre label. The entire row is clickable
 * and navigates to `/books/:bookId`.
 *
 * @param {object} props
 * @param {object} props.book - Book object with id, title, author, cover_image, and genre array.
 * @returns {JSX.Element}
 */
export default function SearchResult({ book }) {
  // Only display the first genre to avoid overcrowding
  const primaryGenre =
    Array.isArray(book.genre) && book.genre.length > 0
      ? book.genre[0]
      : "Unknown";

  return (
    <Link
      to={`/books/${book.id}`}
      className="flex items-center justify-between px-3 py-2 hover:bg-[#1a1a1a] cursor-pointer"
    >
      {/* Left: Cover + title/author */}
      <div className="flex items-center gap-3">
        {/* Cover image */}
        <img
          src={book.cover_image}
          alt={`${book.title} cover`}
          className="w-8 h-12 object-cover rounded-sm"
        />

        {/* Title + author */}
        <div className="flex flex-col">
          <span className="text-xs text-[#e0e0e0] leading-tight">
            {book.title}
          </span>
          <span className="text-[10px] text-[#777] leading-tight">
            {book.author}
          </span>
        </div>
      </div>

      {/* Right: Genre */}
      <span className="text-[10px] text-tertiary uppercase tracking-wide">
        {primaryGenre}
      </span>
    </Link>
  );
}