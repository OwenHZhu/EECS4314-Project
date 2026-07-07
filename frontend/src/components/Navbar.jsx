/**
 * ./components/Navbar.jsx
 *
 * The main navigation bar for the BookAtlas application. It displays
 * navigation links based on the user's authentication status and provides
 * quick access to core sections such as Discover, Library, Wishlist,
 * Favourites, and Forums.
 *
 * Dependencies:
 * - NavLink (react-router-dom): Used to render navigation links with
 *   automatic active-state styling based on the current route.
 * - useAuth: Custom authentication hook providing `isAuthenticated` and `user`,
 *   which determines whether user-specific navigation items should be shown, and provides user information when logged in.
 * - MOCK_USER: Temporary mock user data used to display the user's initial
 *   and username until backend integration is complete.
 *
 * NAV_ITEMS Structure:
 * Each item includes:
 *   - id: Unique identifier
 *   - label: Text displayed in the navbar
 *   - path: Route to navigate to
 *   - auth: "any" or "user" — determines whether the item is shown only
 *           to authenticated users
 *
 * Behavior:
 * - Public links ("any") are always shown.
 * - Authenticated-only links ("user") are shown only when `isAuthenticated` is true.
 * - When authenticated, the navbar shows a profile link with the user's initial.
 * - When not authenticated, a Login button is displayed.
 *
 * Notes:
 * - The navbar is sticky and remains at the top of the viewport.
 * - Horizontal scrolling is enabled for nav items on smaller screens.
 * - Styling relies heavily on TailwindCSS utility classes.
 */
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/auth/useAuth";

const NAV_ITEMS = [
  { id: "discover", label: "Discover", path: "/", auth: "any" },
  { id: "library", label: "My Library", path: "/library", auth: "user" },
  { id: "wishlist", label: "Wishlist", path: "/wishlist", auth: "user" },
  { id: "favourites", label: "Favourites", path: "/favourites", auth: "user" },
  { id: "forums", label: "Forums", path: "/forums", auth: "any" },
];

export function Navbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-nav-bar-bg backdrop-blur-md border-b border-nav-bar-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

        {/* Brand / Home Link */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0 group">
          <span className="text-s font-semibold tracking-tight text-primary group-hover:text-white transition-colors">
            Book<span className="text-secondary">Atlas</span>
          </span>
        </NavLink>

        {/* Main Navigation Items */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1 justify-center">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-nav-active-bg text-nav-active-text"
                    : "text-nav-text hover:text-nav-hover-text hover:bg-nav-active-bg"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Login Button (Unauthenticated) */}
        {!isAuthenticated &&
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `flex items-center text-xs gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-colors shrink-0 ${
                isActive
                  ? "bg-nav-active-bg border-nav-active-border text-active-text"
                  : "border-nav-border text-nav-text hover:border-nav-hover-border hover:text-nav-hover-text"
              }`
            }
          >
            Login
          </NavLink>
        }

        {/* Profile Button (Authenticated) */}
        {isAuthenticated &&
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-colors shrink-0 ${
                isActive
                  ? "bg-nav-active-bg border-nav-active-border text-active-text"
                  : "border-nav-border text-nav-text hover:border-nav-hover-border hover:text-nav-hover-text"
              }`
            }
          >
            <div className="w-6 h-6 rounded-full bg-[#2d2845] flex items-center justify-center text-xs font-semibold text-[#b8b0ff]">
              {user.username[0]}
            </div>
            <span className="text-xs text-tertiary">{user.username}</span>
          </NavLink>
        }
      </div>
    </nav>
  );
}