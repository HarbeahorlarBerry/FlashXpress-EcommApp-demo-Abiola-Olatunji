const FILTER_CATEGORIES = [
  "All Categories",
  "Automotive",
  "Appliances",
  "Women's Clothing",
  "Men's Clothing",
  "Toys & Games",
  "Beauty & Health",
  "Home & Living",
  "Cell Phones & Accessories",
  "Jewelry & Accessories",
  "Electronics",
  "Shoes",
  "Tools & Home Improvement",
  "Furniture",
  "Sports & Outdoors",
  "Pet Supplies",
  "Hair Extensions & Wigs",
  "Office & School Supplies",
  "Food & Grocery",
  "Bags & Luggage",
  "Baby & Maternity",
  "Novelty & Special Use",
  "Motorcycles & Powersports",
  "Business, Industry & Science",
  "Arts, Crafts & Sewing",
  "Books & Media",
];

export default function ProductFilter({
  search,
  setSearch,
  category = "All Categories",
  setCategory,
}) {
  return (
    <div className="w-full min-w-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 min-w-0 bg-gray-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition"
      />

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        <select
          value={category}
          onChange={(e) => setCategory && setCategory(e.target.value)}
          className="flex-1 md:flex-none max-w-[220px] min-w-0 bg-gray-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition cursor-pointer"
        >
          {FILTER_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}