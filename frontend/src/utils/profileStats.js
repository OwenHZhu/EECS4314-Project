// utils/profileStats.js

export function computeProfileStats(library, threads) {
  const finished = library.filter(e => e.status === "read").length;
  const reading = library.filter(e => e.status === "reading").length;

  const rated = library.filter(e => typeof e.rating === "number");
  const avgRating =
    rated.length > 0
      ? (rated.reduce((sum, e) => sum + e.rating, 0) / rated.length).toFixed(1)
      : "0.0";

  const postCount = threads.length;

  return [
    { label: "Books Finished", value: finished },
    { label: "Books Reading", value: reading },
    { label: "Average Rating", value: avgRating },
    { label: "Number of Posts", value: postCount },
  ];
}