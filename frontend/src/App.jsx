/**
 * ./App.jsx
 * 
 * App component: defines the main routing structure for the application.
 * Uses React Router to map URL paths to page components and wraps
 * protected pages with <ProtectedRoute> to enforce authentication.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Navbar } from "./components/nav/Navbar";
import { DiscoverPage } from "./pages/DiscoverPage";
import LibraryPage from "./pages/library/LibraryPage";
import ForumsPage from "./pages/forum/ForumsPage";
import PostPage from "./pages/forum/PostPage";
import CreatePostPage from "./pages/forum/CreatePostPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import UserPostsPage from "./pages/profile/UserPostsPage";
import { SearchPage } from "./pages/search/SearchPage";
import LoginPage from "./pages/login/LoginPage";
import RegisterPage from "./pages/register/RegisterPage";
import ChangePasswordPage from "./pages/profile/ChangePasswordPage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import BookPage from "./pages/books/BookPage";

/**
 * The root application component.
 *
 * - Wraps the app in <BrowserRouter> to enable client-side routing.
 * - Renders the global <Navbar>.
 * - Defines all route mappings inside <Routes>.
 * - Uses <ProtectedRoute> to restrict access to authenticated-only pages.
 *
 * @returns {JSX.Element} The rendered application layout and route structure.
 */
export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <BrowserRouter>
        {/* Global navigation bar displayed on all pages */}
        <Navbar />

        <main>
          <Routes>
            {/* Public route: Discover page */}
            <Route path="/" element={<DiscoverPage />} />

            {/* Public route: Individual book page */}
            <Route path="/books/:bookId" element={<BookPage />} />

            {/* Public route: Search page */}
            <Route path="/search" element={<SearchPage />} />

            {/* Protected route: Library */}
            <Route path="/library"
              element={
                <ProtectedRoute>
                  <LibraryPage />
                </ProtectedRoute>}
            />

            {/* Public route: Forums */}
            <Route path="/forums" element={<ForumsPage />} />

            {/* Public route: Individual posts */}
            <Route path="/forums/:threadId" element={<PostPage />} />

            {/* Public route: User's posts */}
            <Route path="/users/:userId/posts" element={<UserPostsPage />} />

            {/* Protected route: Create posts */}
            <Route path="/forums/create/:bookId"
              element={
                <ProtectedRoute>
                  <CreatePostPage />
                </ProtectedRoute>
              }
            />

            {/* Protected route: Edit Profile */}
            <Route path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Protected route: Profile */}
            <Route path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Protected route: Change Password */}
            <Route path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />

            {/* Public auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}