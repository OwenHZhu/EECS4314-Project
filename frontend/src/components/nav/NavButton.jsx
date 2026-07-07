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
 * - to (string): Destination route passed directly to <NavLink>.
 * - children (ReactNode): Content displayed inside the button.
 * - className (string): Optional Tailwind classes merged with defaults
 *   using the `cn()` utility, enabling unique styling when needed.
 * - rounded (string): Tailwind rounding class (e.g., "rounded-lg",
 *   "rounded-full") applied to the button shape.
 *
 * Behaviour:
 * - Automatically applies active-state styling when the current route
 *   matches the `to` prop.
 * - Default styling is applied to all nav items unless overridden via
 *   `className`, making this component flexible for both standard nav
 *   links and specialized auth-related buttons.
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