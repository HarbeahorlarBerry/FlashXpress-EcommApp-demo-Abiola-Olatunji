import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Navbar from "../components/navbar/Navbar.jsx";
import Footer from "../components/footer/Footer.jsx";

import Auth from "../pages/Auth";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";

import Dashboard from "../pages/Dashboard";
import CreateProduct from "../pages/CreateProduct";
import MyProducts from "../pages/MyProducts";

import Orders from "../pages/Orders";
import Wallet from "../pages/Wallet";
import Analytics from "../pages/Analytics";
import SellerDashboard from "../pages/SellerDashboard";
import FraudMonitor from "../pages/FraudMonitor";
import Insights from "../pages/Insights";
import Chat from "../pages/Chat";
import Operations from "../pages/Operations";
import ProductDetails from "../pages/ProductDetails";
import Home from "../pages/Home.jsx";
import CategoryPage from "../pages/CategoryPage";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";

import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import useAuth from "../hooks/useAuth";
import { Loading } from "../components/ui/kit";

function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loading />
      </div>
    );
  }

  return (
    <Routes>
      {/* PUBLIC AUTH ROUTES */}
      <Route path="/" element={!user ? <Auth /> : <Navigate to="/home" replace />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/home" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* APP PAGES WITH NAVBAR & FOOTER LAYOUT */}
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* PRIVATE / PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/create-product"
          element={
            <ProtectedRoute>
              <CreateProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/my-products"
          element={
            <ProtectedRoute>
              <MyProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller"
          element={
            <ProtectedRoute>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fraud"
          element={
            <ProtectedRoute>
              <FraudMonitor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations"
          element={
            <ProtectedRoute>
              <Operations />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 CATCH-ALL */}
      <Route path="*" element={<Navigate to={user ? "/home" : "/login"} replace />} />
    </Routes>
  );
}