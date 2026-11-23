import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthProvider";
import { SocketProvider } from "./context/SocketProvider"; // Make sure this path matches your project structure
import { ThemeProvider } from "./context/ThemeContext";
import { RegionProvider } from "./context/RegionContext";
import CartProvider from "./context/CartProvider";
import WishlistProvider from "./context/WishlistProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <RegionProvider>
          <AuthProvider>
            <SocketProvider>
              <CartProvider>
                <WishlistProvider>
                  <AppRoutes />
                </WishlistProvider>
              </CartProvider>
            </SocketProvider>
          </AuthProvider>
        </RegionProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);