/**
 * ./pages/library/components/FilterButton.jsx
 *
 * Reusable UI element used to switch between library categories
 * (Finished, Reading, Wishlist, Dropped, Favourite). Each button displays
 * a styled pill that visually reflects its category through color and border
 * styling. When selected, the button uses its variant’s full styling; when not
 * selected, it falls back to the neutral "ghost" style.
 *
 * Dependencies:
 * - `cn` — utility for merging class names safely.
 * - `variants` — local style map defining the appearance of each category.
 * 
 */

import { cn } from "../../../utils/utils";

/**
 * Variants for each filter: keys are category names and values are Tailwind class strings.
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
 * @param {object} props
 * @param {React.ReactNode} props.children - Content inside the button (icon, label, etc.)
 * @param {string} props.variant - Category variant determining styling.
 * @param {boolean} props.isSelected - Whether this button is currently active.
 * @param {string} [props.className] - Additional class names to merge.
 *
 * @returns {JSX.Element} A styled filter button.
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
             * Combine:
             * - caller‑provided classes
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