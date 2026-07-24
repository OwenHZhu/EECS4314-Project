import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth.js";
import { format } from "date-fns";
import { getThreadById } from "../../api/discussion/discussionService.js";
import { getBookById } from "../../api/books/bookService.js";
import Icon from "../../components/generic/Icon.jsx";
import GenericButton from "../../components/generic/GenericButton.jsx";
import CommentSection from "./components/CommentSection.jsx";

export default function PostPage() {
    const { user } = useAuth();
    const { threadId } = useParams();
    const [thread, setThread] = useState(null);
    const [book, setBook] = useState(null);
    const [showSpoilers, setShowSpoilers] = useState(false);


    // Load thread
    useEffect(() => {
        async function loadThread() {
            const threadRes = await getThreadById(threadId);
            setThread(threadRes.data);
        }
        loadThread();
    }, [threadId]);

    // Load book once thread is ready
    useEffect(() => {
        if (!thread) return;

        async function loadBook() {
            const bookRes = await getBookById(thread.book_id);
            setBook(bookRes);
        }

        loadBook();
    }, [thread]);


    if (!thread || !book) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12">
                <p className="text-center text-[#888]">Loading post...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <title>{book.title} | {thread.author}</title>

            <p className="text-sm text-[#7E7272] mb-2">COMMUNITY</p>

            {/* Post Information */}
            <div className="flex flex-row">
                <img
                    className="w-28 h-auto rounded-lg mr-3"
                    src={book.cover_image}
                    alt={`Book cover for ${book.title}`}
                />

                <div className="m-3">
                    <p className="text-sm text-[#7E7272]">
                        {book.title} | {book.author}
                    </p>

                    <h2 className="mt-2 text-2xl text-[#C6C1B3] font-bold">
                        {thread.title}
                    </h2>

                    <h4 className="text-sm text-[#7E7272]">by {thread.author}</h4>
                    <p className="text-sm mt-1 text-[#7E7272]/80">
                        {format(thread.created_at, "MMMM dd, yyy")}
                    </p>
                </div>
            </div>

            {/* Spoilers warning */}
            {thread.has_spoilers && user.id !== thread.user_id && (
                <GenericButton
                    variant="spoilers"
                    className="py-2 px-3 mt-5"
                    onClick={() => setShowSpoilers(prev => !prev)}
                >
                    {showSpoilers ? "Hide Spoilers" : "Reveal Spoilers"}
                </GenericButton>
            )}


            {/* Post Content */}
            <div className="relative bg-[#170E0F/65] border border-[#727C7E] w-full h-fit rounded-lg mt-5">
                <p
                    className={`text-[#C6C1B3] p-5 ${thread.has_spoilers && user.id !== thread.user_id && !showSpoilers ? "blur-sm" : ""
                        }`}
                >
                    {thread.content}
                </p>

                <div className="m-3 flex gap-3">
                    <div className="rounded-full text-xs py-2 px-3 bg-transparent border-2 border-generic-button-ghost-border">
                        X Comments
                    </div>

                    <div className="rounded-full text-xs py-2 px-3 bg-transparent border-2 border-generic-button-ghost-border">
                        X Likes
                    </div>
                </div>


                {/* Edit/Delete icons for post owner */}
                {user.id === thread.user_id && (
                    <div className="absolute bottom-3 right-3 bg-transparent backdrop-blur-sm 
                    border border-[#727C7E] rounded-full px-3 py-1 flex gap-3 items-center">
                        <Icon className="text-[#3A2A2A] text-sm">edit</Icon>
                        <Icon className="text-[#3A2A2A] text-sm">delete</Icon>
                    </div>
                )}
            </div>

            <CommentSection thread={thread} />

        </div>
    );
}