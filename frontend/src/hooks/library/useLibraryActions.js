import { useLibrary } from "./useLibrary";
import { format } from "date-fns";

export function useLibraryActions(variant, entry) {
    const { updateLibraryEntry } = useLibrary();

    function getButtonText() {
        switch (variant) {
            case "reading":
                return "Mark as Finished";

            case "dropped":
                return "Resume";

            case "wishlist":
                return "Start Reading";

            case "favourite":
                return "Remove";

            default:
                return "";
        }
    }

    function getDateText() {
        switch (variant) {
            case "finished":
                return `${format(entry.added_at, "MMM d, yyy")} to ${format(entry.updated_at, "MMM d, yyy")}`;

            case "reading":
                return `Since ${format(entry.added_at, "MMM d, yyy")}`;

            case "dropped":
                return `${format(entry.added_at, "MMM d, yyy")} to ${format(entry.updated_at, "MMM d, yyy")}`;

            case "wishlist", "favourite":
                return `Added on ${format(entry.updated_at, "MMM d, yyy")}`;

            default:
                return `${format(entry.added_at, "MMM d, yyy")}`;
        }
    }

    async function doAction() {
        switch (variant) {
            case "reading":
                return updateLibraryEntry(entry.book_id, "read", entry.is_favourite, 5);

            case "dropped":
                return updateLibraryEntry(entry.book_id, "reading", entry.is_favourite, null);

            case "wishlist":
                return updateLibraryEntry(entry.book_id, "reading", entry.is_favourite, null);

            case "favourite":
                return updateLibraryEntry(entry.book_id, entry.status, false, entry.rating);

            default:
                return null;
        }
    }

    return {
        buttonText: getButtonText(),
        dateText: getDateText(), 
        doAction
    };

}