/**
 * ./pages/library/components/LibraryItem.jsx
 *
 * Component representing a single book entry inside a library category. 
 * This component is intentionally rough and lightly
 * styled while the library service continues development.
 *
 * Responsibilities:
 * - Display basic book information (cover, title, author).
 * - Show an action button for non‑finished variants (e.g., “Continue”, “Add”, etc.).
 * - Display a date string associated with the item (e.g., finished date, added date).
 * - Apply variant‑specific styling once variants are fully implemented.
 *
 * Dependencies:
 * - `GenericButton` — used for the action button when the item is not finished.
 * - `cn` — utility for merging Tailwind class names.
 * - `variants` — placeholder style map for future category‑specific styling.
 *
 */

import GenericButton from "../../../components/generic/GenericButton";
import { cn } from "../../../utils/utils";

/**
 * Placeholder variant styles.
 * These will be expanded once the library service provides real data.
 */
const variants = {
    finished: "",
    inProgress: "",
    wishlist: "",
    dropped: "",
    favourite: ""
};

/* 
    TO-DO: 
    - Uncomment book data when connected to library service 
    - Style the component properly
*/

/**
 * @param {object} props
 * @param {string} props.buttonText - Text displayed inside the action button.
 * @param {string} props.dateText - Date string shown on the right side.
 * @param {string} [props.variant="finished"] - Category variant controlling styling.
 * @param {string} [props.className] - Additional class names for the outer container.
 *
 * @returns {JSX.Element} A rough, placeholder library item component.
 */
export default function LibraryItem({
    //bookData,
    buttonText,
    dateText,
    variant = "finished",
    className = "",
    ...props
}) {
    return (
        <div
            {...props}
            className={cn("flex flex-row", variants[variant], className)}
        >
            {/* Book Cover Image (placeholder) */}
            <img src="" alt="book cover" />

            {/* Book Information and Action Button */}
            <div className="flex flex-col">
                <h3>Book Title</h3>
                <p>Book Author</p>

                {/* Show button only for non-finished variants */}
                {variant !== "finished" && (
                    <GenericButton>
                        {buttonText}
                    </GenericButton>
                )}
            </div>

            {/* Date (e.g., finished date, added date, etc.) */}
            <p>{dateText}</p>
        </div>
    );
}