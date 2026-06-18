import { BOOKS, STATUS_LABELS, STATUS_COLORS } from "../data/mockBook";
import { LIBRARY } from "../data/mockUser";
import { BookCard } from "../components/BookCard";

const STATUSES = ["reading", "read", "want", "dropped"];

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
  const getBook = (id) => BOOKS.find((b) => b.id === id);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
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

      <div className="space-y-10">
        {STATUSES.map((status) => {
          const entries = LIBRARY.filter((e) => e.status === status);
          if (!entries.length) return null;
          const colors = STATUS_COLORS[status];
          return (
            <section key={status}>
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
                          {entry.userRating && (
                            <StarRating rating={entry.userRating} />
                          )}
                          {status === "reading" && (
                            <ProgressBar value={entry.progress} />
                          )}
                          {status === "reading" && (
                            <p className="text-[10px] text-[#444]">
                              {entry.progress}% complete
                            </p>
                          )}
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
