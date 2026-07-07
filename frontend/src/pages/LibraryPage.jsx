/**
 * ./pages/LibraryPage.jsx
 *
 * Displays the user's entire reading library, grouped by reading status.
 * This page provides:
 *
 * 1. **Status‑grouped book sections**
 *    - Uses `STATUSES` to iterate through all possible reading states:
 *      "reading", "read", "want", "dropped".
 *    - For each status, filters entries from `LIBRARY`.
 *    - If a status has no entries, that section is skipped.
 *
 * 2. **Book rendering**
 *    - Each entry is matched to a full book object using `getBook()`.
 *    - Books are displayed using the `BookCard` component.
 *    - Each card receives:
 *        - A status badge (label + colors)
 *        - Optional extra UI (rating stars, progress bar, dropped info)
 *
 * 3. **Extra UI for entries**
 *    - `StarRating`: Shows 1–5 stars based on `userRating`.
 *    - `ProgressBar`: Shows reading progress for "reading" status.
 *    - Additional text:
 *        - “X% complete” for reading
 *        - “Stopped at X%” for dropped
 *
 * 4. **Status styling**
 *    - Uses `STATUS_LABELS` and `STATUS_COLORS` from mock data.
 *    - Each status section displays a colored badge matching its theme.
 *
 * Dependencies:
 * - `BOOKS`: Full mock book catalog.
 * - `LIBRARY`: User’s reading entries (status, rating, progress).
 * - `BookCard`: Component for rendering book tiles.
 * - `STATUS_LABELS`, `STATUS_COLORS`: Human‑readable labels + color presets.
 *
 * Behaviour:
 * - No user interaction or navigation.
 */

import { BOOKS, STATUS_LABELS, STATUS_COLORS } from "../data/mockBook";
import { LIBRARY } from "../data/mockUser";
import { BookCard } from "../components/BookCard";

// All possible reading statuses to display
const STATUSES = ["reading", "read", "want", "dropped"];

/**
 * StarRating
 *
 * Displays a 1–5 star rating based on the user's rating value.
 * Filled stars use gold color; empty stars use a muted gray.
 */
function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`text-[12px] ${s <= rating ? "text-[#f5a623]" : "text-[#2a2a2a]"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * ProgressBar
 *
 * Displays a horizontal progress bar representing reading progress.
 * Used only for "reading" status entries.
 */
function ProgressBar({ value }) {
  return (
    <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
      <div
        className="h-full bg-[#7c6af7] rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function LibraryPage() {
  // Helper to find a book object by ID
  const getBook = (id) => BOOKS.find((b) => b.id === id);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <title>My Library | BookAtlas</title>

      {/* Header section */}
      <div className="mb-10">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#444] mb-2">
          My Library
        </p>
        <h1 className="text-[40px] font-semibold tracking-tight text-[#f0f0f0]">
          Your books
        </h1>
        <p className="text-[14px] text-[#444] mt-2">
          {LIBRARY.length} books tracked across all statuses
        </p>
      </div>

      {/* Status sections */}
      <div className="space-y-10">
        {STATUSES.map((status) => {
          // Filter entries belonging to this status
          const entries = LIBRARY.filter((e) => e.status === status);

          // Skip empty sections
          if (!entries.length) return null;

          // Status color preset
          const colors = STATUS_COLORS[status];

          return (
            <section key={status}>
              {/* Status header */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium border"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    borderColor: colors.border,
                  }}
                >
                  {STATUS_LABELS[status]}
                </span>

                <span className="text-[12px] text-[#333]">
                  {entries.length} book{entries.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Books grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {entries.map((entry) => {
                  const book = getBook(entry.bookId);
                  if (!book) return null;

                  return (
                    <BookCard
                      key={entry.bookId}
                      book={book}
                      badge={STATUS_LABELS[status]}
                      badgeStyle={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                        borderColor: colors.border,
                      }}
                      extra={
                        <div className="space-y-1.5">
                          {/* User rating stars */}
                          {entry.userRating && (
                            <StarRating rating={entry.userRating} />
                          )}

                          {/* Reading progress bar */}
                          {status === "reading" && (
                            <ProgressBar value={entry.progress} />
                          )}

                          {/* Reading progress text */}
                          {status === "reading" && (
                            <p className="text-[10px] text-[#444]">
                              {entry.progress}% complete
                            </p>
                          )}

                          {/* Dropped progress text */}
                          {status === "dropped" && entry.progress > 0 && (
                            <p className="text-[10px] text-[#444]">
                              Stopped at {entry.progress}%
                            </p>
                          )}
                        </div>
                      }
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}