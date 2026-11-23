import { Link } from "react-router-dom";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";
import formatCurrency from "../../utils/formatCurrency";
import { PLACEHOLDER } from "../../utils/placeholder";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addWishlist } = useWishlist();

  const handleCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    addWishlist(product);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-xl hover:border-orange-500 dark:hover:border-orange-500 transition-all overflow-hidden flex flex-col justify-between group"
    >
      <div>
        <div className="h-52 bg-gray-100 dark:bg-zinc-800 overflow-hidden relative">
          <img
            src={product.images?.[0] || PLACEHOLDER}
            alt={product.name}
            onError={(e) => {
              if (e.currentTarget.src !== PLACEHOLDER) {
                e.currentTarget.src = PLACEHOLDER;
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>

        <div className="p-4">
          <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {product.name}
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1 line-clamp-2 min-h-[32px]">
            {product.description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <h3 className="text-orange-600 font-black text-base">
              {formatCurrency(product.price)}
            </h3>
            <span className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
              {product.color || "Standard"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex gap-2 mb-2">
          <button
            onClick={handleCart}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Add To Cart
          </button>
          <button
            onClick={handleWishlist}
            className="px-3 py-2 border border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            ♡
          </button>
        </div>
        <div className="text-[11px] font-bold text-amber-500">
          ⭐ {product.averageRating?.toFixed(1) || "0.0"} ({product.reviews?.length || 0})
        </div>
      </div>
    </Link>
  );
}