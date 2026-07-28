/**
 * RecentPosts.jsx
 *
 * Displays the user's most recent discussion threads on their profile.
 * Pulls activity data from `getUserActivity`, sorts posts by creation date,
 * and renders each thread using the forum-level <ForumItem /> component.
 *
 * Dependencies:
 * - useAuth
 * - getUserActivity
 * - ForumItem
 * - Link
 */

import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/auth/useAuth";
import { getUserActivity } from "../../../api/discussion/discussionService";
import ForumItem from "../../forum/components/ForumItem";
import { Link } from "react-router-dom";

export default function RecentPosts() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await getUserActivity(user.id);

        if (res?.success) {
          const sorted = [...res.data.threads].sort(
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

    loadPosts();
  }, [user.id]);

  return (
    <div
      className="
        bg-[#111] border border-[#1e1e1e] rounded-xl p-4
        h-[400px] overflow-y-auto custom-scrollbar
      "
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-primary">
          Recent Posts
        </h2>

        <Link
          to="/profile/posts"
          className="text-xs text-[#b07a7a] hover:text-primary transition-colors"
        >
          View more
        </Link>
      </div>

      {loading && (
        <p className="text-xs text-[#777]">Loading posts...</p>
      )}

      {!loading && threads.length === 0 && (
        <p className="text-xs text-[#777]">No posts yet.</p>
      )}

      <div className="flex flex-col gap-3">
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