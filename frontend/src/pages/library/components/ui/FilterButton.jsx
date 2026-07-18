/**
 * FilterButton.jsx
 *
 * High-level responsibilities:
 * - Render a styled pill-shaped button used for filtering library categories
 * - Apply variant-specific styling (Finished, Reading, Wishlist, Dropped, Favourite)
 * - When not selected, fall back to the neutral "ghost" style
 * - Allow callers to pass additional class names and props
 *
 * This component centralizes all styling logic for category filter buttons,
 * ensuring consistent appearance across the library UI.
 */

import { cn } from "../../../../utils/utils";

/**
 * Style variants for each filter category.
 * Keys correspond to category names; values are Tailwind class strings.
 */
const variants = {
    ghost: "rounded-full bg-transparent border-2 border-generic-button-ghost-border hover:border-generic-button-ghost-border-hover hover:bg-generic-button-ghost-fill-hover",
    finished: "rounded-full bg-[#103019] border-2 border-[#2CD532]",
    reading: "rounded-full bg-[#1E3C36] border-2 border-[#22C9A8]",
    wishlist: "rounded-full bg-[#563B11] border-2 border-[#C9B022]",
    dropped: "rounded-full bg-[#350E0E] border-2 border-[#E51D27]",
    favourite: "rounded-full bg-[#350E23] border-2 border-[#E51D6D]",
};

/**
 * FilterButton
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Inner content (text, icon, etc.)
 * @param {string} props.variant - Category variant determining styling
 * @param {boolean} props.isSelected - Whether this filter is currently active
 * @param {string} [props.className] - Additional classes to merge
 *
 * @returns {JSX.Element} A styled filter pill button
 */
export default function FilterButton({
    children,
    variant,
    isSelected,
    className = "",
    ...props
}) {
    return (
        <span
            {...props}
            /**
             * Final className merges:
             * - caller-provided classes
             * - variant styling
             * - selected or ghost styling depending on state
             */
            className={cn(
                className,
                variants[variant],
                isSelected ? variants[variant] : variants["ghost"]
            )}
        >
            {children}
        </span>
    );
}