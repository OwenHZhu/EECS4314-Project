/**
 * ProfileLibraryItem.jsx
 *
 * Displays a single entry from a user's personal library on their profile.
 * Each entry represents the user's relationship to a specific book
 * (e.g., "reading", "completed", "wishlist") and shows:
 *
 * - Book cover
 * - Title and author
 * - User's status for that book
 * - Last updated date
 *
 * Props:
 * @param {object} entry
 *   The library entry object containing:
 *   - book: { id, title, author, cover_image }
 *   - status: string (e.g., "reading", "completed")
 *   - updated_at: timestamp
 *
 */

export default function ProfileLibraryItem({ entry }) {
  const book = entry.book;

  return (
    <div className="flex flex-row items-start gap-3 py-2 border-b border-[#1e1e1e]">
      <img
        src={book.cover_image}
        alt={book.title}
        className="w-14 h-20 object-cover rounded-md"
      />

      <div className="flex flex-col flex-1">
        <h3 className="text-sm text-[#F9EDCC] font-semibold">
          {book.title}
        </h3>

        <p className="text-xs text-[#BFB8AD]">
          {book.author}
        </p>

        <p className="text-xs text-[#777] mt-1 capitalize">
          Status: {entry.status}
        </p>

        <p className="text-xs text-[#555]">
          Updated: {new Date(entry.updated_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}