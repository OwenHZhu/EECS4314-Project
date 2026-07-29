/**
 * ./pages/books/BookPage.jsx
 *
 * Book details page used by the View More flow.
 *
 * The page reads the book ID from the route, requests the selected book from
 * the Book Service, and displays the book's main details. This keeps the page
 * connected to the same backend data source used by the Discover page.
 *
 * Dependencies:
 * - useParams (React Router): Reads the book ID from the URL.
 * - useEffect, useState (React): Manage book data, loading state, and errors.
 * - getBookById: Frontend API helper used to request one book from the Book Service.
 * - BookStatusDropdown: Reusable dropdown for selecting reading status.
 * - RatingStars: Reusable star display/rating component.
 * - useLibrary: Library context hook used to save status, favourites, and ratings.
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookById } from "../../api/books/bookService";
import BookStatusDropdown from "../../components/books/BookStatusDropdown";
import BookForumSection from "./components/BookForumSection";
import RatingStars from "../../components/generic/RatingStars";
import Icon from "../../components/generic/Icon";
import { useAuth } from "../../hooks/auth/useAuth";
import { useLibrary } from "../../hooks/library/useLibrary";

function getRatings(book) {
  return book?.library_stats?.ratings ?? {};
}

function getDistributionCount(distribution, star) {
  const entry = distribution?.[star];

  if (typeof entry === "number") {
    return entry;
  }

  if (typeof entry?.count === "number") {
    return entry.count;
  }

  return 0;
}

function getDistributionPercentage(distribution, star) {
  const entry = distribution?.[star];

  return typeof entry?.percentage === "number"
    ? entry.percentage
    : null;
}


export default function BookPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Library context actions used to persist user-specific book interactions
  const {
    library,
    addLibraryEntry,
    updateLibraryEntry,
  } = useLibrary();

  // Selected book returned from the Book Service
  const [book, setBook] = useState(null);

  // Indicates whether the page is currently loading book details
  const [loading, setLoading] = useState(true);

  // Stores any Book Service request error message
  const [error, setError] = useState("");

  // Stores any Library Service request error message
  const [libraryError, setLibraryError] = useState("");

  // Indicates whether a Library Service action is currently saving
  const [savingLibraryAction, setSavingLibraryAction] = useState(false);

  // Local UI state synced with the user's Library Service entry
  const [readingStatus, setReadingStatus] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [isFavourite, setIsFavourite] = useState(false);

  const existingLibraryEntry = Array.isArray(library)
    ? library.find((entry) => entry.book_id === bookId)
    : null;

  useEffect(() => {
    async function loadBook() {
      try {
        setLoading(true);
        setError("");

        const selectedBook = await getBookById(bookId);

        setBook(selectedBook);
      } catch (requestError) {
        setBook(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load book details.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [bookId]);

  useEffect(() => {
    if (!existingLibraryEntry) {
      setReadingStatus(null);
      setUserRating(0);
      setIsFavourite(false);
      return;
    }

    setReadingStatus(existingLibraryEntry.status ?? null);
    setUserRating(existingLibraryEntry.rating ?? 0);
    setIsFavourite(Boolean(existingLibraryEntry.is_favourite));
  }, [existingLibraryEntry]);

  function handleAuthRequired() {
    navigate("/login");
  }

  async function saveLibraryChange({
    nextStatus = readingStatus,
    nextFavourite = isFavourite,
    nextRating = userRating,
  }) {
    if (!isAuthenticated) {
      handleAuthRequired();
      return;
    }

    if (!book) {
      return;
    }

    try {
      setSavingLibraryAction(true);
      setLibraryError("");

      const statusToSave = nextStatus || "wishlist";
      const ratingToSave = nextRating || null;

      if (existingLibraryEntry) {
        await updateLibraryEntry(
          book.id,
          statusToSave,
          nextFavourite,
          ratingToSave,
        );
      } else {
        await addLibraryEntry(
          book.id,
          statusToSave,
          nextFavourite,
          ratingToSave,
        );
      }
    } catch (requestError) {
      setLibraryError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update your library.",
      );
    } finally {
      setSavingLibraryAction(false);
    }
  }

  async function handleStatusChange(nextStatus) {
    if (!isAuthenticated) {
      handleAuthRequired();
      return;
    }

    setReadingStatus(nextStatus);

    await saveLibraryChange({
      nextStatus,
    });
  }

  async function handleFavouriteClick() {
    if (!isAuthenticated) {
      handleAuthRequired();
      return;
    }

    const nextFavourite = !isFavourite;
    setIsFavourite(nextFavourite);

    await saveLibraryChange({
      nextFavourite,
    });
  }

  async function handleRatingChange(nextRating) {
    if (!isAuthenticated) {
      handleAuthRequired();
      return;
    }

    setUserRating(nextRating);
    setReadingStatus("read");

    await saveLibraryChange({
      nextRating,
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-primary">
        <p className="text-sm text-tertiary">Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-primary">
        <h1 className="text-3xl font-semibold">Book not found</h1>
        <p className="mt-3 text-tertiary">
          {error || "The selected book could not be found."}
        </p>
      </div>
    );
  }
  const ratings = getRatings(book);
  const averageRating = ratings?.average ?? 0;
  const totalRatings = ratings?.total_ratings ?? 0;
  const distribution = ratings?.distribution ?? {};
  const wishlistCount = book.library_stats?.wishlist_count ?? 0;
  const readingCount = book.library_stats?.reading_count ?? 0;

 


  // Fallback max count (only used if percentage is missing)
  const maxDistributionCount = Math.max(
    1,
    ...[1, 2, 3, 4, 5].map((star) => getDistributionCount(distribution, star))
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 text-primary">
      <p className="mb-8 text-[11px] uppercase tracking-[0.25em] text-caption">
        Book Details
      </p>

      {libraryError && (
        <div className="mb-5 rounded-lg border border-secondary bg-error-bg px-4 py-3 text-sm text-error-text">
          {libraryError}
        </div>
      )}

      {savingLibraryAction && (
        <p className="mb-5 text-xs text-tertiary">
          Saving library update...
        </p>
      )}

      <section className="grid gap-8 border-b border-secondary/40 pb-8 md:grid-cols-[190px_1fr]">
        {/* Left column: cover, add button, and personal rating */}
        <aside>
          <div className="overflow-hidden rounded-2xl border border-secondary bg-card-fill">
            {book.cover_image ? (
              <img
                src={book.cover_image}
                alt={`${book.title} cover`}
                className="h-[280px] w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-[280px] items-center justify-center px-6 text-center text-lg font-semibold">
                {book.title}
              </div>
            )}
          </div>

          <div className="mt-4">
            <BookStatusDropdown
              status={readingStatus}
              onStatusChange={handleStatusChange}
              isAuthenticated={isAuthenticated}
              onAuthRequired={handleAuthRequired}
            />
          </div>

          <div className="mt-4">
            <RatingStars
              value={userRating}
              onChange={handleRatingChange}
              sizeClassName="text-base"
              ariaLabel="Rate this book"
            />
            <p className="mt-1 text-[11px] text-tertiary">
              Rate This Book
            </p>
          </div>
        </aside>

        {/* Right column: book information */}
        <main>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold leading-tight">
                {book.title}
              </h1>

              <p className="mt-2 text-lg text-tertiary">
                {book.author}
              </p>
            </div>

            <button
              type="button"
              onClick={handleFavouriteClick}
              aria-label={
                isFavourite ? "Remove from favourites" : "Add to favourites"
              }
              className="text-book-favourite transition-transform hover:scale-110 focus:outline-none"
            >
              <Icon filled={isFavourite} className="text-2xl">
                favorite
              </Icon>
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <RatingStars
              value={averageRating}
              sizeClassName="text-sm"
              ariaLabel={`Average rating ${averageRating} out of 5`}
            />
            <span className="text-sm text-tertiary">
              {Number(averageRating).toFixed(1)} • {totalRatings} rating
              {totalRatings === 1 ? "" : "s"}
            </span>
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-6 text-tertiary">
            {book.description || "No description is currently available."}
          </p>

          <div className="mt-6 grid gap-3 text-xs text-tertiary sm:grid-cols-2">
            {book.series && (
              <p>
                <span className="text-primary">Series:</span>{" "}
                {book.series}
              </p>
            )}

            {book.time_period && (
              <p>
                <span className="text-primary">Time Period:</span>{" "}
                {book.time_period}
              </p>
            )}

            {book.page_count && (
              <p>
                <span className="text-primary">Pages:</span>{" "}
                {book.page_count}
              </p>
            )}

            {book.published_date && (
              <p>
                <span className="text-primary">Published:</span>{" "}
                {book.published_date}
              </p>
            )}

            {book.publisher && (
              <p>
                <span className="text-primary">Publisher:</span>{" "}
                {book.publisher}
              </p>
            )}

            {book.isbn && (
              <p>
                <span className="text-primary">ISBN:</span>{" "}
                {book.isbn}
              </p>
            )}
          </div>

          {Array.isArray(book.genre) && book.genre.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {book.genre.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-secondary bg-secondary/15 px-3 py-1 text-xs text-tertiary"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="mt-7 grid grid-cols-2 gap-4 border-t border-b border-secondary/40 py-4 text-center text-xs text-tertiary">
            <div>
              <p className="text-xl font-semibold text-primary">
                {readingCount}
              </p>
              <p>people are currently reading</p>
            </div>

            <div>
              <p className="text-xl font-semibold text-primary">
                {wishlistCount}
              </p>
              <p>people have this in their wishlist</p>
            </div>
          </div>
        </main>
      </section>

      {/* Community ratings section */}
      <section className="mt-8 border-b border-secondary/40 pb-8">
        <h2 className="text-sm font-semibold">Community Ratings</h2>

        <div className="mt-3 flex items-center gap-2">
          <RatingStars
            value={averageRating}
            sizeClassName="text-sm"
            ariaLabel={`Community rating ${averageRating} out of 5`}
          />
          <span className="text-sm text-tertiary">
            {Number(averageRating).toFixed(1)}
          </span>
          <span className="text-xs text-caption">
            {totalRatings} ratings
          </span>
        </div>

        <div className="mt-4 max-w-xl space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = getDistributionCount(distribution, star);

            const percentage = getDistributionPercentage(distribution, star);
            const widthPercentage =
              percentage !== null
                ? percentage
                : (count / maxDistributionCount) * 100;

            return (
              <div
                key={star}
                className="grid grid-cols-[55px_1fr_60px] items-center gap-3 text-xs text-tertiary"
              >
                <span>{star} stars</span>

                <div className="h-2 overflow-hidden rounded-full bg-card-fill">
                  <div
                    className="h-full rounded-full bg-book-rating"
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>

                <span className="text-caption">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Discussion preview section */}
      <section className="mt-8">
        <BookForumSection bookId={bookId} />
      </section>
    </div>
  );
}