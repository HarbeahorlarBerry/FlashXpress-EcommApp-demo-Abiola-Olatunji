import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthProvider";
import AppRoutes from "./routes/AppRoutes.jsx";
import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "!bg-white !text-zinc-900 dark:!bg-zinc-800 dark:!text-zinc-100 font-sans shadow-xl border border-gray-100 dark:border-zinc-700",
        }}
      />
      <AppRoutes />
    </AuthProvider>
  );
}


// import { Outlet } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import Navbar from "./components/navbar/Navbar.jsx";
// import Footer from "./components/footer/Footer.jsx";
// import AppRoutes from "./routes/AppRoutes.jsx";

// export function Layout() {
//   return (
//     <div className="flex min-h-screen flex-col">
//       <Navbar />
//       <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
//         <Outlet />
//       </main>
//       <Footer />
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <>
//       <Toaster 
//         position="top-center" 
//         toastOptions={{ 
//           className: "!bg-white !text-zinc-900 dark:!bg-zinc-800 dark:!text-zinc-100" 
//         }} 
//       />
//       <AppRoutes />
//     </>
//   );
// }

// import { Link, Outlet, Route, Routes } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import Navbar from "./components/navbar/Navbar.jsx";
// import Footer from "./components/footer/Footer.jsx";
// import Home from "./pages/Home.jsx";
// import Products from "./pages/MyProducts.jsx";
// import ProductDetail from "./pages/ProductDetails.jsx";
// import Cart from "./pages/Cart.jsx";
// import Login from "./pages/Login.jsx";
// import Register from "./pages/Register.jsx";
// // import Verify from "./pages/Verify";
// import Checkout from "./pages/Checkout.jsx";
// // import CheckoutResult from "./pages/CheckoutResult";
// import Orders from "./pages/Orders.jsx";
// // import OrderDetail from "./pages/OrderDetails.jsx";
// import Wishlist from "./pages/Wishlist";
// import Account from "./pages/Account";
// import SellerDashboard from "./pages/SellerDashboard.jsx";
// import AdminDashboard from "./pages/AdminDashboard.jsx";
// import Insights from "./pages/Insights.jsx";
// import RequireRole from "./components/RequireRole";

// function Layout() {
//   return (
//     <div className="flex min-h-screen flex-col">
//       <Navbar />
//       <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
//         <Outlet />
//       </main>
//       <Footer />
//     </div>
//   );
// }

// function NotFound() {
//   return (
//     <div className="py-24 text-center">
//       <p className="text-6xl font-extrabold text-brand">404</p>
//       <p className="mt-2 text-zinc-500">We couldn't find that page.</p>
//       <Link to="/" className="btn-primary mt-6">Back to home</Link>
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <>
//       <Toaster position="top-center" toastOptions={{ className: "!bg-white !text-zinc-900 dark:!bg-zinc-800 dark:!text-zinc-100" }} />
//       <Routes>
//         <Route element={<Layout />}>
//           <Route path="/" element={<Home />} />
//           <Route path="/products" element={<Products />} />
//           <Route path="/products/:id" element={<ProductDetail />} />
//           <Route path="/cart" element={<Cart />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/verify" element={<Verify />} />
//           <Route path="/checkout" element={<Checkout />} />
//           <Route path="/checkout/result" element={<CheckoutResult />} />
//           <Route path="/orders" element={<Orders />} />
//           <Route path="/orders/:id" element={<OrderDetail />} />
//           <Route path="/wishlist" element={<Wishlist />} />
//           <Route path="/account" element={<Account />} />
//           <Route path="/seller" element={<RequireRole roles={["seller", "admin"]}><SellerDashboard /></RequireRole>} />
//           <Route path="/admin" element={<RequireRole roles={["admin"]}><AdminDashboard /></RequireRole>} />
//           <Route path="*" element={<NotFound />} />
//         </Route>
//       </Routes>
//     </>
//   );
// }



// import {
//   Routes,
//   Route,
// } from "react-router-dom";

// import Home from "./pages/Home";
// import ProductDetails from "./pages/ProductDetails";
// import CategoryPage from "./pages/CategoryPage";


// function AppRoutes() {

//   return (

//     <Routes>

//       <Route
//         path="/"
//         element={<Home />}
//       />

//       <Route
//         path="/product/:id"
//         element={<ProductDetails />}
//       />

//       <Route
//         path="/category/:category"
//         element={<CategoryPage />}
//       />

//     </Routes>
//   );
// }

// export default AppRoutes;