/**
 * RecentActivity.jsx
 *
 * Shows the user's most recent library entries on their profile page.
 * Pulls data from the `useLibrary` hook, sorts entries by `updated_at`,
 * and displays them using `ProfileLibraryItem`.
 *
 * UI Features:
 * - Scrollable container with custom scrollbar
 * - “View more” link to the full library page
 * - Compact list of ProfileLibraryItem components
 *
 * Dependencies:
 * - useLibrary — provides the user's library entries
 * - ProfileLibraryItem — renders each entry
 * - Link — navigation to full library
 */

import { useLibrary } from "../../../hooks/library/useLibrary";
import ProfileLibraryItem from "./ProfileLibraryItem";
import { Link } from "react-router-dom";

export default function RecentActivity() {
  const { library } = useLibrary();

  const safeLibrary = Array.isArray(library) ? library : [];

  const sorted = [...safeLibrary].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  );

  const hasEntries = sorted.length > 0;

  return (
    <div
      className={`
        bg-[#111] border border-[#1e1e1e] rounded-xl p-4
        overflow-y-auto custom-scrollbar
        ${hasEntries ? "h-[400px]" : "h-auto"}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-primary">
          Recent Activity
        </h2>

        {hasEntries && (
          <Link
            to="/library"
            className="text-xs text-[#b07a7a] hover:text-primary transition-colors"
          >
            View more
          </Link>
        )}
      </div>

      {!hasEntries && (
        <p className="text-xs text-[#777]">No recent activity yet.</p>
      )}

      {hasEntries && (
        <div className="flex flex-col gap-3">
          {sorted.map((entry) => (
            <ProfileLibraryItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}