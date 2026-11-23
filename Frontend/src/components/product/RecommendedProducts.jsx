import { useEffect, useState } from "react";
import { getRecommendations } from "../../api/aiApi";
import ProductCard from "./ProductCard";

export default function RecommendedProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getRecommendations();
        setProducts(response.data.products || []);
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, []);

  if (!products.length) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-black mb-6 tracking-tight">AI Recommended For You</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}