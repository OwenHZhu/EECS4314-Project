/**
 * StatCardGrid.jsx
 *
 * A layout component that arranges multiple profile stat cards
 * into a responsive grid. 
 *
 * Props:
 * @param {Array<{ value: number|string, label: string }>} stats
 *   An array of stat objects. Each object must contain:
 *   - value: The numeric or textual statistic
 *   - label: A short descriptor of the stat
 *
 * Behavior:
 * - Renders a 2‑column grid on mobile
 * - Expands to 4 columns on larger screens
 * - Each stat is passed directly into <StatCard />
 */

import StatCard from "./StatCard";

export default function StatCardGrid({ stats }) {
  return (
    <div
      className="
        grid grid-cols-2 sm:grid-cols-4 gap-3
        mb-6
      "
    >
      {stats.map((s) => (
        <StatCard key={s.label} value={s.value} label={s.label} />
      ))}
    </div>
  );
}