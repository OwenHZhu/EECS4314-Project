/**
 * PostHeader.jsx
 *
 * Displays the header section for a discussion thread, including:
 * - Book cover, title, and author
 * - Thread title, author, and creation date
 * - Spoiler‑warning toggle for non‑owners when the thread contains spoilers
 *
 * Props:
 * @param {object} book - Book metadata (title, author, cover_image).
 * @param {object} thread - Thread metadata (title, author, created_at, has_spoilers, user_id).
 * @param {object|null} user - Currently authenticated user.
 * @param {boolean} showSpoilers - Whether spoilers are currently visible.
 * @param {Function} setShowSpoilers - Toggles spoiler visibility.
 *
 * Dependencies:
 * - GenericButton: Spoiler toggle button
 * - date-fns/format: Formats thread creation date
 */

import GenericButton from "../../../../components/generic/GenericButton";
import { format } from "date-fns";

/**
 * PostHeader
 *
 * Renders book and thread metadata and a spoiler toggle button when applicable.
 *
 * @param {object} props
 * @returns {JSX.Element}
 */
export default function PostHeader({
    book,
    thread,
    user,
    showSpoilers,
    setShowSpoilers
}) {
    return (
        <div className="flex flex-row">
            {/* Book cover */}
            <img
                className="w-28 h-auto rounded-lg mr-3"
                src={book.cover_image}
                alt={`Book cover for ${book.title}`}
            />

            <div className="m-3">
                {/* Book title + author */}
                <p className="text-sm text-[#7E7272]">
                    {book.title} | {book.author}
                </p>

                {/* Thread title */}
                <h2 className="mt-2 text-2xl text-[#C6C1B3] font-bold">
                    {thread.title}
                </h2>

                {/* Thread author */}
                <h4 className="text-sm text-[#7E7272]">
                    by {thread.author}
                </h4>

                {/* Thread creation date */}
                <p className="text-sm mt-1 text-[#7E7272]/80">
                    {format(thread.created_at, "MMMM dd, yyy")}
                </p>

                {/* Spoilers warning button */}
                {thread.has_spoilers &&
                    user &&
                    user.id !== thread.user_id && (
                        <GenericButton
                            variant="spoilers"
                            className="py-2 px-3 mt-5"
                            onClick={() => setShowSpoilers(prev => !prev)}
                        >
                            {showSpoilers ? "Hide Spoilers" : "Reveal Spoilers"}
                        </GenericButton>
                    )}
            </div>
        </div>
    );
}