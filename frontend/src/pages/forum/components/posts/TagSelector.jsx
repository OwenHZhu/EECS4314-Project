/**
 * TagSelector.jsx
 *
 * Provides a searchable dropdown for selecting discussion tags.
 * Supports:
 * - Fetching available tags from the backend
 * - Live filtering based on user input
 * - Selecting/unselecting tags
 * - Displaying chosen tags below the selector
 *
 * Props:
 * @param {Array<object>} selectedTags - Currently selected tag objects.
 * @param {Function} setSelectedTags - Updates the selected tag list.
 *
 * Dependencies:
 * - Dropdown: Generic dropdown wrapper
 * - getTags: API call for retrieving discussion tags
 */

import { useState, useEffect } from "react";
import Dropdown from "../../../../components/generic/Dropdown.jsx";
import { getTags } from "../../../../api/discussion/discussionService.js";

/**
 * TagSelector
 *
 * Renders a searchable tag selector with dropdown results.
 * Selected tags appear below the input as small chips.
 *
 * @returns {JSX.Element}
 */
export default function TagSelector({ selectedTags, setSelectedTags }) {
    const [tags, setTags] = useState([]);
    const [query, setQuery] = useState("");
    const [openTagDropdown, setOpenTagDropdown] = useState(false);

    const MAX_RESULTS = 10;

    /**
     * Load all tags on mount.
     */
    useEffect(() => {
        async function loadTags() {
            try {
                const res = await getTags();
                setTags(res.data);
            } catch (err) {
                console.error("Failed to load tags:", err);
            }
        }
        loadTags();
    }, []);

    /**
     * Filter tags based on search query.
     */
    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(query.toLowerCase())
    );

    /**
     * Limit dropdown results.
     */
    const truncatedTags = filteredTags.slice(0, MAX_RESULTS);

    /**
     * Add or remove a tag from the selected list.
     *
     * @param {object} tag
     */
    function toggleTag(tag) {
        if (selectedTags.some(t => t.id === tag.id)) {
            setSelectedTags(prev => prev.filter(t => t.id !== tag.id));
        } else {
            setSelectedTags(prev => [...prev, tag]);
        }

        setOpenTagDropdown(false);
        setQuery("");
    }

    return (
        <div className="mt-10">
            <label className="text-sm text-[#7E7272]">Tags</label>

            {/* Searchable dropdown */}
            <Dropdown
                openSettings={openTagDropdown}
                setOpenSettings={setOpenTagDropdown}
                wrapperClassName="w-full"
                trigger={
                    <input
                        type="text"
                        placeholder="Search tags..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setOpenTagDropdown(true);
                        }}
                        className="mt-2 w-full bg-transparent border border-[#727C7E] rounded-lg px-3 py-2 text-sm text-[#C6C1B3]"
                    />
                }
                menuClassName="w-full"
            >
                <div className="flex flex-col gap-2">

                    {/* No results */}
                    {truncatedTags.length === 0 ? (
                        <p className="text-xs text-[#7E7272]">No tags found.</p>
                    ) : (
                        truncatedTags.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className="text-left px-3 py-1 rounded-md text-xs 
                                    bg-[#1A2523] text-[#C6C1B3] border border-[#2A4A45]
                                    hover:bg-[#2A4A45] transition"
                            >
                                {tag.name}
                            </button>
                        ))
                    )}

                    {/* More results available */}
                    {filteredTags.length > MAX_RESULTS && (
                        <p className="text-xs text-[#7E7272] mt-2">
                            Keep typing to narrow results…
                        </p>
                    )}
                </div>
            </Dropdown>

            {/* Selected tags */}
            {selectedTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                        <span
                            key={tag.id}
                            className="px-3 py-1 rounded-full text-xs bg-[#2A4A45] text-[#C6C1B3]"
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}