import { useState } from "react";
import Icon from "../../../components/generic/Icon";

export default function StarRating({
    rating,
    setRating,
    totalStars = 5,
}) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (value) => {
        setRating(value);
    };

    const handleMouseEnter = (value) => {
        setHoverRating(value);
    };

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