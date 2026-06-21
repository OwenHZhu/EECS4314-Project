import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import { DiscoverPage } from "./pages/DiscoverPage";
import { LibraryPage } from "./pages/LibraryPage";
import { WishlistPage } from "./pages/WishlistPage";
import { FavouritesPage } from "./pages/FavouritesPage";
import { ForumsPage } from "./pages/ForumsPage";
import { ProfilePage } from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element ={<DiscoverPage />} />
            <Route path="/library" element ={<LibraryPage />} />
            <Route path="/wishlist" element ={<WishlistPage />} />
            <Route path="/favourites" element ={<FavouritesPage />} />
            <Route path="/forums" element ={<ForumsPage />} />
            <Route path="/profile" element ={<ProfilePage />} />
            <Route path="/login" element ={<LoginPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}
