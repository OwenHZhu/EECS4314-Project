/**
 * UserPostsPage.jsx
 *
 * Full-page view showing **all discussion threads created by a user**.
 *
 * Dependencies:
 * - getUserActivity - returns user’s posts
 * - ForumItem - renders each thread preview
 * 
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserActivity } from "../../api/discussion/discussionService";
import { getUser } from "../../api/auth/authService";
import ForumItem from "../forum/components/ForumItem";

export default function UserPostsPage() {
    const { userId } = useParams();

    const [userMeta, setUserMeta] = useState(null);
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                // Fetch user details
                const userRes = await getUser(userId);

                if (userRes?.success) {
                    setUserMeta(userRes.data);
                }

                // Fetch user activity (threads)
                const activityRes = await getUserActivity(userId);

                if (activityRes?.success) {
                    const sorted = [...activityRes.data.threads].sort(
                        (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    );
                    setThreads(sorted);
                }
            } catch (err) {
                console.log("Failed to load user posts:", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [userId]);

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <title>{`${userMeta?.username}'s Posts | BookAtlas`}</title>

            <h1 className="text-xl font-semibold text-primary mb-6">
                All Posts by {userMeta?.username}
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
                            author: userMeta?.username,
                            datePosted: new Date(thread.created_at).toLocaleDateString(),
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
