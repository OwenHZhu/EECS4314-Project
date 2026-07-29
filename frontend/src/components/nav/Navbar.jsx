/**
 * Navbar.jsx
 *
 * Main navigation bar for BookAtlas. Provides quick access to core sections:
 * - Discover
 * - My Library
 * - Forums
 * - Search
 *
 * Also displays authentication actions (Login/Register) or the user's profile
 * when authenticated. Includes a desktop search bar with quick results.
 *
 * Dependencies:
 * - NavLink: Routing + active styling
 * - useAuth: Provides isAuthenticated and user
 * - useUser: Provides profilePictureUrl
 * - useBookSearch: Fetches search results for the navbar search bar
 * - NavButton: Reusable navigation button
 * - SearchBar, SearchResult: Search UI components
 * - Icon: Fallback profile avatar
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { useUser } from "../../hooks/user/useUser.js";
import { useBookSearch } from "../../hooks/books/useBookSearch.js";
import { NavButton } from "./NavButton";
import SearchResult from "../search/SearchResult.jsx";
import Icon from "../generic/Icon.jsx";
import SearchBar from "../search/SearchBar.jsx";

const NAV_ITEMS = [
  { id: "discover", label: "Discover", path: "/" },
  { id: "library", label: "My Library", path: "/library" },
  { id: "forums", label: "Forums", path: "/forums" },
  { id: "search", label: "Search", path: "/search" },
];

/**
 * Navbar
 *
 * Renders the main navigation bar including:
 * - Brand link
 * - Core navigation items
 * - Desktop search bar with quick results
 * - Login/Register buttons when unauthenticated
 * - Profile button with avatar when authenticated
 *
 * @returns {JSX.Element}
 */
export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { profilePictureUrl } = useUser();

  const [navQuery, setNavQuery] = useState("");
  const { results } = useBookSearch(navQuery, "all");
  const topResults = results.slice(0, 5);

  return (
    <nav className="sticky top-0 z-50 bg-nav-bar-bg backdrop-brightness-0 border-b border-nav-bar-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0 group">
          <span className="text-s font-semibold tracking-tight text-primary group-hover:text-white transition-colors">
            Book<span className="text-secondary">Atlas</span>
          </span>
        </NavLink>

        {/* Main Navigation Items */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1 justify-center">
          {NAV_ITEMS.map((item) => (
            <NavButton key={item.id} to={item.path}>
              {item.label}
            </NavButton>
          ))}
        </div>

        {/* Desktop Search Bar */}
        <div className="relative w-1/3 hidden md:block">
          <SearchBar
            className="mb-1"
            query={navQuery}
            setQuery={setNavQuery}
          />

          {navQuery && topResults.length > 0 && (
            <div className="absolute mt-2 w-full rounded-md bg-[#111] border border-[#222]">
              {topResults.map((book) => (
                <SearchResult key={book.id} book={book} />
              ))}
              <button
                onClick={() => navigate(`/search?query=${encodeURIComponent(navQuery)}`)}
                className="w-full text-left px-3 py-2 text-xs text-tertiary border-t border-[#222] hover:bg-[#1a1a1a]"
              >
                View more results
              </button>
            </div>
          )}
        </div>

        {/* Auth Buttons */}
        {!isAuthenticated && (
          <>
            <NavButton
              to="/login"
              rounded="rounded-full"
              className="flex items-center text-xs gap-2 px-3 py-1.5 border shrink-0"
            >
              Login
            </NavButton>

            <NavButton
              to="/register"
              rounded="rounded-full"
              className="flex items-center text-xs gap-2 px-3 py-1.5 border shrink-0"
            >
              Register
            </NavButton>
          </>
        )}

        {/* Profile Button */}
        {isAuthenticated && (
          <NavButton
            to="/profile"
            rounded="rounded-full"
            className="flex flex-row items-center gap-2 pl-2 pr-3 py-1.5 border shrink-0"
          >
            {/* Profile Picture Rendering */}
            {!profilePictureUrl && (
              <Icon className="text-secondary/60">
                account_circle
              </Icon>
            )}

            {profilePictureUrl && (
              <img
                src={profilePictureUrl}
                alt={`${user.username}'s profile picture`}
                className="rounded-full w-6 h-6"
              />
            )}

            <span className="text-xs text-tertiary">{user.username}</span>
          </NavButton>
        )}
      </div>
    </nav>
  );
}