import { BOOKS } from "../data/mockBook";
import { FORUMS } from "../data/mockUser";

const CATEGORY_STYLES = {
  spoilers: {
    bg: "#2e1a1a",
    text: "#f87171",
    border: "#991b1b",
    label: "Spoilers",
  },
  questions: {
    bg: "#1a1a2e",
    text: "#818cf8",
    border: "#3730a3",
    label: "Questions",
  },
  theories: {
    bg: "#1a2a1a",
    text: "#4ade80",
    border: "#166534",
    label: "Theories",
  },
};

export function ForumsPage() {
  const getBook = (id) => BOOKS.find((b) => b.id === id);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#444] mb-2">
          Community
        </p>
        <h1 className="text-[40px] font-semibold tracking-tight text-[#f0f0f0]">
          Forums
        </h1>
        <p className="text-[14px] text-[#444] mt-2">
          Discuss, theorize, and ask questions about your favourite books.
        </p>
      </div>

      <div className="flex gap-3 mb-8">
        {Object.entries(CATEGORY_STYLES).map(([key, s]) => (
          <span
            key={key}
            className="text-[11px] px-2.5 py-1 rounded-full border font-medium"
            style={{
              backgroundColor: s.bg,
              color: s.text,
              borderColor: s.border,
            }}
          >
            {s.label}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {FORUMS.map((thread) => {
          const book = getBook(thread.bookId);
          const cat = CATEGORY_STYLES[thread.category];
          return (
            <div
              key={thread.id}
              className="bg-[#141414] border border-[#1e1e1e] rounded-xl px-4 py-3.5 hover:border-[#2a2a2a] transition-colors cursor-pointer flex items-center gap-4"
            >
              {book && (
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: book.spineColor }}
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0"
                    style={{
                      backgroundColor: cat.bg,
                      color: cat.text,
                      borderColor: cat.border,
                    }}
                  >
                    {cat.label}
                  </span>
                  {book && (
                    <span className="text-[11px] text-[#444] shrink-0">
                      {book.title}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#ccc] truncate">
                  {thread.title}
                </p>
                <p className="text-[11px] text-[#3a3a3a] mt-0.5">
                  by {thread.author}
                </p>
              </div>

              <div className="flex gap-5 shrink-0 text-right">
                <div>
                  <p className="text-[13px] font-medium text-[#888]">
                    {thread.replies}
                  </p>
                  <p className="text-[10px] text-[#333]">replies</p>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#888]">
                    {thread.views}
                  </p>
                  <p className="text-[10px] text-[#333]">views</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-[11px] text-[#333]">{thread.lastActive}</p>
                  <p className="text-[10px] text-[#2a2a2a]">last active</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border border-dashed border-[#222] rounded-xl p-6 text-center">
        <p className="text-[13px] text-[#444] mb-1">Got something to say?</p>
        <p className="text-[11px] text-[#333]">
          Thread creation coming once the backend is live.
        </p>
      </div>
    </div>
  );
}
