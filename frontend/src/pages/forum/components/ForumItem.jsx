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
            <div
                className="
        relative group flex items-center gap-4 px-5 py-4 rounded-xl
        bg-[#141312] border border-[#2a2a2a]
        hover:border-[#7a2635]
        hover:shadow-[0_0_20px_rgba(122,38,53,0.15)]
        transition-all cursor-pointer overflow-hidden
    "
            >
                {/* Grain overlay */}
                <div className="absolute inset-0 opacity-[0.08] bg-[url('/grain.png')] bg-repeat pointer-events-none"></div>

                {/* Book cover with ribbon */}
                <div className="relative">
                    <div className="absolute top-0 left-2 w-1.5 h-4 bg-[#7a2635] rounded-b-sm opacity-80"></div>
                    <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-14 h-20 object-cover rounded-md shadow-[0_0_6px_rgba(0,0,0,0.4)] border border-[#1e1e1e]"
                    />
                </div>

                {/* Divider */}
                <div className="w-[1px] h-14 bg-[#2a2a2a] group-hover:bg-[#7a2635] transition-colors"></div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#c7c2b8] mb-1">{book.title}</p>

                    <h3 className="text-[15px] text-[#f3eeeb] font-medium group-hover:text-[#e8d9c5] transition-colors truncate">
                        {thread.title}
                    </h3>

                    <p className="text-[11px] text-[#a89292] mt-1">
                        by{" "}
                        <Link
                            to={`/users/${author.id}/posts`}
                            className="hover:text-primary transition-colors"
                        >
                            {author.username}
                        </Link>
                    </p>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end shrink-0 text-right gap-2">
                    <p className="text-[11px] text-[#b07a7a]">
                        {new Date(thread.created_at).toLocaleDateString()}
                    </p>

                    <div className="flex flex-col items-end gap-1">
                        {topTags.map(tag => (
                            <span
                                key={tag.id}
                                className="
                        text-[10px] px-2 py-1 rounded-md
                        border border-[#3a2f2f]
                        text-[#cbb7a7]
                        bg-[#1a1817]
                        shadow-[0_0_4px_rgba(0,0,0,0.3)]
                        group-hover:border-[#7a2635]
                        transition-all
                    "
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