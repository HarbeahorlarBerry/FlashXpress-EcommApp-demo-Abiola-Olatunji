import formatCurrency from "../../utils/formatCurrency";

export default function FeaturedProducts() {
  const products = [
    { id: 1, name: "iPhone Pro Max", price: 800000, image: "📱" },
    { id: 2, name: "Nike Air Running Shoe", price: 50000, image: "👟" },
    { id: 3, name: "Ultra Gaming Laptop M4", price: 650000, image: "💻" },
  ];

  return (
    <section className="py-12">
      <h2 className="text-2xl font-black mb-6 tracking-tight">Featured Products</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-3xl shrink-0">
              {product.image}
            </div>
            <div>
              <h3 className="font-bold text-sm">{product.name}</h3>
              <p className="text-orange-600 font-black text-base mt-1">{formatCurrency(product.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}