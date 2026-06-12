import { GENRE_LABELS } from "../data/mockBook";

export function BookCard({ book }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden cursor-pointer hover:border-[#3d3d3d] hover:-translate-y-0.5 transition-all duration-150">
      <div
        className="w-full h-[120px] flex items-center justify-center px-3 text-xs font-medium text-center leading-snug"
        style={{ backgroundColor: book.spineColor, color: book.spineText }}
      >
        {book.title}
      </div>

      <div className="p-3 space-y-1.5">
        <p className="text-sm font-medium text-[#f0f0f0] leading-tight">
          {book.title}
        </p>
        <p className="text-xs text-[#666]">{book.author}</p>
        <div className="flex items-center justify-between pt-0.5">
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: book.spineColor + "30",
              color: book.spineText,
              border: `1px solid ${book.spineColor}60`,
            }}
          >
            {GENRE_LABELS[book.genre]}
          </span>
          <span className="text-[11px] text-[#666]">★ {book.rating}</span>
        </div>
      </div>
    </div>
  );
}
