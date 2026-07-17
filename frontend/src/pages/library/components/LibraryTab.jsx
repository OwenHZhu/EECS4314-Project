/**
 * LibraryTab.jsx
 *
 * High-level responsibilities:
 * - Render a category section of the user's library (Finished, Reading, Wishlist, Dropped, Favourite)
 * - Apply variant-specific background and border styling
 * - Display a header with an icon + title
 * - Filter the full library list based on the active category variant
 * - Apply a user-selected sorting option (Newest, Oldest, Title, Author) to the filtered entries
 * - Compute sorted entries directly from filtering + sorting (no stored sorted state)
 * - Show an empty-state message when no entries match the category
 * - Render a list of LibraryItem components for the sorted entries
 *
 * This component acts as a structured container for each library category,
 * ensuring consistent layout, styling, and behavior across the library UI.
 * Filtering and sorting are derived from props + local UI state, keeping
 * the component predictable and avoiding stale state.
 */
import { useState } from "react";
import { filterLibraryListByVariant, sortSelectedEntries } from "../../../hooks/library/useLibrarySorting";
import { cn } from "../../../utils/utils";
import Icon from "../../../components/generic/Icon";
import SortingDropdown from "./SortingDropdown";
import LibraryItem from "./LibraryItem";

/**
 * Background + border styles for each tab variant.
 * These styles visually differentiate each category section.
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
 * Each variant has a unique message tailored to its context.
 */
const emptyText = {
    finished: "Keep reading to fill this list!",
    reading: "Check out your favourites or the Discover page!",
    wishlist: "Explore new books on the Discover page!",
    dropped: "Hopefully this stays empty...",
    favourite: "Read more to find your next favourite!"
};

/**
 * Sorting options displayed in the dropdown.
 * These labels map directly to sorting functions.
 */
const filterOptions = [
    { label: "Newest" },
    { label: "Oldest" },
    { label: "Title (A-Z)" },
    { label: "Author (A-Z)" },
];

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
 *
 * Filtering + sorting notes:
 * - Filtering is based solely on the `variant` prop.
 * - Sorting is based solely on the selected dropdown option.
 * - Both filtering and sorting are recomputed on every render,
 *   ensuring correct behavior when switching tabs or updating the list.
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
     * Dropdown open/close state.
     * Controls visibility of the sorting menu.
     */
    const [dropdown, setDropdown] = useState(false);

    /**
     * Currently selected sorting option.
     * Defaults to "Newest".
     */
    const [selected, setSelected] = useState(filterOptions[0]);

    /**
     * Handle sorting option selection.
     * The dropdown only updates the selected option — sorting is derived.
     */
    function handleSelection(option) {
        setSelected(option);
    }

    /**
     * Filter entries based on the active category variant.
     * This produces the base list before sorting.
     */
    const selectedEntries = filterLibraryListByVariant(libraryList, variant);

    /**
     * Sort the filtered entries using the selected sort option.
     * Sorting is derived state, ensuring correctness
     * when switching tabs or when the library list updates.
     */
    const sortedEntries = sortSelectedEntries(selectedEntries, selected.label);

    return (
        <div
            {...props}
            className={cn("rounded-xl p-4", variants[variant], className)}
        >
            {/* Header: icon + title + sorting dropdown */}
            <header className="flex flex-row space-x-2 items-center mb-3">
                {/* Category icon */}
                <Icon style={{ color: iconColour }}>
                    {icon}
                </Icon>

                {/* Category title */}
                <h1
                    style={{ color: iconColour }}
                    className="font-bold text-base md:text-lg"
                >
                    {title}
                </h1>

                {/* Sorting controls */}
                {/* The dropdown emits the selected option; sorting happens here in the tab. */}
                <SortingDropdown
                    options={filterOptions}
                    selected={selected}
                    handleSelection={handleSelection}
                    dropdown={dropdown}
                    setDropdown={setDropdown}
                />
            </header>

            {/* Content: sorted list or empty-state message in a scrollable panel */}
            <div 
            className="flex flex-col space-y-3 mb-3 pl-2 max-h-80 overflow-auto custom-scrollbar"
            >
                {(!libraryList.length || !selectedEntries.length) && (
                    <p className="text-[#BFB8AD] text-xs">
                        {emptyText[variant]}
                    </p>
                )}

                {sortedEntries &&
                    sortedEntries.map(entry => (
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