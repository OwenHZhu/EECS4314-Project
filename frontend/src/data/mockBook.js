/**
 * ./data/mockBook.js
 *
 * This file provides mock data used throughout the frontend before full
 * backend integration. It includes:
 *
 * - BOOKS: An array of book objects used for rendering book cards, lists,
 *   and testing UI components.
 * - GENRES: A list of genre keys used for filters and dropdowns.
 * - GENRE_LABELS: Human-readable labels for each genre key.
 * - STATUS_LABELS: Labels for reading status categories.
 * - STATUS_COLORS: Color presets for status badges (background, text, border).
 *
 * Allows the UI to function without backend services and
 * provide predictable data for development and testing.
 */

/*
BOOKS: Mock book objects used for UI rendering
*/
export const BOOKS = [
  {
    id: 1,
    title: "Dune",
    author: "Frank Herbert",
    genre: "sci-fi",
    rating: 4.8,
    spineColor: "#d1f0e8",
    spineText: "#0a5740",
  },
  {
    id: 2,
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    genre: "fantasy",
    rating: 4.7,
    spineColor: "#e8e6fc",
    spineText: "#3c3489",
  },
  {
    id: 3,
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "sci-fi",
    rating: 4.9,
    spineColor: "#ddeefb",
    spineText: "#0c447c",
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "non-fiction",
    rating: 4.6,
    spineColor: "#faeeda",
    spineText: "#633806",
  },
  {
    id: 5,
    title: "The Hitchhiker's Guide",
    author: "Douglas Adams",
    genre: "sci-fi",
    rating: 4.7,
    spineColor: "#ddeefb",
    spineText: "#0c447c",
  },
  {
    id: 6,
    title: "1984",
    author: "George Orwell",
    genre: "fiction",
    rating: 4.8,
    spineColor: "#fce8e8",
    spineText: "#791f1f",
  },
  {
    id: 7,
    title: "Mistborn",
    author: "Brandon Sanderson",
    genre: "fantasy",
    rating: 4.8,
    spineColor: "#e8e6fc",
    spineText: "#3c3489",
  },
  {
    id: 8,
    title: "Gone Girl",
    author: "Gillian Flynn",
    genre: "mystery",
    rating: 4.3,
    spineColor: "#fbe8f0",
    spineText: "#72243e",
  },
  {
    id: 9,
    title: "Neuromancer",
    author: "William Gibson",
    genre: "sci-fi",
    rating: 4.5,
    spineColor: "#ddeefb",
    spineText: "#0c447c",
  },
  {
    id: 10,
    title: "Thinking Fast and Slow",
    author: "Daniel Kahneman",
    genre: "non-fiction",
    rating: 4.5,
    spineColor: "#faeeda",
    spineText: "#633806",
  },
  {
    id: 11,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "fantasy",
    rating: 4.9,
    spineColor: "#e5f2da",
    spineText: "#27500a",
  },
  {
    id: 12,
    title: "Big Little Lies",
    author: "Liane Moriarty",
    genre: "mystery",
    rating: 4.4,
    spineColor: "#fbe8f0",
    spineText: "#72243e",
  },
];

/*
GENRES: Genre keys used for filtering and UI controls
*/
export const GENRES = [
  "all",
  "fiction",
  "sci-fi",
  "fantasy",
  "non-fiction",
  "mystery",
];

/*
GENRE_LABELS: Human-readable labels for genre keys
*/
export const GENRE_LABELS = {
  all: "All",
  "sci-fi": "Sci-Fi",
  fantasy: "Fantasy",
  fiction: "Fiction",
  "non-fiction": "Non-Fiction",
  mystery: "Mystery",
};

/*
STATUS_LABELS: Labels for reading status categories
*/
export const STATUS_LABELS = {
  reading: "Currently Reading",
  read: "Finished",
  dropped: "Dropped",
  want: "Want to Read",
};

/*
STATUS_COLORS: Color presets for status badges
*/
export const STATUS_COLORS = {
  reading: { bg: "#1a2e1a", text: "#4ade80", border: "#166534" },
  read: { bg: "#1a1a2e", text: "#818cf8", border: "#3730a3" },
  dropped: { bg: "#2e1a1a", text: "#f87171", border: "#991b1b" },
  want: { bg: "#1e1e1a", text: "#facc15", border: "#854d0e" },
};