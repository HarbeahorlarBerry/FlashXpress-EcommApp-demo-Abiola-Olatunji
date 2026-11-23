import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      {/* Dashboard Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xl font-black tracking-tighter text-orange-600 dark:text-orange-500">
            <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span>Flash<span className="text-zinc-900 dark:text-white">Xpress</span></span>
          </div>
          <span className="text-xs bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Merchant Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center font-bold shadow-sm">
              {user?.username ? user.username.charAt(0).toUpperCase() : "M"}
            </div>
            <span className="hidden sm:inline">{user?.username || "Merchant"}</span>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gray-100 dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer border border-gray-200 dark:border-zinc-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10">
        <div className="bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 rounded-3xl p-8 md:p-10 text-white shadow-xl mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight m-0">
              Welcome back, {user?.username || "Merchant"}! 👋
            </h1>
            <p className="text-orange-100 text-sm mt-2 max-w-xl">
              Manage your global store catalog, monitor stock metrics, and list new products in seconds.
            </p>
          </div>
          <Link
            to="/dashboard/create-product"
            className="bg-white text-orange-600 font-bold px-6 py-3 rounded-2xl shadow-md hover:bg-orange-50 transition text-sm tracking-wide shrink-0"
          >
            + Create New Product
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/dashboard/create-product"
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm hover:shadow-lg hover:border-orange-500 dark:hover:border-orange-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                📦
              </div>
              <h2 className="text-xl font-bold mb-2">Create Product</h2>
              <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed">
                Add new items with images, categorization, pricing, variants, and inventory stock control.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-orange-600 dark:text-orange-500 font-bold text-sm">
              <span>Get started</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link
            to="/dashboard/my-products"
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm hover:shadow-lg hover:border-orange-500 dark:hover:border-orange-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🏷️
              </div>
              <h2 className="text-xl font-bold mb-2">My Products</h2>
              <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed">
                View your active inventory catalog, edit product details, track sales performance, and manage stock.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-orange-600 dark:text-orange-500 font-bold text-sm">
              <span>Manage catalog</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-zinc-800 text-center py-6 text-xs text-gray-400 dark:text-zinc-500">
        © 2026 FlashXpress System. All rights reserved.
      </footer>
    </div>
  );
}