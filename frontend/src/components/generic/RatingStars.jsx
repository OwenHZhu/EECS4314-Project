/**
 * RatingStars.jsx
 *
 * Reusable star rating display/input component.
 *
 * This component uses the project's generic Material Symbols Icon component
 * instead of hard-coded SVGs. It can be used as:
 *
 * - A read-only rating display for average book ratings.
 * - An interactive rating input for allowing users to rate a book.
 *
 * Props:
 * @param {number} value
 *   Current rating value from 0 to 5.
 *
 * @param {Function} onChange
 *   Optional callback. If provided, the stars become interactive.
 *
 * @param {number} max
 *   Maximum number of stars to display.
 *
 * @param {string} sizeClassName
 *   Tailwind classes controlling icon size.
 *
 * @param {string} className
 *   Optional wrapper classes.
 *
 * @param {string} activeClassName
 *   Classes applied to selected stars.
 *
 * @param {string} inactiveClassName
 *   Classes applied to unselected stars.
 *
 * @param {string} ariaLabel
 *   Accessible label for the rating group.
 */

import { useState } from "react";
import Icon from "./Icon";
import { cn } from "../../utils/utils";

export default function RatingStars({
  value = 0,
  onChange,
  max = 5,
  sizeClassName = "text-lg",
  className = "",
  activeClassName = "text-book-rating",
  inactiveClassName = "text-book-rating-empty",
  ariaLabel = "Book rating",
}) {
  const [hoveredValue, setHoveredValue] = useState(0);

  const isInteractive = typeof onChange === "function";
  const visibleValue = hoveredValue || value;

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role={isInteractive ? "radiogroup" : "img"}
      aria-label={ariaLabel}
      onMouseLeave={() => setHoveredValue(0)}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= Math.round(visibleValue);

        if (!isInteractive) {
          return (
            <Icon
              key={starValue}
              className={cn(
                sizeClassName,
                "cursor-default select-none",
                isActive ? activeClassName : inactiveClassName
              )}
              aria-hidden="true"
            >
              {isActive ? "star" : "star_border"}
            </Icon>
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={Number(value) === starValue}
            aria-label={`Rate ${starValue} star${
              starValue === 1 ? "" : "s"
            }`}
            onMouseEnter={() => setHoveredValue(starValue)}
            onFocus={() => setHoveredValue(starValue)}
            onBlur={() => setHoveredValue(0)}
            onClick={() => onChange(starValue)}
            className="
              flex items-center justify-center
              transition-transform
              hover:scale-110
              focus:outline-none
            "
          >
            <Icon
              className={cn(
                sizeClassName,
                isActive ? activeClassName : inactiveClassName
              )}
              aria-hidden="true"
            >
              {isActive ? "star" : "star_border"}
            </Icon>
          </button>
        );
      })}
    </div>
  );
}