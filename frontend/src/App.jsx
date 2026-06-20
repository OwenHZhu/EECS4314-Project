import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { DiscoverPage } from "./pages/DiscoverPage";
import { LibraryPage } from "./pages/LibraryPage";
import { WishlistPage } from "./pages/WishlistPage";
import { FavouritesPage } from "./pages/FavouritesPage";
import { ForumsPage } from "./pages/ForumsPage";
import { ProfilePage } from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const [page, setPage] = useState("library");

  const pages = {
    discover: <DiscoverPage />,
    library: <LibraryPage />,
    wishlist: <WishlistPage />,
    favourites: <FavouritesPage />,
    forums: <ForumsPage />,
    profile: <ProfilePage />,
    login: <LoginPage />
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar page={page} setPage={setPage} />
      <main>{pages[page] ?? <DiscoverPage />}</main>
    </div>
  );
}
