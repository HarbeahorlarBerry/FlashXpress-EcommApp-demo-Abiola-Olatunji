// src/hooks/useCart.js
import { useContext } from "react";
import CartContext from "../context/CartContext";

const SAFE_CART = {
  cart: [],
  cartCount: 0,
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
};

export default function useCart() {
  return useContext(CartContext) ?? SAFE_CART;
}