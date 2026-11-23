import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import useTheme from "../../hooks/useTheme";
import SearchBar from "../search/SearchBar";
import NotificationBell from "../ui/NotificationBell";
import RegisterModal from "../register/RegisterModel.jsx";
import CategoryMegaMenu from "./CategoryMegaMenu.jsx";
import RegionPopover from "./RegionPopover.jsx";

const SUB_NAV_LINKS = [
  { label: "Bundle deals", to: "/home?deals=bundle", highlight: true },
  { label: "Choice", to: "/home?deals=choice" },
  { label: "SuperDeals", to: "/home?deals=super" },
  { label: "FlashXpress+ Business", to: "/home?deals=business" },
  { label: "Automotive", to: "/category/automotive" },
  { label: "Appliances", to: "/category/appliances" },
];

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "system", label: "System", icon: "💻" },
];

export default function Navbar() {
  const {
    user,
    logout,
    registerModalOpen,
    openRegisterModal,
    closeRegisterModal,
  } = useAuth();
  const { cartCount } = useCart();
  const { theme, cycleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeThemeMeta =
    THEME_OPTIONS.find((item) => item.value === theme) || THEME_OPTIONS[2];

  const renderThemeButton = (extraClass = "") => (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label="Cycle theme (Light, Dark, System)"
      title={`Theme: ${activeThemeMeta.label} (click to switch)`}
      className={`inline-flex items-center gap-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 transition cursor-pointer ${extraClass}`}
    >
      <span>{activeThemeMeta.icon}</span>
      <span>{activeThemeMeta.label}</span>
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 md:px-6 py-3.5">
          {/* Brand with Flash Logo */}
          <Link
            to="/home"
            className="flex items-center gap-2 text-xl font-black tracking-tighter text-orange-600 dark:text-orange-500 shrink-0 group"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span>
              Flash<span className="text-zinc-900 dark:text-white">Xpress+</span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2.5 text-sm font-semibold shrink-0">
            <Link to="/home" className="hover:text-orange-600 transition px-1.5">
              Home
            </Link>

            <RegionPopover />

            {renderThemeButton()}

            <NotificationBell />

            <Link
              to="/cart"
              className="bg-gray-100 dark:bg-zinc-800 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5"
            >
              <span>🛒</span>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="rounded-full bg-orange-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {user?.username
                      ? user.username.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Welcome, {user.username || "User"}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  className="text-xs font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 px-3 py-2 rounded-xl hover:bg-orange-100 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="bg-gray-100 dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 px-3 py-2 rounded-xl transition text-xs font-bold border border-gray-200 dark:border-zinc-700 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openRegisterModal}
                  className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-2.5 rounded-xl transition text-xs font-bold cursor-pointer"
                >
                  Register
                </button>
                <Link
                  to="/login"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl transition text-xs font-bold shadow-sm"
                >
                  Sign In
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <RegionPopover compact />
            {renderThemeButton("px-2.5")}
            <Link
              to="/cart"
              className="bg-gray-100 dark:bg-zinc-800 px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <span>🛒</span>
              {cartCount > 0 && (
                <span className="rounded-full bg-orange-600 px-1.5 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-900 dark:text-white bg-gray-100 dark:bg-zinc-800 rounded-xl"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Sub-Bar Directly Under FlashXpress+ Header: All Categories + Quick Links */}
        <div className="hidden md:block border-t border-gray-100 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80">
          <div className="max-w-7xl mx-auto flex items-center gap-6 px-4 md:px-6 py-2 overflow-x-auto">
            <div className="shrink-0">
              <CategoryMegaMenu />
            </div>

            <div className="flex items-center gap-6 text-xs sm:text-sm font-semibold whitespace-nowrap">
              {SUB_NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`transition hover:text-orange-600 dark:hover:text-orange-400 ${
                    item.highlight
                      ? "text-rose-600 dark:text-rose-400 font-bold"
                      : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 pt-3 border-t border-gray-200 dark:border-zinc-800 space-y-3">
            <div>
              <SearchBar />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CategoryMegaMenu />
              {renderThemeButton()}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 py-1 border-y border-gray-100 dark:border-zinc-800 text-xs font-semibold">
              {SUB_NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-1 hover:text-orange-600 ${
                    item.highlight
                      ? "text-rose-600 dark:text-rose-400 font-bold"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col space-y-2 text-sm font-semibold">
              <Link
                to="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-orange-600"
              >
                Home
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-orange-600"
              >
                Cart ({cartCount})
              </Link>

              {user ? (
                <>
                  <div className="py-1.5 text-xs font-bold text-orange-600">
                    Welcome, {user.username || "User"}
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 hover:text-orange-600"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-1.5 text-rose-600 font-bold"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openRegisterModal();
                    }}
                    className="bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-center py-2.5 rounded-xl font-bold"
                  >
                    Register
                  </button>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-orange-600 text-white text-center py-2.5 rounded-xl font-bold"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={closeRegisterModal}
      />
    </>
  );
}