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
 *
 * Dependencies:
 * - `GenericButton` — used for the action button when the item is not finished.
 * - `cn` — utility for merging Tailwind class names.
 *
 */
import { cn } from "../../../utils/utils";
import { useLibraryActions } from "../../../hooks/library/useLibraryActions";
import GenericButton from "../../../components/generic/GenericButton";


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
    libraryEntry,
    variant = "finished",
    className = "",
    ...props
}) {

    const { buttonText, dateText, doAction } = useLibraryActions(variant, libraryEntry);

    return (
        <div
            {...props}
            className={cn(
                "flex flex-row justify-between items-start w-full py-2",
                className
            )}
        >
            {/* Left side: Cover, title, author, action button */}
            <div className="flex flex-row space-x-3 flex-1">
                <img
                    src={libraryEntry.book.cover_image}
                    alt={`Cover image for ${libraryEntry.book.title}`}
                    className="w-16 h-24 object-cover rounded-md"
                />

                <div className="flex flex-col w-1/2">
                    <h3 className="text-sm text-[#F9EDCC] font-semibold break-works text-wrap">
                        {libraryEntry.book.title}
                    </h3>

                    <p className="text-xs text-[#BFB8AD] font-medium">
                        {libraryEntry.book.author}
                    </p>

                    {variant !== "finished" && (
                        <GenericButton
                            onClick={doAction}
                            variant="ghost"
                            className="max-w-fit py-1 px-4 mt-3 text-xs md:text-xs"
                        >
                            {buttonText}
                        </GenericButton>
                    )}
                </div>
            </div>

            {/* Right side: Date */}
            <p className="hidden md:block text-xs text-[#BFB8AD] text-wrap">
                {dateText}
            </p>
        </div>
    );

}