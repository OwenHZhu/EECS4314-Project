/**
 * This component handles the modal UI and local interaction state.
 *
 * It receives a book object through props and displays the book's information,
 * rating summary, reading status, favourite state, and personal rating control.
 *
 * The modal does not directly call the Book Service or Library Service.
 * Parent pages can connect backend behaviour through these callback props:
 * - onFavouriteChange
 * - onStatusChange
 * - onRatingChange
 * - onViewMore
 */
import { useEffect, useMemo, useState } from "react";
import Icon from "../generic/Icon";
import RatingStars from "../generic/RatingStars";
import BookStatusDropdown from "./BookStatusDropdown";

const MAX_DESCRIPTION_LENGTH = 280;

/**
 * Shortens long descriptions so the modal stays close to the Figma layout.
 */
function getShortDescription(description) {
  if (!description) {
    return "No description is currently available.";
  }

  if (description.length <= MAX_DESCRIPTION_LENGTH) {
    return description;
  }

  return `${description.slice(0, MAX_DESCRIPTION_LENGTH).trim()}...`;
}

/**
 * Safely reads rating data from the Book Service library_stats object.
 */
function getRatingStats(book) {
  const ratings = book?.library_stats?.ratings;

  return {
    average: ratings?.average ?? 0,
    totalRatings: ratings?.total_ratings ?? 0,
  };
}

export default function BookDetailsModal({
  book,
  isOpen,
  onClose,
  onViewMore,
  initialFavourite = false,
  initialStatus = null,
  initialRating = 0,
  onFavouriteChange,
  onStatusChange,
  onRatingChange,
  isAuthenticated = false,
  onAuthRequired,
}) {
  const [isFavourite, setIsFavourite] = useState(initialFavourite);
  const [status, setStatus] = useState(initialStatus);
  const [userRating, setUserRating] = useState(initialRating);

  const { average, totalRatings } = getRatingStats(book);

  /**
   * Keeps the modal's local UI state synced with the user's saved library entry.
   *
   * This is needed because the modal receives saved favourite/status/rating
   * values from DiscoverPage. After refresh, those values may arrive from the
   * Library Service after the modal component has already mounted.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIsFavourite(initialFavourite);
    setStatus(initialStatus);
    setUserRating(initialRating);
  }, [isOpen, book?.id, initialFavourite, initialStatus, initialRating]);

  /**
   * Uses the book cover as the background with a dark overlay so text remains
   * readable. If no cover image is available, a dark fallback gradient is used.
   */
  const backgroundStyle = useMemo(() => {
    if (!book?.cover_image) {
      return {
        background:
          "linear-gradient(155deg, #1E1615 0%, #070303 55%, #1E1615 100%)",
      };
    }

    return {
      backgroundImage: `
        linear-gradient(
          180deg,
          rgba(7, 3, 3, 0.72) 0%,
          rgba(7, 3, 3, 0.84) 55%,
          rgba(7, 3, 3, 0.94) 100%
        ),
        url("${book.cover_image}")
      `,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }, [book?.cover_image]);

  /**
   * Prevents background scrolling while the modal is open and lets Escape close
   * the modal.
   */
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !book) {
    return null;
  }

  const description = book.description || "";
  const shortDescription = getShortDescription(description);

  function handleFavouriteToggle() {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    const nextFavouriteState = !isFavourite;

    setIsFavourite(nextFavouriteState);
    onFavouriteChange?.(nextFavouriteState, book);
  }

  function handleStatusChange(nextStatus) {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    setStatus(nextStatus);
    onStatusChange?.(nextStatus, book);
  }

  function handleRatingChange(nextRating) {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    setUserRating(nextRating);
    setStatus("read");
    onRatingChange?.(nextRating, book);
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-background/80
        px-4 py-8
        backdrop-blur-sm
      "
      onMouseDown={handleBackdropClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-details-modal-title"
        className="
          relative
          min-h-[520px]
          w-full max-w-[390px]
          overflow-visible
          rounded-[28px]
          border border-secondary
          shadow-2xl
        "
        style={backgroundStyle}
      >
        <div className="flex min-h-[520px] flex-col p-7">
          {/* Header: title, author, favourite button, and close button */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2
                id="book-details-modal-title"
                className="
                  line-clamp-2
                  text-[26px]
                  font-semibold
                  leading-tight
                  text-primary
                "
              >
                {book.title}
              </h2>

              <p className="mt-1 text-sm text-tertiary">
                {book.author}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={handleFavouriteToggle}
                aria-label={
                  isFavourite
                    ? "Remove book from favourites"
                    : "Add book to favourites"
                }
                className="
                  transition-transform
                  hover:scale-110
                  focus:outline-none
                "
              >
                <Icon
                  filled={isFavourite}
                  className={
                  isFavourite
                  ? "text-book-favourite"
                  : "text-tertiary"
                }
              >
              favorite
        </Icon>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close book details modal"
                className="
                  text-tertiary
                  transition-colors
                  hover:text-primary
                  focus:outline-none
                "
              >
                <Icon className="text-xl">
                  close
                </Icon>
              </button>
            </div>
          </div>

          {/* Average community rating */}
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <RatingStars
              value={average}
              sizeClassName="text-sm"
              ariaLabel={`Average rating ${average} out of 5`}
            />

            <span className="text-tertiary">
              {Number(average).toFixed(1)}
            </span>

            <span className="text-input">
              • {totalRatings.toLocaleString()} ratings
            </span>
          </div>

          {/* Description */}
          <div className="mt-5">
            <p className="text-[12px] leading-[1.55] text-tertiary">
              {shortDescription}
            </p>

            <button
              type="button"
              onClick={() => onViewMore?.(book)}
              className="
                mt-3
                text-[10px]
                text-input
                transition-colors
                hover:text-primary
              "
            >
              View More
            </button>
          </div>

          {/* Bottom actions: library status and personal rating */}
          <div className="mt-auto pt-8">
            <div
              className="
                flex items-end justify-between gap-4
                border-t border-card-stroke
                pt-5
              "
            >
              <BookStatusDropdown
                status={status}
                onStatusChange={handleStatusChange}
                isAuthenticated={isAuthenticated}
                onAuthRequired={onAuthRequired}
              />

              <div className="flex flex-col items-center gap-1">
                <RatingStars
                  value={userRating}
                  onChange={handleRatingChange}
                  sizeClassName="text-lg"
                  ariaLabel="Rate this book"
                />

                <span className="text-[8px] text-input">
                  Rate This Book
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}