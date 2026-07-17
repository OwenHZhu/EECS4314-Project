/**
 * LibraryTab.jsx
 *
 * High-level responsibilities:
 * - Render a category section of the user's library (Finished, Reading, Wishlist, Dropped, Favourite)
 * - Apply variant-specific background and border styling
 * - Display a header with an icon + title
 * - Filter the provided library list based on the selected category
 * - Show an empty-state message when no entries match the category
 * - Render a list of LibraryItem components for the filtered entries
 *
 * This component acts as a structured container for each library category,
 * ensuring consistent layout, styling, and behavior across the library UI.
 */

import { cn } from "../../../utils/utils";
import Icon from "../../../components/generic/Icon";
import LibraryItem from "./LibraryItem";

/**
 * Background + border styles for each tab variant.
 */
const variants = {
    finished: "bg-[#121210] border-2 border-[#132E27]",
    reading: "bg-[#0F1419] border-2 border-[#112334]",
    wishlist: "bg-[#20170C] border-2 border-[#3F2D0A]",
    dropped: "bg-[#170808] border-2 border-[#3A0B0D]",
    favourite: "bg-[#200C13] border-2 border-[#3F0A23]"
};

/**
 * Empty-state messages shown when a category has no entries.
 */
const emptyText = {
    finished: "Keep reading to fill this list!",
    reading: "Check out your favourites or the Discover page!",
    wishlist: "Explore new books on the Discover page!",
    dropped: "Hopefully this stays empty...",
    favourite: "Read more to find your next favourite!"
};

/**
 * LibraryTab
 *
 * @param {object} props
 * @param {Array<any>} props.libraryList - Full list of library entries
 * @param {string} props.icon - Icon name displayed in the header
 * @param {string} props.iconColour - Colour applied to the icon + title
 * @param {string} props.title - Title of the tab (e.g., "Finished")
 * @param {string} [props.variant="finished"] - Category variant controlling styling + filtering
 * @param {string} [props.className] - Additional classes for the outer container
 *
 * @returns {JSX.Element} A styled tab section for a library category
 */
export default function LibraryTab({
    libraryList,
    icon,
    iconColour,
    title,
    variant = "finished",
    className = "",
    ...props
}) {
    /**
     * Filter the full library list based on the selected category variant.
     * Each variant corresponds to a specific status or flag.
     *
     * @returns {Array<any>}
     */
    function filterEntriesByVariant() {
        switch (variant) {
            case "finished":
                return libraryList.filter(e => e.status === "read");

            case "reading":
                return libraryList.filter(e => e.status === "reading");

            case "dropped":
                return libraryList.filter(e => e.status === "dropped");

            case "wishlist":
                return libraryList.filter(e => e.status === "wishlist");

            case "favourite":
                return libraryList.filter(e => e.is_favourite);

            default:
                return libraryList;
        }
    }

    const selectedEntries = filterEntriesByVariant();
    console.log(selectedEntries);

    return (
        <div
            {...props}
            className={cn("rounded-xl p-4", variants[variant], className)}
        >
            {/* Header: icon + title */}
            <header className="flex flex-row space-x-1 items-center mb-3">
                <Icon style={{ color: iconColour }}>
                    {icon}
                </Icon>

                <h1
                    style={{ color: iconColour }}
                    className="font-bold text-base md:text-lg"
                >
                    {title}
                </h1>

                {/* Placeholder for future sorting controls */}
                {/* Example: newest, oldest, alphabetical */}
            </header>

            {/* Content: list of library items or empty-state message */}
            <div className="flex flex-col space-y-3 mb-3 pl-2">
                {(!libraryList.length || !selectedEntries.length) && (
                    <p className="text-[#BFB8AD] text-xs">
                        {emptyText[variant]}
                    </p>
                )}

                {selectedEntries &&
                    selectedEntries.map(entry => (
                        <LibraryItem
                            key={entry.id}
                            libraryEntry={entry}
                            variant={variant}
                        />
                    ))
                }
            </div>
        </div>
    );
}