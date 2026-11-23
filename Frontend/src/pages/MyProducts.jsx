import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProducts, deleteProduct } from "../api/productApi";
import formatCurrency from "../utils/formatCurrency";
import { Loading } from "../components/ui/kit";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const response = await getMyProducts();
        if (mounted) setProducts(response.data.products);
      } catch (error) {
        console.log(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight">My Products</h1>
            <p className="text-xs text-gray-500 mt-1">Manage your inventory catalog</p>
          </div>
          <Link to="/dashboard/create-product" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-sm">+ Add Product</Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-gray-500 shadow-sm">
            You haven't listed any products yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold mb-1 truncate">{product.name}</h3>
                  <p className="text-orange-600 font-black text-lg mb-4">{formatCurrency(product.price)}</p>
                </div>
                <div className="flex gap-2 border-t border-gray-100 dark:border-zinc-800 pt-4">
                  <Link to={`/product/${product._id}`} className="flex-1 text-center border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 font-bold py-2 rounded-xl text-xs transition">View</Link>
                  <button onClick={() => handleDelete(product._id)} className="flex-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 font-bold py-2 rounded-xl text-xs transition">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}