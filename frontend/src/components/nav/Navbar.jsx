/**
 * Navbar.jsx
 *
 * The main navigation bar for BookAtlas. Provides quick access to core
 * sections (Discover, Search, Library, Forums) and displays
 * authentication-related actions (Login, Register, Profile).
 *
 * Dependencies:
 * - NavLink: Route navigation + active styling.
 * - useAuth: Provides isAuthenticated and user.
 * - useUser: Provides profilePictureUrl for profile avatar rendering.
 * - NavButton: Reusable navigation button component.
 * - Icon: Generic icon component for fallback profile avatar.
 */

import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { useUser } from "../../hooks/user/useUser.js";
import { NavButton } from "./NavButton";
import Icon from "../generic/Icon.jsx";

const NAV_ITEMS = [
  { id: "discover", label: "Discover", path: "/" },
  { id: "library", label: "My Library", path: "/library" },
  { id: "forums", label: "Forums", path: "/forums" },
  { id: "search", label: "Search", path: "/search" },
];

/**
 * Navbar
 *
 * Renders the main navigation bar, including:
 * - Brand link
 * - Core navigation items
 * - Authentication buttons (Login/Register)
 * - Profile button when authenticated
 *
 * @returns {JSX.Element}
 */
export function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const { profilePictureUrl } = useUser();

  return (
    <nav className="sticky top-0 z-50 bg-nav-bar-bg backdrop-brightness-0 border-b border-nav-bar-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

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
            {/**
             * Profile Picture Rendering
             *
             * Displays either:
             * - A default icon when no profile picture is available.
             * - The user's profile picture when profilePictureUrl is present.
             *
             * profilePictureUrl is provided by useUser() and updates whenever:
             * - The user changes their profile picture.
             * - The page reloads and the provider refetches the image.
             */}
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