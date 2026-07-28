/**
 * ProfilePage.jsx
 *
 * The main profile screen for a BookAtlas user. This page brings together:
 *
 * - User identity (username, email, join date, bio)
 * - Profile picture or fallback icon
 * - Logout flow with confirmation modal
 * - Profile editing entry point
 * - Computed statistics (books read, posts created, etc.)
 * - Recent posts + recent library activity
 *
 * Dependencies:
 * - useAuth - user identity, logout, token
 * - useUser - profile picture URL
 * - useLibrary - user’s library entries
 * - getUserActivity - user’s posts
 * - computeProfileStats - transforms library + threads into stat objects
 *
 * Layout:
 * - Desktop: two-column layout for RecentPosts + RecentActivity
 * - Mobile: stacked layout
 * 
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/auth/useAuth";
import { useUser } from "../../hooks/user/useUser";
import { useLibrary } from "../../hooks/library/useLibrary";

import { format } from "date-fns";
import { computeProfileStats } from "../../utils/profileStats.js";

import GenericModal from "../../components/generic/GenericModal";
import GenericButton from "../../components/generic/GenericButton";
import Icon from "../../components/generic/Icon.jsx";

import StatCardGrid from "./components/StatCardGrid.jsx";
import RecentPosts from "./components/RecentPosts";
import RecentActivity from "./components/RecentActivity";

import { getUserActivity } from "../../api/discussion/discussionService";

export function ProfilePage() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const { user, logout } = useAuth();
  const { profilePictureUrl } = useUser();
  const { library } = useLibrary();

  const [threads, setThreads] = useState([]);

  /**
   * Load the user's discussion threads for stats + recent posts.
   */
  useEffect(() => {
    async function loadThreads() {
      const res = await getUserActivity(user.id);
      if (res?.success) {
        setThreads(res.data.threads);
      }
    }
    loadThreads();
  }, [user.id]);

  /**
   * Compute profile statistics from library + threads.
   */
  const stats = computeProfileStats(library, threads);

  function closeModal() {
    setShowLogout(false);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function openModal() {
    setShowLogout(true);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <title>{`${user.username} | BookAtlas`}</title>

      {showLogout && (
        <GenericModal
          title="Logout?"
          cancelLabel="Cancel"
          confirmLabel="Logout"
          onConfirm={handleLogout}
          onCancel={closeModal}
        />
      )}

      {/* Header */}
      <div className="flex flex-row items-center gap-5 mb-6 md:mb-10">
        {!profilePictureUrl && (
          <Icon className="text-secondary text-6xl cursor-default">
            account_circle
          </Icon>
        )}

        {profilePictureUrl && (
          <img
            src={profilePictureUrl}
            alt={`${user.username}'s profile picture`}
            className="rounded-full w-12 h-12 md:w-16 md:h-16"
          />
        )}

        <div>
          <div className="flex flex-row items-center mt-3">
            <h1 className="text-lg md:text-2xl font-semibold text-primary">
              {user.username}
            </h1>

            <span
              onClick={openModal}
              className="
                material-symbols-outlined cursor-pointer 
                ml-1 text-xl md:text-2xl
              "
              style={{ color: "#774949" }}
            >
              logout
            </span>
          </div>

          <p className="text-xs text-caption">
            {user.email} · joined {format(new Date(user.created_at), "MMMM dd, yyyy")}
          </p>

          <p className="text-xs text-bio mt-2">{user.bio}</p>
        </div>
      </div>

      {/* Profile actions */}
      <div className="mb-6 md:mb-8">
        <GenericButton
          onClick={() => navigate("edit")}
          variant="primary"
          className="py-3 px-8 mr-6 mb-2"
        >
          Edit Profile
        </GenericButton>
      </div>

      {/* Stat Cards */}
      <StatCardGrid stats={stats} />

      {/* Desktop: two columns */}
      <div className="hidden md:grid grid-cols-2 gap-6">
        <RecentPosts />
        <RecentActivity />
      </div>

      {/* Mobile/Tablet: stacked */}
      <div className="flex flex-col gap-6 md:hidden">
        <RecentActivity />
        <RecentPosts />
      </div>
    </div>
  );
}