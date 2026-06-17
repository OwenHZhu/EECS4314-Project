import { BOOKS } from "../data/mockBook";
import { FAVOURITES_IDS } from "../data/mockUser";
import { BookCard } from "../components/BookCard";

export function FavouritesPage() {
  const favourites = FAVOURITES_IDS.map((id) =>
    BOOKS.find((b) => b.id === id),
  ).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
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

      {favourites.length === 0 ? (
        <div className="text-center py-24 text-[#333] text-sm">
          <p className="text-3xl mb-3">❤️</p>
          No favourites yet — mark books you love from your library.
        </div>
      ) : (
        <>
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

          <div className="border-t border-[#1a1a1a] pt-8">
            <p className="text-[12px] text-[#333] uppercase tracking-widest mb-4">
              Genres in your favourites
            </p>
            <div className="flex gap-2 flex-wrap">
              {[...new Set(favourites.map((b) => b.genre))].map((g) => {
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
