import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getThreads } from "../../../api/discussion/discussionService";
import ForumItem from "../../forum/components/ForumItem";

export default function BookForumSection({ bookId }) {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadThreads() {
            try {
                const res = await getThreads(bookId);
                const threadList = Array.isArray(res?.data)
                ? res.data : Array.isArray(res?.data?.threads)
                ? res.data.threads : [];

            setThreads(threadList);
            } catch (err) {
                console.error("Failed to load threads:", err);
            } finally {
                setLoading(false);
            }
        }

        loadThreads();
    }, [bookId]);

    if (loading) {
        return <p className="text-xs text-[#666] mt-4">Loading discussions...</p>;
    }

    return (
        <section className="mt-10">

            {/* Header row with title + button */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Discussions</h2>

                <Link to={`/forums/create/${bookId}`}>
                    <button
                        type="button"
                        className="text-xs text-tertiary hover:text-primary px-3 py-1 border border-secondary rounded-lg"
                    >
                        Start Discussion
                    </button>
                </Link>
            </div>

            {/* Thread list */}
            {threads.length === 0 ? (
                <p className="text-xs text-[#777] mt-4">
                    No discussions yet for this book.
                </p>
            ) : (
                <div className="mt-4 space-y-4">
                    {threads.map(thread => (
                        <ForumItem key={thread.id} thread={thread} />
                    ))}
                </div>
            )}

            {/* View More */}
            <div className="mt-6 text-center">
                <Link
                    to="/forums"
                    className="text-xs text-tertiary hover:text-primary"
                >
                    View More Discussions
                </Link>
            </div>
        </section>
    );
}