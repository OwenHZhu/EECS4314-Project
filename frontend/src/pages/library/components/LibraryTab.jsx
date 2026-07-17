/**
 * ./pages/library/components/LibraryTab.jsx
 *
 * Container used to display a specific category of the user's
 * library (Finished, Reading, Wishlist, Dropped, Favourite). Each category has
 * its own background/border styling, icon, and empty‑state message.
 *
 * Dependencies:
 * - `cn` — utility for merging Tailwind class names.
 * - `Icon` — renders the category icon in the header.
 * - `variants` — defines background + border styling per category.
 * - `emptyText` — defines the fallback message when the list is empty.
 * 
 */
import { cn } from "../../../utils/utils";
import Icon from "../../../components/generic/Icon";
import LibraryItem from "./LibraryItem";

/**
 * Background and border styles for each tab variant.
 */
const variants = {
    finished: "bg-[#121210] border-2 border-[#132E27]",
    reading: "bg-[#0F1419] border-2 border-[#112334]",
    wishlist: "bg-[#20170C] border-2 border-[#3F2D0A]",
    dropped: "bg-[#170808] border-2 border-[#3A0B0D]",
    favourite: "bg-[#200C13] border-2 border-[#3F0A23]"
};

/**
 * Messages shown when a category has no items.
 */
const emptyText = {
    finished: "Keep reading to fill this list!",
    reading: "Check out your favourites or the Discover page!",
    wishlist: "Explore new books on the Discover page!",
    dropped: "Hopefully this stays empty...",
    favourite: "Read more to find your next favourite!"
};

/**
 * @param {object} props
 * @param {Array<any>} [props.libraryList] - The list of books for this category.
 * @param {string} props.icon - Icon name to display in the header.
 * @param {string} props.iconColour - Colour applied to the icon and title.
 * @param {string} props.title - Title of the tab (e.g., "Finished").
 * @param {string} [props.variant="finished"] - Category variant controlling styling.
 * @param {string} [props.className] - Additional class names for the container.
 *
 * @returns {JSX.Element} A styled tab section for a library category.
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
            {/* Tab header displaying the icon, section title, and dropdown */}
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

                {/* TO-DO: Add button to filter newest, oldest, etc. */}
            </header>

            {/* 
                Contains the library items.
                TO-DO: Connect to actual library list when Library Service is live.
            */}
            <div className="flex flex-col space-y-3 mb-3 pl-2">
                {/* Display a basic message if the list or selected entries are empty */}
                {(!libraryList || !selectedEntries) && (
                    <p className="text-[#BFB8AD] text-xs">
                        {emptyText[variant]}
                    </p>
                )}

                {/* Otherwise, fill in the library items */}
                {selectedEntries &&
                    selectedEntries.map(entry => {
                        return (
                            <LibraryItem
                                key={entry.id}
                                libraryEntry={entry}
                                variant={variant}
                            />
                        );
                    })
                }
            </div>
        </div>
    );
}