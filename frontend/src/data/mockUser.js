// Mock user state — replace with real auth/API later
export const MOCK_USER = {
  username: "alexreads",
  displayName: "Alex M.",
  bio: "Fantasy & sci-fi addict. Always mid-series.",
  booksRead: 42,
  joined: "Jan 2024",
};

export const LIBRARY = [
  { bookId: 3, status: "reading", userRating: null, progress: 62 },
  { bookId: 1, status: "read",    userRating: 5,    progress: 100 },
  { bookId: 6, status: "read",    userRating: 5,    progress: 100 },
  { bookId: 11, status: "read",   userRating: 5,    progress: 100 },
  { bookId: 7, status: "read",    userRating: 4,    progress: 100 },
  { bookId: 8, status: "dropped", userRating: 3,    progress: 40 },
  { bookId: 2, status: "want",    userRating: null, progress: 0 },
  { bookId: 9, status: "want",    userRating: null, progress: 0 },
];

export const WISHLIST_IDS = [2, 5, 10, 9];
export const FAVOURITES_IDS = [1, 3, 6, 11];

export const FORUMS = [
  { id: 1, bookId: 1, title: "The ending of Dune — did Paul make the right choice?", category: "spoilers", author: "sandwormfan", replies: 34, views: 210, lastActive: "2h ago" },
  { id: 2, bookId: 1, title: "What does the spice actually do to your mind?", category: "questions", author: "galaxybrain", replies: 12, views: 88, lastActive: "5h ago" },
  { id: 3, bookId: 3, title: "Theory: Rocky is a [redacted] the whole time", category: "theories", author: "weir_nerd", replies: 19, views: 143, lastActive: "1d ago" },
  { id: 4, bookId: 6, title: "Is 1984 becoming more relevant today?", category: "questions", author: "thinkpiece99", replies: 57, views: 402, lastActive: "3h ago" },
  { id: 5, bookId: 11, title: "Bilbo vs Frodo — who had the harder journey?", category: "theories", author: "tolkien_deep", replies: 28, views: 175, lastActive: "6h ago" },
  { id: 6, bookId: 7, title: "Sanderson's magic systems are unmatched — discuss", category: "questions", author: "allomancer_ash", replies: 41, views: 290, lastActive: "12h ago" },
];