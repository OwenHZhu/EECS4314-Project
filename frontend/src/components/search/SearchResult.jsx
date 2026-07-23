/**
 * SearchResult.jsx
 *
 * Renders a single search result item for the navbar or search page.
 * Displays book title, author, genre, and a placeholder cover.
 *
 * Props:
 * @param {object} book - Book data containing title, author, and genre.
 *
 * Dependencies:
 * - None (pure presentational component)
 */

 /**
  * SearchResult
  *
  * Displays a compact book result row with cover placeholder,
  * title/author text, and genre label.
  *
  * @param {object} props
  * @param {object} props.book - Book object with title, author, and genre.
  * @returns {JSX.Element}
  */
export default function SearchResult({ book }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 hover:bg-[#1a1a1a] cursor-pointer">

      {/* Left: Cover + title/author */}
      <div className="flex items-center gap-3">
        {/* Placeholder cover */}
        <div className="w-8 h-12 bg-[#2a2a2a] rounded-sm" />

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
        {book.genre}
      </span>
    </div>
  );
}