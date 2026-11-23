// src/hooks/useWishlist.js
import { useContext } from "react";
import WishlistContext from "../context/WishlistContext";

const SAFE_WISHLIST = {
  wishlist: [],
  addWishlist: () => {},
  addToWishlist: () => {},
  removeFromWishlist: () => {},
};

export default function useWishlist() {
  return useContext(WishlistContext) ?? SAFE_WISHLIST;
}