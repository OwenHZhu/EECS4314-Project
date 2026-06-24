import { NavLink } from "react-router-dom";
import { useAuth } from "../context/auth/useAuth";

import { MOCK_USER } from "../data/mockUser";

const NAV_ITEMS = [
  { id: "discover", label: "Discover", path: "/", auth: "any" },
  { id: "library", label: "My Library", path: "/library", auth: "user" },
  { id: "wishlist", label: "Wishlist", path: "/wishlist", auth: "user" },
  { id: "favourites", label: "Favourites", path: "/favourites", auth: "user" },
  { id: "forums", label: "Forums", path: "/forums", auth: "any" },
];

export function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-nav-bar-bg backdrop-blur-md border-b border-nav-bar-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

        <NavLink to="/" className="flex items-center gap-2 shrink-0 group">
          <span className="text-s font-semibold tracking-tight text-primary group-hover:text-white transition-colors">
            Book<span className="text-secondary">Atlas</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-1 overflow-x-auto flex-1 justify-center">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${isActive
                  ? "bg-nav-active-bg text-nav-active-text"
                  : "text-nav-text hover:text-nav-hover-text hover:bg-nav-active-bg"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {isAuthenticated &&
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-colors shrink-0 ${isActive
                ? "bg-nav-active-bg border-nav-active-border text-active-text"
                : "border-nav-border text-nav-text hover:border-nav-hover-border hover:text-nav-hover-text"
              }`
            }
          >
            <div className="w-6 h-6 rounded-full bg-[#2d2845] flex items-center justify-center text-xs font-semibold text-[#b8b0ff]">
              {MOCK_USER.displayName[0]}
            </div>
            <span className="text-xs text-tertiary">{MOCK_USER.displayName}</span>
          </NavLink>
        }
      </div>
    </nav>
  );
}