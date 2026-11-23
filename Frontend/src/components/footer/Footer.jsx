import { Link } from "react-router-dom";

const FOOTER_COLUMNS = [
  {
    title: "Customer service",
    links: [
      { label: "Help Center", to: "/home" },
      { label: "Buyer Protection", to: "/orders" },
      { label: "Shipping & Delivery", to: "/orders" },
      { label: "Returns & Refunds", to: "/orders" },
      { label: "Terms & Conditions", to: "/home" },
    ],
  },
  {
    title: "Shopping with us",
    links: [
      { label: "Making payments", to: "/checkout" },
      { label: "Wallet & Balance", to: "/wallet" },
      { label: "Shopping Cart", to: "/cart" },
      { label: "Bundle & SuperDeals", to: "/home?deals=bundle" },
      { label: "FlashXpress+ Business", to: "/home?deals=business" },
    ],
  },
  {
    title: "Collaborate with us",
    links: [
      { label: "Seller Dashboard", to: "/seller" },
      { label: "Create Product", to: "/dashboard/create-product" },
      { label: "My Products", to: "/dashboard/my-products" },
      { label: "Analytics & Insights", to: "/analytics" },
      { label: "Operations", to: "/operations" },
    ],
  },
];

const PAYMENT_BADGES = ["VISA", "Mastercard", "Verve", "Paystack", "Flutterwave", "Stripe"];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 space-y-10">
        {/* Top 5-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-left">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="space-y-3">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="hover:text-orange-600 dark:hover:text-orange-400 transition"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Pay with */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              Pay with
            </h3>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Stay connected */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              Stay connected
            </h3>
            <div className="flex items-center gap-2.5">
              {[
                { name: "Facebook", mark: "f" },
                { name: "X", mark: "𝕏" },
                { name: "Instagram", mark: "◎" },
                { name: "YouTube", mark: "▶" },
                { name: "Chat", mark: "💬" },
              ].map((soc) => (
                <Link
                  key={soc.name}
                  to="/chat"
                  aria-label={soc.name}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-black text-zinc-800 dark:text-zinc-200 hover:bg-orange-600 hover:text-white transition"
                >
                  {soc.mark}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Middle directory strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 dark:border-zinc-800 pt-6 text-left">
          <div className="space-y-1.5">
            <h4 className="text-xs font-black text-zinc-900 dark:text-white">
              Help &amp; Support
            </h4>
            <p className="leading-relaxed text-[11px]">
              <Link to="/home" className="hover:text-orange-600">Help Center</Link> •{" "}
              <Link to="/orders" className="hover:text-orange-600">Disputes &amp; Reports</Link> •{" "}
              <Link to="/fraud" className="hover:text-orange-600">Security &amp; Fraud Monitor</Link> •{" "}
              <Link to="/insights" className="hover:text-orange-600">Market Insights</Link>
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-black text-zinc-900 dark:text-white">
              Browse by Category
            </h4>
            <p className="leading-relaxed text-[11px]">
              <Link to="/category/automotive" className="hover:text-orange-600">Automotive</Link> •{" "}
              <Link to="/category/appliances" className="hover:text-orange-600">Appliances</Link> •{" "}
              <Link to="/category/womens-clothing" className="hover:text-orange-600">Women&apos;s Clothing</Link> •{" "}
              <Link to="/category/mens-clothing" className="hover:text-orange-600">Men&apos;s Clothing</Link> •{" "}
              <Link to="/category/electronics" className="hover:text-orange-600">Electronics</Link> •{" "}
              <Link to="/category/home-living" className="hover:text-orange-600">Home &amp; Living</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="bg-zinc-950 text-zinc-400 py-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 font-black text-sm tracking-tight text-orange-500">
            <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-sm">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span>
              Flash<span className="text-white">Xpress+</span>
            </span>
          </div>

          <p className="text-[11px]">
            © 2026 FlashXpress+ Global Marketplace. All rights reserved. • Privacy Policy • Terms of Use • IP Protection
          </p>
        </div>
      </div>
    </footer>
  );
}