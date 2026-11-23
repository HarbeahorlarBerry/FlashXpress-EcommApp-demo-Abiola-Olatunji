import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSingleProduct } from "../api/productApi";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";
import RatingSummary from "../components/product/RatingSummary";
import ReviewForm from "../components/product/ReviewForm";
import SimilarProducts from "../components/product/SimilarProducts";
import RecommendedProducts from "../components/product/RecommendedProducts";
import { Loading } from "../components/ui/kit";
import { eventBus } from "../core/eventBus";
import formatCurrency from "../utils/formatCurrency";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { addWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getSingleProduct(id);
        const fetched = response.data.product;
        setProduct(fetched);
        setSelectedImage(fetched.images?.[0] || "");
        eventBus.emit("product_viewed", fetched);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <Loading />;
  if (!product) return <div className="text-center py-20 font-bold">Product not found</div>;

  return (
    <div className="space-y-8 md:space-y-12 max-w-7xl mx-auto px-4 md:px-6 py-6">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 grid md:grid-cols-2 gap-8 md:gap-10 shadow-sm">
        <div className="space-y-4">
          <div className="h-[300px] md:h-[420px] bg-gray-100 dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-inner">
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images?.map((img, i) => (
              <img 
                key={i} 
                src={img} 
                onClick={() => setSelectedImage(img)} 
                className={`w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover cursor-pointer border-2 transition shrink-0 ${selectedImage === img ? "border-orange-500 scale-105" : "border-transparent opacity-70"}`} 
                alt=""
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <span className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider">
            {product.category}
          </span>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">{product.name}</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
          <div className="text-2xl md:text-3xl font-black text-orange-600">{formatCurrency(product.price)}</div>

          <div className="flex items-center gap-4 py-2 border-y border-gray-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-gray-500 uppercase">Quantity</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                -
              </button>
              <span className="font-bold text-base w-6 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={() => addToCart({ ...product, quantity })} 
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl text-sm transition shadow-lg cursor-pointer"
            >
              Add To Cart
            </button>
            <button 
              onClick={() => addWishlist(product)} 
              className="px-6 border border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 font-bold py-4 rounded-2xl text-sm transition cursor-pointer text-center"
            >
              ♡ Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <RatingSummary reviews={product.reviews || []} />
        <ReviewForm productId={product._id} onReviewAdded={() => window.location.reload()} />
      </div>

      <SimilarProducts currentProduct={product} />
      <RecommendedProducts />
    </div>
  );
}