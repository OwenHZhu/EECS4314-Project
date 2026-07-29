/**
 * SearchBar.jsx
 *
 * Reusable search input component used across the app.
 * Supports controlled search text and optional styling overrides.
 *
 * Props:
 * @param {string} query - Current search text.
 * @param {Function} setQuery - Updates the search text.
 * @param {string} [className] - Optional additional styling.
 *
 * Dependencies:
 * - cn: Utility for merging class names
 * - Icon: Renders the search icon
 */

import { cn } from "../../utils/utils.js";
import Icon from "../generic/Icon.jsx";

/**
 * SearchBar
 *
 * Renders a styled search input with a leading search icon.
 *
 * @param {object} props
 * @param {string} props.query
 * @param {Function} props.setQuery
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export default function SearchBar({
    query,
    setQuery,
    className = "",
    ...props
}) {
    return (
        <div
            {...props}
            className={cn("relative mb-4", className)}
        >
            {/* Search icon */}
            <Icon
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"
            >
                search
            </Icon>

            {/* Search input */}
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, author, or genre…"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f0f0f0] placeholder-[#444] outline-none focus:border-secondary focus:ring-2 focus:ring-[#7c6af7]/20 transition-all"
            />
        </div>
    );
}