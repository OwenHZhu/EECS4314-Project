/**
 * ErrorList.jsx
 *
 * Displays a list of error messages in a styled container.
 *
 * Props:
 * @param {string[]} errors - Array of error message strings to display.
 * @param {string} [className] - Optional additional CSS classes for the wrapper.
 * @param {...any} props - Additional props forwarded to the wrapper <div>.
 *
 * Dependencies:
 * - cn: Utility for merging class names.
 */

import { cn } from "../../utils/utils";

export default function ErrorList({
    errors,
    className = "",
    ...props
}) {
    return (
        <div
            {...props}
            className={cn("bg-[#181E1D] text-[#859B9F] p-3 rounded-lg mb-4 text-xs w-fit", className)}
        >
            <ul className="list-disc list-inside space-y-1">
                {errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                ))}
            </ul>
        </div>
    );
}