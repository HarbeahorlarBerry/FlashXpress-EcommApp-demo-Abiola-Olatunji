// src/context/WishlistProvider.jsx
import { useEffect, useState } from "react";
import WishlistContext from "./WishlistContext"; // adjust casing if needed

const STORAGE_KEY = "flashxpress_wishlist_v1";

function loadInitialWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(loadInitialWishlist);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore storage errors
    }
  }, [wishlist]);

  const addWishlist = (product) => {
    if (!product) return;
    const itemId = product._id || product.id || product.name;
    setWishlist((prev) => {
      const exists = prev.some(
        (item) => (item._id || item.id || item.name) === itemId
      );
      return exists ? prev : [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) =>
      prev.filter((item) => (item._id || item.id || item.name) !== id)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addWishlist,
        addToWishlist: addWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}