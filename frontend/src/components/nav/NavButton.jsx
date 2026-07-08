/**
 * ./components/nav/NavButton.jsx
 * 
 * Generic navigation button used throughout the Navbar.
 *
 * This component wraps React Router's <NavLink> and provides consistent
 * default styling for navigation items, including active/inactive state
 * colors and transitions. It also supports custom styling overrides,
 * allowing components such as Login, Register, and Profile to apply
 * additional Tailwind classes without losing the default behavior.
 *
 * Props:
 * @param {string} to
 *   The destination route passed directly to <NavLink>. Determines where
 *   the user navigates when the button is clicked.
 *
 * @param {ReactNode} children
 *   The content displayed inside the navigation button (usually text).
 *
 * @param {string} className
 *   Optional TailwindCSS classes merged with the default styles using `cn()`.
 *   Useful for applying unique styling to specific nav items such as Login,
 *   Register, or Profile.
 *
 * @param {string} rounded
 *   Tailwind rounding utility applied to the button shape (e.g., "rounded-lg",
 *   "rounded-full"). Defaults to "rounded-lg". Allows certain nav items to
 *   use more distinct shapes without affecting the rest of the navbar.
 *
 * Behaviour:
 * - Automatically applies active-state styling when the current route matches
 *   the `to` prop, using NavLink's `isActive` flag.
 * - Default styling is applied to all nav items unless overridden via
 *   `className`, making this component flexible for both standard nav links
 *   and specialized auth-related buttons.
 * - All classes are merged using `cn()`, ensuring predictable Tailwind class
 *   resolution and allowing responsive overrides when needed.
 */

import { NavLink } from "react-router-dom";
import { cn } from "../../utils/utils.js";

export function NavButton({
  to,
  children,
  className = "",
  rounded = "rounded-lg",
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
          rounded,
          isActive
            ? "bg-nav-active-bg border-nav-active-border text-nav-active-text"
            : "border-nav-border text-nav-text hover:border-nav-hover-border hover:text-nav-hover-text hover:bg-nav-active-bg",
          className
        )
      }
    >
      {children}
    </NavLink>
  );
}