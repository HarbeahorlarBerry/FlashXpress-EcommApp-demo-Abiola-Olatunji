import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts, searchProducts } from "../api/productApi";
import Hero from "../components/ui/Hero";
import HeroBanner from "../components/home/HeroBanner";
import CategorySection from "../components/home/CategorySection";
import SectionHeader from "../components/home/SectionHeader";
import { Loading } from "../components/ui/kit";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";
import formatCurrency from "../utils/formatCurrency";
import { PLACEHOLDER } from "../utils/placeholder";

const FALLBACK_ITEMS = [
  {
    _id: "demo-1",
    name: "Silicone Face Lifting & Sculpting Tool",
    category: "Beauty & Health",
    price: 3310.89,
    comparePrice: 5490,
    rating: 4.5,
    soldCount: "4.3K+",
    badge: "Bundle deal",
    promo: "3+ from US $2.99",
    images: [],
  },
  {
    _id: "demo-2",
    name: "Portable 100-150 Inch Projector Screen",
    category: "Electronics",
    price: 9330.69,
    comparePrice: 14200,
    rating: 4.3,
    soldCount: "337",
    badge: "Bundle deal",
    promo: "Save on 3+ items",
    images: [],
  },
  {
    _id: "demo-3",
    name: "Creative Automotive Interior Organizer Set",
    category: "Automotive",
    price: 4578.22,
    comparePrice: 8900,
    rating: 4.9,
    soldCount: "50,000+",
    badge: "Choice",
    promo: "Free shipping",
    images: [],
  },
  {
    _id: "demo-4",
    name: "Smart Weather Clock & Digital Photo Frame",
    category: "Home & Living",
    price: 2738.9,
    comparePrice: 4600,
    rating: 4.8,
    soldCount: "12,000+",
    badge: "SuperDeals",
    promo: "Up to 60% off",
    images: [],
  },
  {
    _id: "demo-5",
    name: "Wireless Clip-On Open Ear Headphones",
    category: "Electronics",
    price: 4919,
    comparePrice: 9800,
    rating: 4.7,
    soldCount: "8,400+",
    badge: "SuperDeals",
    promo: "50% off flash deal",
    images: [],
  },
  {
    _id: "demo-6",
    name: "Waterproof Sculpting & Contour Stick Set",
    category: "Beauty & Health",
    price: 1600,
    comparePrice: 3200,
    rating: 4.6,
    soldCount: "21,000+",
    badge: "SuperDeals",
    promo: "New shopper deal",
    images: [],
  },
  {
    _id: "demo-7",
    name: "Indoor Planter & Home Decor Pack",
    category: "Home & Living",
    price: 2043.56,
    comparePrice: 3500,
    rating: 4.8,
    soldCount: "6,200+",
    badge: "Bulk Saver",
    promo: "Wholesale pack",
    images: [],
  },
  {
    _id: "demo-8",
    name: "Botanical Hair & Scalp Care Essence",
    category: "Beauty & Health",
    price: 1583.38,
    comparePrice: 2800,
    rating: 4.7,
    soldCount: "9,100+",
    badge: "Bulk Saver",
    promo: "Buy 2 save more",
    images: [],
  },
  {
    _id: "demo-9",
    name: "Bass Boost Wireless Earbuds",
    category: "Cell Phones & Accessories",
    price: 1600,
    comparePrice: 3400,
    rating: 4.6,
    soldCount: "15,000+",
    badge: "Choice",
    promo: "Fast dispatch",
    images: [],
  },
  {
    _id: "demo-10",
    name: "Non-Slip Home Slide Sandals",
    category: "Shoes",
    price: 1519.29,
    comparePrice: 2600,
    rating: 4.8,
    soldCount: "18,500+",
    badge: "Buy again",
    promo: "Popular pick",
    images: [],
  },
  {
    _id: "demo-11",
    name: "Textured Living Room Area Rug",
    category: "Furniture",
    price: 1519.29,
    comparePrice: 3100,
    rating: 4.5,
    soldCount: "4,900+",
    badge: "Buy again",
    promo: "Popular pick",
    images: [],
  },
  {
    _id: "demo-12",
    name: "20,000mAh Ultra-Slim Fast Power Bank",
    category: "Cell Phones & Accessories",
    price: 4285,
    comparePrice: 7500,
    rating: 4.9,
    soldCount: "30,000+",
    badge: "Buy again",
    promo: "Top seller",
    images: [],
  },
];

const QUICK_TAGS = [
  "ahegao hoodie",
  "chromebook charger",
  "ps2 controller",
  "purge mask",
  "renaissance dress",
  "diamond tester",
  "gatsby dress",
  "hoverboard charger",
  "inflatable tent",
  "jade bracelet",
  "kuromi plush",
  "studded belt",
  "nvidia geforce gtx 750ti",
];

