/**
 * ./data/mockUser.js
 *
 * This file provides mock data used throughout the frontend before backend
 * services are fully implemented. It includes:
 *
 * - MOCK_USER: Temporary user profile data.
 * - LIBRARY: The user's personal library, including reading status and progress.
 * - WISHLIST_IDS: Book IDs the user has added to their wishlist.
 * - FAVOURITES_IDS: Book IDs marked as favourites.
 * - FORUMS: Mock forum threads associated with specific books.
 *
 * Allows the UI to function without backend integration and
 * provide predictable, structured data for development and testing.
 */

/*
MOCK_USER: Temporary user profile data
*/
export const MOCK_USER = {
  username: "alexreads",
  email: "alexm@gmail.com",
  profile_picture: 'random string',
  bio: "Fantasy & sci-fi addict. Always mid-series.",
  booksRead: 42,
  joined: "Jan 2024",
};

/*
LIBRARY: User's personal library entries
Each entry includes:
- bookId: ID referencing a book in BOOKS
- status: reading | read | dropped | want
- userRating: User's personal rating (null if not rated)
- progress: Percentage of book completed
*/
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

/*
WISHLIST_IDS: Book IDs the user marked for their wishlist
*/
export const WISHLIST_IDS = [2, 5, 10, 9];

/*
FAVOURITES_IDS: Book IDs the user marked as favourites
*/
export const FAVOURITES_IDS = [1, 3, 6, 11];

/*
FORUMS: Mock forum threads associated with books
Each thread includes:
- id: Unique thread identifier
- bookId: ID referencing a book in BOOKS
- title: Thread title
- category: spoilers | questions | theories
- author: Username of the thread creator
- replies: Number of replies
- views: Number of views
- lastActive: Human-readable activity timestamp
*/
export const FORUMS = [
  { id: 1, bookId: 1, title: "The ending of Dune — did Paul make the right choice?", category: "spoilers", author: "sandwormfan", replies: 34, views: 210, lastActive: "2h ago" },
  { id: 2, bookId: 1, title: "What does the spice actually do to your mind?", category: "questions", author: "galaxybrain", replies: 12, views: 88, lastActive: "5h ago" },
  { id: 3, bookId: 3, title: "Theory: Rocky is a [redacted] the whole time", category: "theories", author: "weir_nerd", replies: 19, views: 143, lastActive: "1d ago" },
  { id: 4, bookId: 6, title: "Is 1984 becoming more relevant today?", category: "questions", author: "thinkpiece99", replies: 57, views: 402, lastActive: "3h ago" },
  { id: 5, bookId: 11, title: "Bilbo vs Frodo — who had the harder journey?", category: "theories", author: "tolkien_deep", replies: 28, views: 175, lastActive: "6h ago" },
  { id: 6, bookId: 7, title: "Sanderson's magic systems are unmatched — discuss", category: "questions", author: "allomancer_ash", replies: 41, views: 290, lastActive: "12h ago" },
];