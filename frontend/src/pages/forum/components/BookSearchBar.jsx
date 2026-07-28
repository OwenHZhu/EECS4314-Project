/**
 * BookSearchBar.jsx
 *
 * Search bar for selecting a book when creating a thread or performing
 * book‑related actions. Provides:
 * - Live search using useBookSearch
 * - Dropdown with matching results
 * - Selecting a book fills the input and closes the dropdown
 * - Clearing the input resets the selection
 *
 * Props:
 * @param {Function} onSelectBook - Called with a book object when selected,
 *                                  or `null` when the query is cleared.
 *
 * Dependencies:
 * - Dropdown: Generic dropdown wrapper
 * - useBookSearch: Debounced client‑side book search hook
 */

import { useState, useEffect } from "react";
import Dropdown from "../../../components/generic/Dropdown.jsx";
import { useBookSearch } from "../../../hooks/books/useBookSearch.js";

export default function BookSearchBar({ onSelectBook }) {
    const [query, setQuery] = useState("");
    const [openDropdown, setOpenDropdown] = useState(false);

    const { results, loading } = useBookSearch(query, "all");

    /**
     * Reset selection when the query is cleared.
     */
    useEffect(() => {
        if (query.trim() === "") {
            onSelectBook(null);
            setOpenDropdown(false);
        }
    }, [query]);

    /**
     * Select a book from the dropdown.
     *
     * @param {object} book
     */
    function handleSelect(book) {
        onSelectBook(book);
        setQuery(book.title);
        setOpenDropdown(false);
    }

    return (
        <div className="mb-8">
            <label className="text-sm text-[#7E7272]">Search Books</label>

            <Dropdown
                openSettings={openDropdown}
                setOpenSettings={setOpenDropdown}
                wrapperClassName="w-full"
                trigger={
                    <input
                        type="text"
                        placeholder="Search for a book..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setOpenDropdown(true);
                        }}
                        className="mt-2 w-full bg-transparent border border-[#727C7E] rounded-lg px-3 py-2 text-sm text-[#C6C1B3]"
                    />
                }
                menuClassName="w-full"
            >
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">

                    {loading && (
                        <p className="text-xs text-[#7E7272]">Searching…</p>
                    )}

                    {!loading && results.length === 0 && (
                        <p className="text-xs text-[#7E7272]">No books found.</p>
                    )}

                    {!loading &&
                        results.map((book) => (
                            <button
                                key={book.id}
                                type="button"
                                onClick={() => handleSelect(book)}
                                className="text-left px-3 py-2 rounded-md text-sm 
                                    bg-[#1A2523] text-[#C6C1B3] border border-[#2A4A45]
                                    hover:bg-[#2A4A45] transition"
                            >
                                {book.title}
                                <span className="block text-xs text-[#7E7272]">
                                    {book.author}
                                </span>
                            </button>
                        ))}
                </div>
            </Dropdown>
        </div>
    );
}