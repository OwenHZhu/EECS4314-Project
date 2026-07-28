// components/books/BookCard.jsx

import Icon from "../generic/Icon";
import RatingStars from "../generic/RatingStars";

export function BookCard({ book, onClick }) {

  const genreLabel = Array.isArray(book.genre)
    ? book.genre[0]
    : book.genre || "Unknown";

  const ratingAverage =
    book.library_stats?.ratings?.average ??
    book.rating ??
    0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        w-full max-w-[160px]
        overflow-hidden
        rounded-[22px]
        border border-secondary
        bg-background
        text-left
        transition-all duration-200
        hover:-translate-y-1
        hover:border-book-favourite
        focus:outline-none
        focus:ring-2
        focus:ring-secondary/50
      "
    >
      {/* Cover image */}
      <div
        className="
          h-[150px]
          w-full
          overflow-hidden
          rounded-b-[22px]
          bg-card-fill
        "
      >
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={`${book.title} cover`}
            className="
              h-full
              w-full
              object-cover
              object-top
              transition-transform
              duration-300
              group-hover:scale-[1.02]
            "
          />
        ) : (
          <div
            className="
              flex h-full w-full
              items-center justify-center
              px-4 text-center
              text-sm font-semibold
              leading-snug text-primary
            "
          >
            {book.title}
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="px-3.5 pb-4 pt-3">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <h3
              className="
                truncate
                text-[15px]
                font-semibold
                leading-tight
                text-primary
              "
            >
              {book.title}
            </h3>

            <p className="mt-0.5 truncate text-[13px] text-tertiary">
              {book.author}
            </p>
          </div>

          {/* Icons */}
          <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
            <Icon className="text-[17px] text-book-favourite">
              favorite_border
            </Icon>

            <Icon className="text-[17px] text-book-rating">
              bookmark_border
            </Icon>

            <Icon className="text-[17px] text-book-status-read">
              menu_book
            </Icon>
          </div>
        </div>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1">
          <RatingStars
            value={ratingAverage}
            sizeClassName="text-[13px]"
            ariaLabel={`Average rating ${ratingAverage} out of 5`}
          />

          <span className="text-[11px] text-tertiary">
            {Number(ratingAverage).toFixed(1)}
          </span>
        </div>

        {/* Genre */}
        {genreLabel && (
          <span
            className="
              mt-2 inline-flex
              rounded-full
              border border-secondary
              bg-secondary/15
              px-2.5 py-0.5
              text-[10px] font-medium
              text-tertiary
            "
          >
            {genreLabel}
          </span>
        )}
      </div>
    </button>
  );
}