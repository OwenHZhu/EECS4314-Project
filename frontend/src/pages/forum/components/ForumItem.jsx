import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBookById } from "../../../api/books/bookService";
import { getUser } from "../../../api/auth/authService";

export default function ForumItem({ thread }) {
    const [book, setBook] = useState(null);
    const [author, setAuthor] = useState(null);

    useEffect(() => {
        async function loadBook() {
            const res = await getBookById(thread.book_id);
            setBook(res);
        }
        loadBook();
    }, [thread.book_id]);

    useEffect(() => {
        async function loadAuthor() {
            const res = await getUser(thread.user_id);
            if (res?.success) {
                setAuthor(res.data);
            }
        }
        loadAuthor();
    }, [thread.user_id]);

    if (!book || !author) {
        return (
            <div className="text-xs p-4 border rounded text-[#444]">
                Loading thread info...
            </div>
        );
    }

    const topTags = thread.tags?.slice(0, 3) || [];

    return (
        <Link to={`/forums/${thread.id}`}>
            <div className="bg-[#171615] border border-[#1E3C36] rounded-xl px-4 py-3.5
                hover:border-[#7a2635] transition-colors cursor-pointer
                flex items-center gap-4"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-[#d7cfcf] shrink-0 max-w-fit">
                            {book.title}
                        </span>
                    </div>

                    <p className="text-[13px] text-[#f3eeeb] truncate">
                        {thread.title}
                    </p>

                    <p className="text-[11px] text-[#c4a3a3] mt-0.5">
                        by {author.username}
                    </p>
                </div>

                <div className="flex flex-col items-end shrink-0 text-right gap-2">
                    <p className="text-[11px] text-[#b07a7a]">
                        {thread.datePosted}
                    </p>

                    <div className="flex flex-col items-end gap-1">
                        {topTags.map(tag => (
                            <span
                                key={tag.id}
                                className="text-[10px] px-2 py-1 rounded-lg border border-secondary text-tertiary hover:text-primary transition"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
}