function extractProductList(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.products)) return response.products;

  const d = response.data;
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.products)) return d.products;
  if (Array.isArray(d.data?.products)) return d.data.products;
  if (Array.isArray(d.data)) return d.data;
  return [];
}

function handleSafeImageError(e) {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = "true";
  if (PLACEHOLDER && img.src !== PLACEHOLDER) {
    img.src = PLACEHOLDER;
  } else {
    img.style.display = "none";
  }
}

function getItemPricing(product, idx) {
  const basePrice = Number(product?.price) || 1999;
  const comparePrice =
    Number(product?.comparePrice) || Math.round(basePrice * 1.65);
  const discountPct =
    comparePrice > basePrice
      ? Math.min(
          85,
          Math.max(10, Math.round(((comparePrice - basePrice) / comparePrice) * 100))
        )
      : ((idx * 13) % 45) + 15;
  const rating =
    Number(product?.averageRating || product?.rating) ||
    Number((4.5 + (idx % 5) * 0.1).toFixed(1));
  const soldLabel =
    product?.soldCount || `${((idx % 9) + 1) * 3},000+ sold`;

  return {
    price: basePrice,
    comparePrice,
    discountPct,
    rating: rating.toFixed(1),
    soldLabel,
  };
}

function DealStripCard({ item, index, onAddCart }) {
  const { price, rating, soldLabel, discountPct } = getItemPricing(item, index);
  const src = item.images?.[0] || PLACEHOLDER;
  const isDemo = String(item._id || "").startsWith("demo-");

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/70 p-2.5 hover:border-orange-500/60">
      <Link to={isDemo ? "/home" : `/product/${item._id}`}>
        <div className="relative mb-2 h-28 sm:h-32 w-full overflow-hidden rounded-lg bg-zinc-800">
          {src && (
            <img
              src={src}
              alt={item.name}
              loading="lazy"
              onError={handleSafeImageError}
              className="h-full w-full object-cover"
            />
          )}
          <span className="absolute left-1.5 top-1.5 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-black text-white">
            -{discountPct}%
          </span>
        </div>
        <p className="line-clamp-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-orange-600">
          {item.name}
        </p>
      </Link>

      <div className="mt-2">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs sm:text-sm font-black text-zinc-950 dark:text-white">
            {formatCurrency(price)}
          </span>
          <button
            type="button"
            onClick={() => onAddCart(item)}
            title="Add to cart"
            className="rounded-lg bg-orange-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-orange-700 cursor-pointer"
          >
            + Cart
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500 dark:text-zinc-400">
          <span className="font-bold text-amber-500">★ {rating}</span>
          <span>{soldLabel}</span>
        </div>
      </div>
    </div>
  );
}

