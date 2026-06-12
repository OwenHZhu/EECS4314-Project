import { BOOKS, STATUS_LABELS, STATUS_COLORS } from "../data/mockBook";
import { MOCK_USER, LIBRARY, FAVOURITES_IDS } from "../data/mockUser";

function StatCard({ value, label }) {
  return (
    <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4 text-center">
      <p className="text-[24px] font-semibold text-[#f0f0f0]">{value}</p>
      <p className="text-[11px] text-[#444] mt-0.5">{label}</p>
    </div>
  );
}

export function ProfilePage() {
  const favourites = FAVOURITES_IDS.map((id) =>
    BOOKS.find((b) => b.id === id),
  ).filter(Boolean);
  const readCount = LIBRARY.filter((e) => e.status === "read").length;
  const readingCount = LIBRARY.filter((e) => e.status === "reading").length;
  const avgRating = (
    LIBRARY.filter((e) => e.userRating).reduce(
      (sum, e) => sum + e.userRating,
      0,
    ) / LIBRARY.filter((e) => e.userRating).length
  ).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-start gap-5 mb-10 pb-10 border-b border-[#1a1a1a]">
        <div className="w-16 h-16 rounded-full bg-[#2d2845] flex items-center justify-center text-2xl font-semibold text-[#b8b0ff] shrink-0">
          {MOCK_USER.displayName[0]}
        </div>
        <div>
          <h1 className="text-[28px] font-semibold text-[#f0f0f0] leading-tight">
            {MOCK_USER.displayName}
          </h1>
          <p className="text-[13px] text-[#444] mt-0.5">
            @{MOCK_USER.username} · joined {MOCK_USER.joined}
          </p>
          <p className="text-[13px] text-[#666] mt-2">{MOCK_USER.bio}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatCard value={readCount} label="Books finished" />
        <StatCard value={readingCount} label="Currently reading" />
        <StatCard value={LIBRARY.length} label="Total tracked" />
        <StatCard value={avgRating} label="Avg rating given" />
      </div>

      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-widest text-[#333] mb-4">
          Reading breakdown
        </p>
        <div className="flex gap-2 flex-wrap">
          {["reading", "read", "want", "dropped"].map((s) => {
            const count = LIBRARY.filter((e) => e.status === s).length;
            const colors = STATUS_COLORS[s];
            return (
              <div
                key={s}
                className="px-3 py-2 rounded-xl border flex items-center gap-2"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                }}
              >
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: colors.text }}
                >
                  {count}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: colors.text + "aa" }}
                >
                  {STATUS_LABELS[s]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-widest text-[#333] mb-4">
          Favourite books
        </p>
        <div className="flex gap-3 flex-wrap">
          {favourites.map((book) => (
            <div
              key={book.id}
              className="flex items-center gap-2.5 bg-[#141414] border border-[#1e1e1e] rounded-xl px-3 py-2"
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-medium"
                style={{
                  backgroundColor: book.spineColor,
                  color: book.spineText,
                }}
              >
                {book.title[0]}
              </div>
              <div>
                <p className="text-[12px] text-[#ccc] font-medium">
                  {book.title}
                </p>
                <p className="text-[10px] text-[#444]">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
