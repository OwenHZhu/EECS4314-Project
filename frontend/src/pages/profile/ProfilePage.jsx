import { BOOKS, STATUS_LABELS, STATUS_COLORS } from "../../data/mockBook";
import { LIBRARY, FAVOURITES_IDS } from "../../data/mockUser";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutModal from "../../components/auth/LogoutModal";
import { useAuth } from "../../context/auth/useAuth";

function StatCard({ value, label }) {
  return (
    <div className="bg-stat-card-fill border border-stat-card-border rounded-xl p-4 text-center">
      <p className="text-lg font-semibold text-primary">{value}</p>
      <p className="text-sm text-caption mt-0.5">{label}</p>
    </div>
  );
}

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
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  function openModal() {
    setShowLogout(true);
  }

  const favourites = FAVOURITES_IDS.map((id) =>
    BOOKS.find((b) => b.id === id),
  ).filter(Boolean);
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
      {showLogout && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <LogoutModal setShowLogout={setShowLogout} />
        </div>
      )}
      <div className="flex items-start gap-5 mb-10 pb-2">
        <div className="w-16 h-16 rounded-full bg-[#2d2845] flex items-center justify-center text-2xl font-semibold text-[#b8b0ff] shrink-0">
          {user.username[0]}
        </div>
        <div>
          <div className="flex flex-row pt-3">
            <h1 className="text-2xl font-semibold text-primary leading-tight">
              {user.username}
            </h1>
            <img
              onClick={openModal}
              src="../../src/assets/logout-icon.png"
              alt="Logout icon" className="w-6 h-6 cursor-pointer mt-1 ml-2"
            />
          </div>
          <p className="text-xs text-caption mt-1">
            {user.email} · joined {user.created_at}
          </p>
          <p className="text-xs text-bio mt-2">{user.bio ? user.bio : "No bio yet!"}</p>
        </div>
      </div>

      <div className="mb-8">
        <button
          onClick={() => { navigate("edit") }}
          className="text-sm text-primary bg-edit-profile py-3 px-8 rounded-full mr-6 mb-2 transition-colors hover:bg-edit-profile-hover"
        >
          Edit Profile
        </button>
        <button className="text-sm text-primary bg-view-posts py-3 px-8 rounded-full transition-colors hover:bg-view-posts-hover">View Posts</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 border-t border-[#1a1a1a] pt-8">
        <StatCard value={readCount} label="Books finished" />
        <StatCard value={readingCount} label="Currently reading" />
        <StatCard value={LIBRARY.length} label="Total tracked" />
        <StatCard value={avgRating} label="Avg rating given" />
      </div>

      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-widest text-[#333] mb-4">
          Reading breakdown
        </p>
        <div className="flex gap-2 flex-wrap">
          {["reading", "read", "want", "dropped"].map((s) => {
            const count = LIBRARY.filter((e) => e.status === s).length;
            const colors = STATUS_COLORS[s];
            return <StatusItem key={s} count={count} colors={colors} s={s} />
          })}
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-widest text-[#333] mb-4">
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
