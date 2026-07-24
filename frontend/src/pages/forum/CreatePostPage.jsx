import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth.js";
import { getBookById } from "../../api/books/bookService.js";
import { postThread } from "../../api/discussion/discussionService.js";
import GenericButton from "../../components/generic/GenericButton.jsx";

export default function CreatePostPage() {
    const navigate = useNavigate();
    const { bookId } = useParams();
    const { token } = useAuth();

    const [book, setBook] = useState(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [hasSpoilers, setHasSpoilers] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Load book info
    useEffect(() => {
        async function loadBook() {
            try {
                const res = await getBookById(bookId);
                setBook(res);
            } catch (err) {
                console.error("Failed to load book:", err);
            }
        }
        loadBook();
    }, [bookId]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!title.trim() || !content.trim()) {
            setError("Title and content are required.");
            return;
        }

        setLoading(true);

        try {
            const res = await postThread(
                token,
                title,
                content,
                bookId,
                hasSpoilers,
                [] // tags (empty for now)
            );

            navigate(`/forums/${res.data.id}`);
        } catch (err) {
            setError("Failed to create discussion.");
        } finally {
            setLoading(false);
        }
    }

    if (!book) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12">
                <p className="text-center text-[#888]">Loading book...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <p className="text-sm text-[#7E7272] mb-2">COMMUNITY</p>

            <h2 className="text-2xl text-[#C6C1B3] font-bold">
                Create a Discussion
            </h2>

            <p className="text-sm text-[#7E7272] mt-1">
                Start a conversation about this book.
            </p>

            {/* Book preview */}
            <div className="flex flex-row mt-6">
                <img
                    className="w-28 h-auto rounded-lg mr-3"
                    src={book.cover_image}
                    alt={`Book cover for ${book.title}`}
                />

                <div className="m-3">
                    <p className="text-sm text-[#7E7272]">{book.title}</p>
                    <p className="text-xs text-[#7E7272]/80">{book.author}</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">

                {error && (
                    <p className="text-xs text-red-400">{error}</p>
                )}

                {/* Title */}
                <div>
                    <label className="text-sm text-[#7E7272]">Title</label>
                    <input
                        type="text"
                        className="mt-2 w-full bg-transparent border border-[#727C7E] rounded-lg px-3 py-2 text-sm text-[#C6C1B3]"
                        placeholder="Enter a discussion title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Content */}
                <div>
                    <label className="text-sm text-[#7E7272]">Content</label>
                    <textarea
                        className="mt-2 w-full bg-transparent border border-[#727C7E] rounded-lg px-3 py-2 text-sm text-[#C6C1B3] h-40"
                        placeholder="Write your post..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                {/* Spoilers */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="spoilers"
                        checked={hasSpoilers}
                        onChange={() => setHasSpoilers(!hasSpoilers)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="spoilers" className="text-sm text-[#7E7272]">
                        Contains spoilers
                    </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-6">
                    <GenericButton
                        variant="secondary"
                        className="px-4 py-2 text-sm"
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </GenericButton>

                    <GenericButton
                        className="px-4 py-2 text-sm"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Post"}
                    </GenericButton>
                </div>
            </form>
        </div>
    );
}