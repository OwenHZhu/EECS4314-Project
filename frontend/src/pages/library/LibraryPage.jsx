/**
 * LibraryPage.jsx
 *
 * High-level responsibilities:
 * - Display the user's personal book library
 * - Provide a filterable interface for switching between reading categories
 *   (Finished, Reading, Wishlist, Dropped, Favourite)
 * - Render category-specific content using LibraryTab
 * - Render category-switching controls using FilterButton
 *
 * This page acts as the main entry point for viewing and navigating
 * the user's library, combining filtering controls with category views.
 */

import { useState } from "react";
import { useLibrary } from "../../hooks/library/useLibrary";
import LibraryTab from "./components/entries/LibraryTab";
import FilterButton from "./components/ui/FilterButton";
import Icon from "../../components/generic/Icon";

/**
 * Filter options controlling which category of books is shown.
 * Each option defines:
 * - label: Display name
 * - variant: Category key used for filtering + styling
 * - icon: Icon name for the filter button
 * - icon_colour: Colour applied to the icon + title
 */
const options = [
    { label: "Finished", variant: "finished", icon: "bookmark_check", icon_colour: "#CCEED6" },
    { label: "Reading", variant: "reading", icon: "bookmark", icon_colour: "#CFE8ED" },
    { label: "Wishlist", variant: "wishlist", icon: "bookmark_star", icon_colour: "#EEE0CC" },
    { label: "Dropped", variant: "dropped", icon: "delete", icon_colour: "#F9CACC" },
    { label: "Favourite", variant: "favourite", icon: "bookmark_heart", icon_colour: "#EDCFE5" }
];

/**
 * LibraryPage
 *
 * @returns {JSX.Element} The main library page with filters + category content
 */
export default function LibraryPage() {
    const { library } = useLibrary();

    /**
     * Tracks the currently selected filter option.
     * Defaults to the "Finished" category.
     */
    const [selected, setSelected] = useState(options[0]);

    return (
        <div className="w-fit mx-auto px-8 py-8 md:px-16 md:py-16">
            <title>My Library | BookAtlas</title>

            {/* Page header */}
            <header className="flex flex-col space-y-2 border-b-2 border-[#5A4B4B] p-2 pb-3">
                <h1 className="font-bold text-[#C6C1B3] text-lg md:text-xl">My Library</h1>
                <p className="text-sm md:text-base text-[#7E7272]">
                    Track your reading journey!
                </p>
            </header>

            {/* Filter buttons row */}
            <div className="flex flex-row space-x-3 mt-4">
                {options.map((o) => (
                    <FilterButton
                        key={o.variant}
                        isSelected={selected.variant === o.variant}
                        onClick={() => setSelected(o)}
                        variant={o.variant}
                        selected={o.variant}
                        className="py-1 px-3 flex flex-row items-center space-x-1"
                    >
                        {/* Option icon */}
                        <Icon
                            style={{ color: o.icon_colour }}
                            className="text-lg"
                        >
                            {o.icon}
                        </Icon>

                        {/* Option label (hidden on mobile for compact layout) */}
                        <p className="hidden md:block text-sm">{o.label}</p>
                    </FilterButton>
                ))}
            </div>

            {/* Main content tab showing books for the selected category */}
            <LibraryTab
                libraryList={library}
                icon={selected.icon}
                iconColour={selected.icon_colour}
                title={selected.label}
                variant={selected.variant}
                className="mt-6"
            />
        </div>
    );
}