/**
 * ForumsPage.jsx
 *
 * Main listing page for all discussion threads. Supports:
 * - Browsing latest posts
 * - Filtering posts by selected book
 * - Searching for books to narrow results
 * - Navigating to individual thread pages
 * - Starting a new discussion when a book is selected
 *
 * Dependencies:
 * - getThreads: Fetches threads (optionally filtered by book_id)
 * - ForumItem: Renders each thread preview
 * - BookSearchBar: Book search + selection UI
 * - useNavigate: Routing for "Start Discussion" and thread navigation
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getThreads } from "../../api/discussion/discussionService.js";
import ForumItem from "./components/ForumItem.jsx";
import BookSearchBar from "./components/BookSearchBar.jsx";

export default function ForumsPage() {
    const navigate = useNavigate();

    const [threads, setThreads] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);

    /**
     * Fetch threads from the backend.
     * If bookId is provided, fetch only threads for that book.
     */
    async function fetchThreads(bookId = null) {
        const res = await getThreads(bookId);
        setThreads(res.data);
    }

    /**
     * Load all threads on initial mount.
     */
    useEffect(() => {
        fetchThreads();
    }, []);

    /**
     * Handle book selection from the search bar.
     * Updates selectedBook and fetches filtered threads.
     *
     * @param {object|null} book
     */
    function handleBookSelect(book) {
        setSelectedBook(book);

        if (book === null) {
            fetchThreads(null);
        } else {
            fetchThreads(book.id);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <title>Forums & Discussions | BookAtlas</title>

            {/* Header */}
            <div className="mb-10">
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#444] mb-2">
                    Community
                </p>
                <h1 className="text-[40px] font-semibold tracking-tight text-[#f0f0f0]">
                    Forums
                </h1>
                <p className="text-[14px] text-[#444] mt-2">
                    Discuss, theorize, and ask questions about your favourite books.
                </p>
            </div>

            {/* Book Search Bar */}
            <BookSearchBar onSelectBook={handleBookSelect} />

            {/* Subtitle */}
            <div className="border-b-2 border-[#1E3C36] mb-4">
                <h1 className="text-[#BFB8AD] font-semibold mb-1">
                    {selectedBook
                        ? `Posts for "${selectedBook.title}"`
                        : "Latest Posts"}
                </h1>
            </div>

            {/* Start Discussion button */}
            {selectedBook && (
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => navigate(`/forums/create/${selectedBook.id}`)}
                        className="text-xs text-tertiary hover:text-primary px-3 py-1 border border-secondary rounded-lg"
                    >
                        Start Discussion
                    </button>
                </div>
            )}

            {/* Empty state */}
            {threads && threads.length === 0 && (
                <div className="flex flex-col text-center p-4 m-2 border-2 rounded-lg border-[#1E3C36] shadow-md">
                    <p className="text-sm text-[#5A4B4B]">No posts yet!</p>
                    <p className="text-sm text-[#5A4B4B]">
                        Search for a book to be the first to say something!
                    </p>
                </div>
            )}

            {/* Thread list */}
            {threads && threads.length > 0 && (
                <div className="flex flex-col space-y-3">
                    {threads.map((thread) => (
                        <ForumItem key={thread.id} thread={thread} />
                    ))}
                </div>
            )}
        </div>
    );
}