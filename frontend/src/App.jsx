import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import { DiscoverPage } from "./pages/DiscoverPage";
import { LibraryPage } from "./pages/LibraryPage";
import { WishlistPage } from "./pages/WishlistPage";
import { FavouritesPage } from "./pages/FavouritesPage";
import { ForumsPage } from "./pages/ForumsPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<DiscoverPage />} />
            <Route path="/library"
              element={
                <ProtectedRoute>
                  <LibraryPage />
                </ProtectedRoute>}
            />

            <Route path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />

            <Route path="/favourites"
              element={
                <ProtectedRoute>
                  <FavouritesPage />
                </ProtectedRoute>
              }
            />

            <Route path="/forums" element={<ForumsPage />} />

            <Route path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />

            <Route path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}
