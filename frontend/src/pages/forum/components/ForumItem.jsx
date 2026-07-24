/**
 * ./pages/forum/ForumItem.jsx
 *
 * A reusable UI block for displaying a forum thread preview.
 * Built for compact layouts, subtle borders, and clean typography.
 *
 * @param {Object} props
 * @param {Object} props.thread - Thread metadata.
 * @param {string|number} props.thread.id - Unique thread identifier.
 * @param {string} props.thread.title - Title of the thread.
 * @param {string} props.thread.author - Author of the thread.
 * @param {number} props.thread.replies - Number of replies.
 * @param {number} props.thread.likes - Number of views.
 * @param {string} props.thread.datePosted - Last active timestamp.
 *
 * @param {Object} [props.book] - Optional book associated with the thread.
 * @param {string} props.book.title - Book title.
 * @param {string} props.book.spineColor - Color used for the indicator dot.
 *
 * @param {Object} props.cat - Category styling preset.
 * @param {string} props.cat.label - Category label text.
 * @param {string} props.cat.bg - Background color for the badge.
 * @param {string} props.cat.text - Text color for the badge.
 * @param {string} props.cat.border - Border color for the badge.
 *
 * @returns {JSX.Element} A styled discussion preview card.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBookById } from "../../../api/books/bookService";

export default function ForumItem({ thread }) {
    const [book, setBook] = useState(null);

    useEffect(() => {
        async function loadBook() {
            const res = await getBookById(thread.book_id);
            setBook(res);
        }
        loadBook();
    }, [thread.book_id]);

    if (!book) {
        return (
            <div className="text-xs p-4 border rounded text-[#444]">
                Loading book info...
            </div>
        );
    }

    return (
        <Link to={`/forums/${thread.id}`}>
            <div
                className="bg-[#141414] border border-[#1e1e1e] rounded-xl px-4 py-3.5 hover:border-[#2a2a2a] transition-colors cursor-pointer flex items-center gap-4"
            >

                {/* Thread content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">

                        {/* Book title */}
                        {book && (
                            <span className="text-[11px] text-[#444] shrink-0">
                                {book.title}
                            </span>
                        )}
                    </div>

                    {/* Thread title */}
                    <p className="text-[13px] text-[#ccc] truncate">{thread.title}</p>

                    {/* Thread author */}
                    <p className="text-[11px] text-[#3a3a3a] mt-0.5">by {thread.author}</p>
                </div>

                {/* Thread stats */}
                <div className="flex flex-col items-end shrink-0 text-right gap-2">

                    {/* Date */}
                    <p className="text-[11px] text-[#333]">{thread.datePosted}</p>

                    {/* Replies and Likes row */}
                    <div className="flex gap-5">
                        <div className="flex flex-col text-center">
                            <p className="text-[13px] font-medium text-[#888]">
                                X
                            </p>
                            <p className="text-[10px] text-[#333]">replies</p>
                        </div>

                        <div className="flex flex-col text-center">
                            <p className="text-[13px] font-medium text-[#888]">
                                X
                            </p>
                            <p className="text-[10px] text-[#333]">likes</p>
                        </div>
                    </div>

                </div>
            </div>
        </Link>
    );
}