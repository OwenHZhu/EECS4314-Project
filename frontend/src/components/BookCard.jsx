/**
 * ./components/BookCard.jsx
 *
 * A component that displays a compact visual summary of a book.
 * The card includes the book's title, author, genre, and rating, along with
 * dynamic styling based on the book's spine color and text color.
 *
 * Dependencies:
 * - GENRE_LABELS: A mapping of genre keys to human-readable labels, imported
 *   from mockBook data. Used to display the genre tag.
 *
 * Props:
 * @param {Object} book - The book object containing all display information.
 * @param {string} book.title - The book's title.
 * @param {string} book.author - The author's name.
 * @param {string} book.genre - Genre key used to look up a label in GENRE_LABELS.
 * @param {number} book.rating - Numeric rating displayed on the card.
 * @param {string} book.spineColor - Hex color used for the spine background and accents.
 * @param {string} book.spineText - Text color used on the spine.
 *
 * Notes:
 * - This component is purely visual and does not manage state.
 * - The entire card is clickable (`cursor-pointer`) and can be wrapped in a
 *   navigation link by the parent component.
 * - TailwindCSS utility classes are used for layout, spacing, and color styling.
 */
import { GENRE_LABELS } from "../data/mockBook";

export function BookCard({ book }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden cursor-pointer hover:border-[#3d3d3d] hover:-translate-y-0.5 transition-all duration-150">

      {/* Book spine section with dynamic colors */}
      <div
        className="w-full h-[120px] flex items-center justify-center px-3 text-xs font-medium text-center leading-snug"
        style={{ backgroundColor: book.spineColor, color: book.spineText }}
      >
        {book.title}
      </div>

      {/* Book details section */}
      <div className="p-3 space-y-1.5">
        <p className="text-sm font-medium text-[#f0f0f0] leading-tight">
          {book.title}
        </p>

        <p className="text-xs text-[#666]">{book.author}</p>

        <div className="flex items-center justify-between pt-0.5">

          {/* Genre tag with semi-transparent background */}
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: book.spineColor + "30",
              color: book.spineText,
              border: `1px solid ${book.spineColor}60`,
            }}
          >
            {GENRE_LABELS[book.genre]}
          </span>

          {/* Rating */}
          <span className="text-[11px] text-[#666]">★ {book.rating}</span>
        </div>
      </div>
    </div>
  );
}