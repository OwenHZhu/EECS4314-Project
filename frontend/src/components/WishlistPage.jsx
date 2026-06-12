import { BOOKS } from "../data/mockBook";
import { WISHLIST_IDS } from "../data/mockUser";
import { BookCard } from "./BookCard";

export function WishlistPage() {
  const wishlist = WISHLIST_IDS.map((id) =>
    BOOKS.find((b) => b.id === id),
  ).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#444] mb-2">
          Wishlist
        </p>
        <h1 className="text-[40px] font-semibold tracking-tight text-[#f0f0f0]">
          Want to read
        </h1>
        <p className="text-[14px] text-[#444] mt-2">
          {wishlist.length} books saved for later
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-24 text-[#333] text-sm">
          <p className="text-3xl mb-3">📋</p>
          Your wishlist is empty — add books from Discover.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {wishlist.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              badge="Want to Read"
              badgeStyle={{
                backgroundColor: "#1e1e1a",
                color: "#facc15",
                borderColor: "#854d0e",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
