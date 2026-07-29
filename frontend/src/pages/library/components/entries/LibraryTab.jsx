/**
 * LibraryTab.jsx
 *
 * Renders a full category section of the user's library:
 * - Applies variant‑specific styling (background + border)
 * - Displays a header with icon, title, and sorting controls
 * - Filters the library list by category variant
 * - Sorts filtered entries using the selected dropdown option
 * - Shows an empty-state message when no entries match
 * - Renders LibraryItem components for all sorted entries
 *
 * Filtering + sorting are derived from props + local UI state,
 * ensuring predictable behavior without storing redundant state.
 */

import { useState } from "react";
import {
    filterLibraryListByVariant,
    sortSelectedEntries
} from "../../../../hooks/library/useLibrarySorting";
import { cn } from "../../../../utils/utils";
import Icon from "../../../../components/generic/Icon";
import SortingDropdown from "../ui/SortingDropdown";
import LibraryItem from "./LibraryItem";
import LibraryGridItem from "./LibraryGridItem";
import { useLocalStorage } from "../../../../hooks/useLocalStorage";

/** Variant-specific background + border styles */
const variants = {
    finished: "bg-[#121210] border-2 border-[#132E27]",
    reading: "bg-[#0F1419] border-2 border-[#112334]",
    wishlist: "bg-[#20170C] border-2 border-[#3F2D0A]",
    dropped: "bg-[#170808] border-2 border-[#3A0B0D]",
    favourite: "bg-[#200C13] border-2 border-[#3F0A23]"
};

/** Empty-state messages per category */
const emptyText = {
    finished: "Keep reading to fill this list!",
    reading: "Check out your favourites or the Discover page!",
    wishlist: "Explore new books on the Discover page!",
    dropped: "Hopefully this stays empty...",
    favourite: "Read more to find your next favourite!"
};

/** Sorting dropdown options */
const filterOptions = [
    { label: "Newest" },
    { label: "Oldest" },
    { label: "Title (A-Z)" },
    { label: "Author (A-Z)" }
];

/**
 * LibraryTab
 *
 * @param {Object} props
 * @param {Array<Object>} props.libraryList - Full list of library entries
 * @param {string} props.icon - Icon name for the category header
 * @param {string} props.iconColour - Colour applied to icon + title
 * @param {string} props.title - Category title (e.g., "Finished")
 * @param {string} [props.variant="finished"] - Category variant controlling styling + filtering
 * @param {string} [props.className] - Additional container classes
 *
 * @returns {JSX.Element}
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
    /** Controls visibility of the sorting dropdown */
    const [dropdown, setDropdown] = useState(false);

    /** Currently selected sorting option (derived sorting) */
    const [selected, setSelected] = useState(filterOptions[0]);

    /** Persist the user's preferred library layout across page visits. */
    const [viewMode, setViewMode] = useLocalStorage("library-view-mode", "list");

    /**
     * Update selected sorting option.
     * Sorting itself is computed later from this value.
     */
    function handleSelection(option) {
        setDropdown(false);
        setSelected(option);
    }

    /** Filter entries by category variant */
    const selectedEntries = filterLibraryListByVariant(libraryList, variant);

    /** Sort filtered entries using the selected option */
    const sortedEntries = sortSelectedEntries(selectedEntries, selected.label);

    return (
        <div
            {...props}
            className={cn("rounded-xl p-4", variants[variant], className)}
        >
            {/* Header: icon, title, sorting dropdown, and view controls */}
            <header className="mb-3 flex flex-wrap items-center gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <Icon style={{ color: iconColour }}>
                        {icon}
                    </Icon>

                    <h1
                        style={{ color: iconColour }}
                        className="font-bold text-base md:text-lg"
                    >
                        {title}
                    </h1>

                    <SortingDropdown
                        options={filterOptions}
                        selected={selected}
                        handleSelection={handleSelection}
                        dropdown={dropdown}
                        setDropdown={setDropdown}
                    />
                </div>

                <div
                    className="ml-auto flex items-center rounded-full border border-white/10 bg-black/20 p-1"
                    role="group"
                    aria-label="Library view"
                >
                    <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        aria-label="Show books as a list"
                        aria-pressed={viewMode === "list"}
                        title="List view"
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                            viewMode === "list"
                                ? "bg-white/15 text-[#F9EDCC]"
                                : "text-[#7E7272] hover:text-[#D9D3C7]"
                        )}
                    >
                        <Icon className="text-lg">view_list</Icon>
                    </button>

                    <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        aria-label="Show books as a grid"
                        aria-pressed={viewMode === "grid"}
                        title="Grid view"
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                            viewMode === "grid"
                                ? "bg-white/15 text-[#F9EDCC]"
                                : "text-[#7E7272] hover:text-[#D9D3C7]"
                        )}
                    >
                        <Icon className="text-lg">grid_view</Icon>
                    </button>
                </div>
            </header>

            {/* Empty state shared by both layouts. */}
            {(!libraryList.length || !selectedEntries.length) && (
                <p className="mb-3 pl-2 text-xs text-[#BFB8AD]">
                    {emptyText[variant]}
                </p>
            )}

            {/* Existing detailed list view. */}
            {viewMode === "list" && (
                <div className="flex flex-col space-y-3 mb-3 pl-2 max-h-80 overflow-auto custom-scrollbar">
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
            )}

            {/* Responsive cover-focused grid view. */}
            {viewMode === "grid" && (
                <div className="custom-scrollbar grid max-h-[38rem] grid-cols-2 gap-3 overflow-auto pr-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {sortedEntries &&
                        sortedEntries.map(entry => (
                            <LibraryGridItem
                                key={entry.id}
                                libraryEntry={entry}
                                variant={variant}
                            />
                        ))
                    }
                </div>
            )}

        </div>
    );
}
