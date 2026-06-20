import { MOCK_USER } from "../data/mockUser";

const NAV_ITEMS = [
  { id: "discover", label: "Discover" },
  { id: "library", label: "My Library" },
  { id: "wishlist", label: "Wishlist" },
  { id: "favourites", label: "Favourites" },
  { id: "forums", label: "Forums" },
  {id: "login", label: "Login"}
];

export function Navbar({ page, setPage }) {
  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1e1e1e]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <button
          onClick={() => setPage("discover")}
          className="flex items-center gap-2 shrink-0 group"
        >
          <span className="text-[15px] font-semibold tracking-tight text-[#f0f0f0] group-hover:text-white transition-colors">
            Book<span className="text-[#7c6af7]">Atlas</span>
          </span>
        </button>

        <div className="flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`px-3 py-1.5 rounded-lg text-[13px] whitespace-nowrap transition-colors ${
                page === item.id
                  ? "bg-[#1e1a38] text-[#b8b0ff]"
                  : "text-[#666] hover:text-[#aaa] hover:bg-[#161616]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPage("profile")}
          className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-colors shrink-0 ${
            page === "profile"
              ? "bg-[#1e1a38] border-[#7c6af7]/40 text-[#b8b0ff]"
              : "border-[#222] text-[#666] hover:border-[#333] hover:text-[#aaa]"
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-[#2d2845] flex items-center justify-center text-[10px] font-semibold text-[#b8b0ff]">
            {MOCK_USER.displayName[0]}
          </div>
          <span className="text-[13px]">{MOCK_USER.displayName}</span>
        </button>
      </div>
    </nav>
  );
}
