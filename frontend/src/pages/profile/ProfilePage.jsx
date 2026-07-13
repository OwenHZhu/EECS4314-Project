/**
 * ./pages/profile/ProfilePage.jsx
 *
 * The user's profile screen. Displays:
 * - User identity (username, email, join date, bio)
 * - Reading statistics (books read, currently reading, total tracked, avg rating)
 * - Reading breakdown by status (reading, read, want, dropped)
 * - Favourite books
 * - Logout modal
 *
 * Dependencies:
 * - BOOKS, STATUS_LABELS, STATUS_COLORS: Mock data for books and status styling.
 * - LIBRARY, FAVOURITES_IDS: Mock user library + favourites.
 * - useAuth: Provides user data and logout().
 * - useNavigate: Redirects user after logout or when editing profile.
 * - date-fns/format: Formats the user's join date.
 * - GenericModal: Reusable confirmation modal for logout.
 * - GenericButton: Reusable button.
 *
 * Behaviour:
 * - Clicking the logout icon opens a confirmation modal.
 * - Confirming logout clears auth state and redirects to /login.
 * - Derived values (readCount, avgRating, favourites, etc.) are computed from mock data.
 * - UI is fully responsive and uses TailwindCSS for styling.
 */

import { BOOKS, STATUS_LABELS, STATUS_COLORS } from "../../data/mockBook";
import { LIBRARY, FAVOURITES_IDS } from "../../data/mockUser";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth";
import { format } from "date-fns";
import GenericModal from "../../components/generic/GenericModal";
import GenericButton from "../../components/generic/GenericButton";

/**
 * StatCard
 *
 * Displays a single numeric statistic (e.g., books finished).
 *
 * @param {number|string} value - The statistic value.
 * @param {string} label - Description of the statistic.
 */
function StatCard({ value, label }) {
  return (
    <div className="bg-stat-card-fill border border-stat-card-border rounded-xl p-2 md:p-4 text-center">
      <p className="text-base md:text-lg font-semibold text-primary">{value}</p>
      <p className="text-xs md:text-sm text-caption mt-0.5">{label}</p>
    </div>
  );
}

/**
 * StatusItem
 *
 * Displays a reading-status badge (e.g., "Currently Reading").
 *
 * @param {Object} colors - Background, text, and border colors.
 * @param {number} count - Number of books with this status.
 * @param {string} s - Status key ("reading", "read", "want", "dropped").
 */
function StatusItem({ colors, count, s }) {
  return (
    <div
      key={s}
      className="px-3 py-2 rounded-xl border flex items-center gap-2"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <span
        className="text-sm font-semibold"
        style={{ color: colors.text }}
      >
        {count}
      </span>
      <span
        className="text-xs"
        style={{ color: colors.text + "aa" }}
      >
        {STATUS_LABELS[s]}
      </span>
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const { user, logout } = useAuth();

  /** Close the logout confirmation modal */
  function closeModal() {
    setShowLogout(false);
  }

  /** Handle confirmed logout: clear auth and redirect */
  function handleLogout() {
    logout();
    navigate("/login");
  }

  /** Open the logout confirmation modal */
  function openModal() {
    setShowLogout(true);
  }

  /**
   * Derived values from mock data
   * These compute reading stats and favourites for display.
   */
  const favourites = FAVOURITES_IDS
    .map((id) => BOOKS.find((b) => b.id === id))
    .filter(Boolean);

  const readCount = LIBRARY.filter((e) => e.status === "read").length;
  const readingCount = LIBRARY.filter((e) => e.status === "reading").length;

  const avgRating = (
    LIBRARY.filter((e) => e.userRating).reduce(
      (sum, e) => sum + e.userRating,
      0,
    ) / LIBRARY.filter((e) => e.userRating).length
  ).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <title>{`${user.username} | BookAtlas`}</title>

      {/* Logout confirmation modal */}
      {showLogout && (
        <GenericModal
          title="Logout?"
          cancelLabel="Cancel"
          confirmLabel="Logout"
          onConfirm={handleLogout}
          onCancel={closeModal}
        />
      )}

      {/* User identity section */}
      <div className="flex items-start gap-5 mb-6 md:mb-10">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#2d2845] flex items-center justify-center text-2xl font-semibold text-[#b8b0ff] shrink-0">
          {user.username[0]}
        </div>

        <div>
          <div className="flex flex-row items-center mt-3">
            <h1 className="text-lg md:text-2xl font-semibold text-primary">
              {user.username}
            </h1>

            {/* Logout icon */}
            <span
              onClick={openModal}
              alt="Logout icon"
              className="
                material-symbols-outlined cursor-pointer 
                ml-1 text-xl md:text-2xl
                [font-variation-settingss:'opsz'_20]
                sm:[font-variation-settings:'opsz'_20]
                md:[font-variation-settings:'opsz'_24]
                lg:[font-variation-settings:'opsz'_32]
              "
              style={{
                color: "#774949"
              }}>
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

        <GenericButton
          variant="secondary"
          className="py-3 px-8 mr-6 mb-2"
        >
          View Posts
        </GenericButton>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 border-t border-[#1a1a1a] pt-8">
        <StatCard value={readCount} label="Books finished" />
        <StatCard value={readingCount} label="Currently reading" />
        <StatCard value={LIBRARY.length} label="Total tracked" />
        <StatCard value={avgRating} label="Avg rating given" />
      </div>

      {/* Reading breakdown */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-[#333] mb-4">
          Reading breakdown
        </p>

        <div className="flex gap-2 flex-wrap">
          {["reading", "read", "want", "dropped"].map((s) => {
            const count = LIBRARY.filter((e) => e.status === s).length;
            const colors = STATUS_COLORS[s];
            return <StatusItem key={s} count={count} colors={colors} s={s} />;
          })}
        </div>
      </div>

      {/* Favourite books */}
      <div>
        <p className="text-xs uppercase tracking-widest text-[#333] mb-4">
          Favourite books
        </p>

        <div className="flex gap-3 flex-wrap">
          {favourites.map((book) => (
            <div
              key={book.id}
              className="flex items-center gap-2.5 bg-[#141414] border border-[#1e1e1e] rounded-xl px-3 py-2"
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-medium"
                style={{
                  backgroundColor: book.spineColor,
                  color: book.spineText,
                }}
              >
                {book.title[0]}
              </div>

              <div>
                <p className="text-[12px] text-[#ccc] font-medium">
                  {book.title}
                </p>
                <p className="text-[10px] text-[#444]">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}