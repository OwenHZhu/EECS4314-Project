/**
 * StatCard.jsx
 *
 * A small, reusable display card for profile statistics.
 *
 * Props:
 * @param {number|string} value
 *   The statistic to display
 *
 * @param {string} label
 *   A short description of what the value represents (e.g., "Books Read").
 *
 */

export default function StatCard({ value, label }) {
  return (
    <div className="bg-stat-card-fill border border-stat-card-border rounded-xl p-4 text-center">
      <p className="text-lg font-semibold text-primary">{value}</p>
      <p className="text-sm text-caption mt-1">{label}</p>
    </div>
  );
}