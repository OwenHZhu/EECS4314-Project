import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { DiscoverPage } from "./components/DiscoverPage";
import { LibraryPage } from "./components/LibraryPage";
import { WishlistPage } from "./components/WishlistPage";
import { FavouritesPage } from "./components/FavouritesPage";
import { ForumsPage } from "./components/ForumsPage";
import { ProfilePage } from "./components/ProfilePage";

export default function App() {
  const [page, setPage] = useState("library");

  const pages = {
    discover: <DiscoverPage />,
    library: <LibraryPage />,
    wishlist: <WishlistPage />,
    favourites: <FavouritesPage />,
    forums: <ForumsPage />,
    profile: <ProfilePage />,
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar page={page} setPage={setPage} />
      <main>{pages[page] ?? <DiscoverPage />}</main>
    </div>
  );
}
