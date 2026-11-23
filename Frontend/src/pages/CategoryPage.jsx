import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductGrid from "../components/product/ProductGrid";
import { getProducts } from "../api/productApi";
import { ErrorBox, Pager } from "../components/ui/kit.jsx";

const normalize = (val = "") =>
  String(val)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function CategoryPage() {
  const { category } = useParams();
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page")) || 1;
  const sub = params.get("sub") || "";
  const brand = params.get("brand") || "";

  const [data, setData] = useState({ products: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const query = { category, page, limit: 12 };
        if (sub) query.sub = sub;
        if (brand) query.brand = brand;

        const res = await getProducts(query);
        if (!cancelled) {
          setData(res.data || { products: [], total: 0, pages: 1 });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Could not load this category");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [category, page, sub, brand]);

  const visibleProducts = useMemo(() => {
    const list = Array.isArray(data.products) ? data.products : [];
    const targetSub = normalize(sub);
    const targetBrand = normalize(brand);

    if (!targetSub && !targetBrand) return list;

    return list.filter((item) => {
      const itemSub = normalize(item.subCategory || item.subcategory || item.sub || "");
      const itemBrand = normalize(item.brand || "");
      if (targetSub && itemSub && itemSub !== targetSub) return false;
      if (targetBrand && itemBrand && itemBrand !== targetBrand) return false;
      return true;
    });
  }, [data.products, sub, brand]);

  const clearFilter = (key) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    next.delete("page");
    setParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    setParams(next);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-black capitalize tracking-tight">
            {category?.replace(/-/g, " ")}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {loading
              ? "Loading category items..."
              : `${visibleProducts.length} product${visibleProducts.length === 1 ? "" : "s"} shown`}
          </p>

          {(sub || brand) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {sub && (
                <button
                  type="button"
                  onClick={() => clearFilter("sub")}
                  className="rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-500/40 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 cursor-pointer"
                >
                  Subcategory: {sub} ✕
                </button>
              )}
              {brand && (
                <button
                  type="button"
                  onClick={() => clearFilter("brand")}
                  className="rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-500/40 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 cursor-pointer"
                >
                  Brand: {brand} ✕
                </button>
              )}
            </div>
          )}
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        {!loading && !error && visibleProducts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-14 text-center text-gray-500 shadow-sm">
            Nothing in this category yet.
          </div>
        ) : (
          <ProductGrid products={visibleProducts} />
        )}

        <Pager page={page} pages={data.pages} onChange={setPage} />
      </div>
    </div>
  );
}