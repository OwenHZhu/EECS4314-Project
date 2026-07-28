/**
 * UserPostsPage.jsx
 *
 * Full-page view showing **all discussion threads created by the logged-in user**.
 * This expands on the smaller “Recent Posts” widget from the profile page by
 * providing a complete, chronologically sorted list.
 *
 * Dependencies:
 * - useAuth - provides the current user
 * - getUserActivity - returns user’s posts
 * - ForumItem - renders each thread preview
 * 
 */

import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/auth/useAuth";
import { getUserActivity } from "../../api/discussion/discussionService";
import ForumItem from "../forum/components/ForumItem";

export default function UserPostsPage() {
    const { user } = useAuth();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const res = await getUserActivity(user.id);
            if (res?.success) {
                const sorted = [...res.data.threads].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setThreads(sorted);
            }
            setLoading(false);
        }
        load();
    }, [user.id]);

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <title>{`${user.username}'s Posts | BookAtlas`}</title>

            <h1 className="text-xl font-semibold text-primary mb-6">
                All Posts by {user.username}
            </h1>

            {loading && <p className="text-xs text-[#777]">Loading...</p>}

            {!loading && threads.length === 0 && (
                <p className="text-xs text-[#777]">No posts yet.</p>
            )}

            <div className="flex flex-col gap-4">
                {threads.map((thread) => (
                    <ForumItem
                        key={thread.id}
                        thread={{
                            ...thread,
                            author: user.username,
                            datePosted: new Date(thread.created_at).toLocaleDateString(),
                        }}
                    />
                ))}
            </div>
        </div>
    );
}