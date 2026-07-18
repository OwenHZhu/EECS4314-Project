/**
 * StarRating.jsx
 *
 * Interactive star rating component.
 * - Displays a row of selectable stars
 * - Supports hover preview and click-to-rate
 * - Controlled by parent via `rating` and `setRating`
 *
 * Ideal for review forms or any UI requiring a 1–5 rating input.
 */

import { useState } from "react";
import Icon from "../../../../components/generic/Icon";

/**
 * StarRating
 *
 * @param {Object} props
 * @param {number} props.rating - Current rating value (controlled by parent)
 * @param {(value: number) => void} props.setRating - Updates rating in parent
 * @param {number} [props.totalStars=5] - Number of stars to display
 *
 * @returns {JSX.Element}
 */
export default function StarRating({
    rating,
    setRating,
    totalStars = 5,
}) {
    /** Temporary hover preview value */
    const [hoverRating, setHoverRating] = useState(0);

    /** Set rating on click */
    const handleClick = (value) => {
        setRating(value);
    };

    /** Highlight stars on hover */
    const handleMouseEnter = (value) => {
        setHoverRating(value);
    };

    /** Reset hover highlight */
    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    return (
        <div className="flex flex-row space-x-1">
            {Array.from({ length: totalStars }, (_, i) => {
                const value = i + 1;
                const isActive = value <= (hoverRating || rating);

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => handleClick(value)}
                        onMouseEnter={() => handleMouseEnter(value)}
                        onMouseLeave={handleMouseLeave}
                        className="cursor-pointer transition-colors"
                    >
                        <Icon
                            className={`${isActive
                                ? "text-yellow-400"
                                : "text-gray-400"
                            } text-sm`}
                        >
                            star
                        </Icon>
                    </button>
                );
            })}
        </div>
    );
}