function MoreToLoveCard({ item, index, onAddCart, onAddWishlist }) {
  const { price, comparePrice, discountPct, rating, soldLabel } = getItemPricing(
    item,
    index
  );
  const src = item.images?.[0] || PLACEHOLDER;

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 hover:border-orange-500">
      <div>
        <Link to={`/product/${item._id}`} className="block">
          <div className="relative mb-2.5 h-40 sm:h-44 w-full overflow-hidden rounded-xl bg-zinc-800">
            {src && (
              <img
                src={src}
                alt={item.name}
                loading="lazy"
                onError={handleSafeImageError}
                className="h-full w-full object-cover"
              />
            )}
            <span className="absolute bottom-2 left-2 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
              {item.badge || "Choice"}
            </span>
          </div>

          <h3 className="line-clamp-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-orange-600 min-h-[32px]">
            {item.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-black text-zinc-950 dark:text-white">
            {formatCurrency(price)}
          </span>
          <span className="text-[11px] text-gray-400 line-through">
            {formatCurrency(comparePrice)}
          </span>
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
            -{discountPct}%
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-zinc-400">
          <span className="font-bold text-amber-500">★ {rating}</span>
          <span>•</span>
          <span>{soldLabel}</span>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1">
          <span className="rounded bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
            Welcome deal
          </span>
          <span className="rounded bg-orange-50 dark:bg-orange-950/50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700 dark:text-orange-300">
            {item.promo || "Fast delivery"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => onAddCart(item)}
          className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 py-1.5 text-[11px] font-bold text-white cursor-pointer"
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={() => onAddWishlist(item)}
          aria-label={`Save ${item.name}`}
          className="rounded-xl border border-gray-200 dark:border-zinc-700 px-2.5 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-orange-500 hover:text-orange-600 cursor-pointer"
        >
          ♡
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showAllMore, setShowAllMore] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeDealFilter = (searchParams.get("deals") || "").toLowerCase();
  const queryText = (searchParams.get("q") || "").trim();

  const cartState = useCart() || {};
  const addToCart = cartState.addToCart || (() => {});

  const wishlistState = useWishlist() || {};
  const addWishlist =
    wishlistState.addWishlist || wishlistState.addToWishlist || (() => {});

  const fetchProducts = useCallback(async () => {
    setFetchError("");
    try {
      const response = queryText
        ? await searchProducts(queryText)
        : await getProducts(1);
      const list = extractProductList(response);
      setProducts(list);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setFetchError(
        error?.response?.data?.message ||
          error?.message ||
          "Could not reach product catalog"
      );
    } finally {
      setInitialLoading(false);
    }
  }, [queryText]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) fetchProducts();
    }, 100);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [fetchProducts]);

  const baseDealsCatalog = useMemo(() => {
    if (products.length >= 12) return products;
    const needed = 12 - products.length;
    return [...products, ...FALLBACK_ITEMS.slice(0, needed)];
  }, [products]);

  const bundleDeals = baseDealsCatalog.slice(0, 3);
  const superDeals = baseDealsCatalog.slice(3, 6);
  const bulkSaverItems = baseDealsCatalog.slice(6, 9);
  const buyAgainItems = baseDealsCatalog.slice(9, 12);

  const moreToLoveList = useMemo(() => {
    const qLower = queryText.toLowerCase();

    return products.filter((item) => {
      const label =
        `${item.name || ""} ${item.badge || ""} ${item.category || ""}`.toLowerCase();

      if (qLower && !label.includes(qLower)) {
        return false;
      }

      if (!activeDealFilter) return true;
      if (activeDealFilter === "bundle") {
        return (
          label.includes("bundle") ||
          label.includes("set") ||
          label.includes("pack")
        );
      }
      if (activeDealFilter === "choice") {
        return (
          label.includes("choice") ||
          label.includes("wireless") ||
          label.includes("smart")
        );
      }
      if (activeDealFilter === "super") {
        return (
          label.includes("super") ||
          label.includes("deal") ||
          label.includes("power")
        );
      }
      if (activeDealFilter === "business") {
        return (
          label.includes("bulk") ||
          label.includes("wholesale") ||
          label.includes("pack")
        );
      }
      return true;
    });
  }, [products, activeDealFilter, queryText]);

  const visibleMoreItems = showAllMore
    ? moreToLoveList
    : moreToLoveList.slice(0, 18);

  const handleSelectTag = (tag) => {
    const next = new URLSearchParams(searchParams);
    next.set("q", tag);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearQuery = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    setSearchParams(next);
  };

  if (initialLoading && products.length === 0) return <Loading />;

  return (
    <div className="space-y-12">
      <Hero />
      <HeroBanner />

      <section>
        <SectionHeader
          title="Shop Categories"
          subtitle="Browse global products by category"
        />
        <CategorySection />
      </section>

      {/* TODAY'S DEALS: BUNDLE DEALS & SUPERDEALS */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Today&apos;s deals
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Automatically curated from live marketplace listings
            </p>
          </div>
          {activeDealFilter && (
            <Link
              to="/home"
              className="rounded-full bg-orange-50 dark:bg-orange-950/60 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
            >
              Showing: {activeDealFilter} (Reset)
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bundle deals card */}
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-sm">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                  Bundle deals
                </h3>
                <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  3+ save more
                </span>
              </div>
              <Link
                to="/home?deals=bundle"
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                Shop now →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {bundleDeals.map((item, idx) => (
                <DealStripCard
                  key={`bundle-${item._id || "d"}-${idx}`}
                  item={item}
                  index={idx}
                  onAddCart={addToCart}
                />
              ))}
            </div>
          </div>

          {/* SuperDeals card */}
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-sm">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                  SuperDeals
                </h3>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                  Up to 60% off
                </span>
              </div>
              <Link
                to="/home?deals=super"
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                Shop now →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {superDeals.map((item, idx) => (
                <DealStripCard
                  key={`super-${item._id || "d"}-${idx}`}
                  item={item}
                  index={idx + 3}
                  onAddCart={addToCart}
                />
              ))}
            </div>
          </div>
        </div>

        {/* FLASHXPRESS+ BUSINESS BANNER + BULK SAVER HUB & BUY AGAIN */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 text-white p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight">
                  Flash<span className="text-orange-500">Xpress+</span> Business
                </span>
              </div>
              <p className="text-xs text-zinc-300 flex flex-wrap gap-x-3 gap-y-1">
                <span>✓ Volume pricing</span>
                <span>✓ Express payments</span>
                <span>✓ Dedicated sourcing support</span>
              </p>
              <div className="pt-1">
                <Link
                  to="/home?deals=business"
                  className="inline-block rounded-full bg-white text-zinc-950 px-4 py-1.5 text-xs font-bold hover:bg-orange-500 hover:text-white"
                >
                  Shop now
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="rounded-xl bg-zinc-800/80 px-3.5 py-2.5">
                <div className="text-base font-black text-orange-400">5M+</div>
                <div className="text-[11px] text-zinc-300">
                  Factory direct items
                </div>
              </div>
              <div className="rounded-xl bg-zinc-800/80 px-3.5 py-2.5">
                <div className="text-base font-black text-orange-400">20M+</div>
                <div className="text-[11px] text-zinc-300">Global buyers</div>
              </div>
              <div className="rounded-xl bg-zinc-800/80 px-3.5 py-2.5">
                <div className="text-base font-black text-orange-400">10</div>
                <div className="text-[11px] text-zinc-300">Regional hubs</div>
              </div>
              <div className="rounded-xl bg-zinc-800/80 px-3.5 py-2.5">
                <div className="text-base font-black text-orange-400">24H</div>
                <div className="text-[11px] text-zinc-300">Fast dispatch</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-black">Bulk Saver Hub</h4>
                <Link
                  to="/home?deals=business"
                  className="text-[11px] font-bold text-orange-600 hover:underline"
                >
                  See all →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {bulkSaverItems.map((item, idx) => (
                  <DealStripCard
                    key={`bulk-${item._id || "d"}-${idx}`}
                    item={item}
                    index={idx + 6}
                    onAddCart={addToCart}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-black">Buy again</h4>
                <Link
                  to="/orders"
                  className="text-[11px] font-bold text-orange-600 hover:underline"
                >
                  Order history →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {buyAgainItems.map((item, idx) => (
                  <DealStripCard
                    key={`again-${item._id || "d"}-${idx}`}
                    item={item}
                    index={idx + 9}
                    onAddCart={addToCart}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MORE TO LOVE GRID + VIEW MORE + ABOUT STRIP */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHeader
            title="More to love"
            subtitle={
              queryText
                ? `Showing results for "${queryText}"`
                : "Trending marketplace products updated automatically from your catalog"
            }
          />
          {queryText && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="rounded-full bg-orange-50 dark:bg-orange-950/60 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
            >
              Search: &ldquo;{queryText}&rdquo; (Clear)
            </button>
          )}
        </div>

        {visibleMoreItems.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center space-y-3">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {fetchError
                ? `Catalog load issue: ${fetchError}`
                : "No live catalog products matched your filter."}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {fetchError
                ? "Check that your backend server on :9000 is running and CORS allows cookies/requests."
                : "Create an active product in MongoDB or clear your search/deal filter."}
            </p>
            <button
              type="button"
              onClick={fetchProducts}
              className="rounded-full bg-orange-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-700 cursor-pointer"
            >
              Retry Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {visibleMoreItems.map((item, idx) => (
              <MoreToLoveCard
                key={item._id || `mtl-${idx}`}
                item={item}
                index={idx}
                onAddCart={addToCart}
                onAddWishlist={addWishlist}
              />
            ))}
          </div>
        )}

        {moreToLoveList.length > 18 && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowAllMore((prev) => !prev)}
              className="rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-8 py-2.5 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white shadow-sm hover:border-orange-500 hover:text-orange-600 cursor-pointer"
            >
              {showAllMore ? "Show less" : "View more"}
            </button>
          </div>
        )}

        {/* WHAT IS FLASHXPRESS+ INFO STRIP */}
        <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">
              FlashXpress+: Your Best Choice for Online Shopping
            </h3>
            <button
              type="button"
              onClick={() => setAboutExpanded((prev) => !prev)}
              className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
            >
              {aboutExpanded ? "Hide details ▲" : "What is FlashXpress+? ▼"}
            </button>
          </div>

          {aboutExpanded && (
            <>
              <p className="text-xs leading-relaxed text-gray-600 dark:text-zinc-400">
                FlashXpress+ connects shoppers and bulk buyers directly with
                global sellers across electronics, fashion, home living,
                automotive, appliances, and everyday essentials—featuring bundle
                discounts, flash deals, and fast checkout.
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500 dark:text-zinc-400 pt-1">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  Popular searches:
                </span>
                {QUICK_TAGS.map((tag, i) => (
                  <span key={tag} className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTag(tag)}
                      className="hover:text-orange-600 hover:underline cursor-pointer"
                    >
                      {tag}
                    </button>
                    {i < QUICK_TAGS.length - 1 && <span>|</span>}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}