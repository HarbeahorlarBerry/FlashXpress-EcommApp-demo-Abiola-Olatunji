import { Link } from "react-router-dom";

export default function HeroBanner() {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between">
      <div className="max-w-xl">
        <span className="bg-white/20 text-white text-xs px-3.5 py-1.5 rounded-full uppercase font-bold tracking-wider backdrop-blur-sm">
          Global Marketplace · Super Deals
        </span>
        <h1 className="text-3xl md:text-5xl font-black mt-4 mb-3 leading-tight tracking-tight">
          Discover Amazing Products & Global Brands
        </h1>
        <p className="text-orange-100 text-sm md:text-base mb-6 leading-relaxed">
          Shop trending products with smart AI recommendations, lightning-fast secure checkout, and buyer protection.
        </p>
        <Link
          to="/category/Electronics"
          className="inline-block bg-white text-orange-600 px-8 py-3.5 rounded-2xl font-bold hover:bg-orange-50 transition shadow-md text-sm"
        >
          Shop Now →
        </Link>
      </div>
      <div className="hidden md:flex text-9xl bg-white/10 p-8 rounded-3xl backdrop-blur-md shadow-inner">
        🛍️
      </div>
    </div>
  );
}