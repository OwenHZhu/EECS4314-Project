/**
 * ./components/nav/Navbar.jsx
 *
 * The main navigation bar for the BookAtlas application. It provides
 * quick access to core sections such as Discover, Library, Wishlist,
 * Favourites, and Forums, and displays authentication-related actions
 * (Login, Register, Profile) based on the user's auth state.
 *
 * Dependencies:
 * - NavLink (react-router-dom): Used for navigation and active-route styling.
 * - useAuth: Custom authentication hook providing `isAuthenticated` and `user`,
 *   enabling the navbar to show either auth buttons or the user's profile button.
 * - NavButton: Reusable navigation button component that applies default
 *   styling for standard nav items while allowing custom styling overrides
 *   for Login, Register, and Profile buttons.
 *
 * NAV_ITEMS Structure:
 * Each item includes:
 *   - id: Unique identifier
 *   - label: Text displayed in the navbar
 *   - path: Route to navigate to
 *   - auth: Currently unused; all nav items are displayed regardless of
 *           authentication status, but the field remains available for
 *           future conditional rendering if needed.
 *
 * Behaviour:
 * - All main navigation items are always displayed.
 * - When unauthenticated, Login and Register buttons are shown.
 * - When authenticated, a Profile button is shown, displaying the user's
 *   initial and username.
 *
 * Notes:
 * - The navbar is sticky and remains at the top of the viewport.
 * - Horizontal scrolling is enabled for nav items on smaller screens.
 * - NavButton provides consistent styling for nav items while allowing
 *   unique styling for authentication-related buttons via `className`.
 */
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { NavButton } from "./NavButton";
import Icon from "../generic/Icon.jsx"

const NAV_ITEMS = [
  { id: "discover", label: "Discover", path: "/" },
  { id: "library", label: "My Library", path: "/library" },
  { id: "wishlist", label: "Wishlist", path: "/wishlist" },
  { id: "favourites", label: "Favourites", path: "/favourites" },
  { id: "forums", label: "Forums", path: "/forums" },
];

export function Navbar() {
  const { isAuthenticated, user } = useAuth();

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
            <Icon
            className="text-secondary/60"
            >
              account_circle
            </Icon>
            <span className="text-xs text-tertiary">{user.username}</span>
          </NavButton>

        )}
      </div>
    </nav>
  );
}