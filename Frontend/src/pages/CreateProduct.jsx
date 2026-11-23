import { useState } from "react";
import { createProduct } from "../api/productApi";
import { eventBus } from "../core/eventBus";

function CreateProduct() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    color: "",
    size: "",
    category: "",
    stock: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setSuccessMessage("");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("color", form.color);
      formData.append("size", form.size);
      formData.append("category", form.category);
      formData.append("stock", form.stock);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await createProduct(formData);

      eventBus.emit("product_created", response.data.product);

      setSuccessMessage("Product created successfully!");

      setForm({
        name: "",
        description: "",
        price: "",
        color: "",
        size: "",
        category: "",
        stock: "",
      });
      setImages([]);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-zinc-950 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden transition-all">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white">
          <h1 className="text-3xl font-black tracking-tight m-0">Create Product</h1>
          <p className="text-orange-100 text-sm mt-1 opacity-90">
            Add a new product to your global marketplace catalog
          </p>
        </div>

        {/* BODY FORM */}
        <div className="p-8">
          {successMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-2xl mb-6 text-sm font-medium">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAME */}
            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. MacBook Pro M4"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-3.5 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-500 transition"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Enter detailed product specifications..."
                value={form.description}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-3.5 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-500 transition h-32 resize-none"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-3.5 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-500 transition"
              >
                <option value="">Select Category</option>
                <option value="Fashion">Fashion</option>
                <option value="Electronics">Electronics</option>
                <option value="Gaming">Gaming</option>
                <option value="Phones">Phones</option>
                <option value="Beauty">Beauty</option>
                <option value="Shoes">Shoes</option>
              </select>
            </div>

            {/* PRICE + STOCK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="500000"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-3.5 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                  Stock Qty
                </label>
                <input
                  type="number"
                  name="stock"
                  placeholder="50"
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-3.5 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-500 transition"
                />
              </div>
            </div>

            {/* COLOR + SIZE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  placeholder="Black"
                  value={form.color}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-3.5 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                  Size
                </label>
                <input
                  type="text"
                  name="size"
                  placeholder="XL"
                  value={form.size}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-3.5 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:border-orange-500 dark:focus:border-orange-500 transition"
                />
              </div>
            </div>

            {/* IMAGE FILE */}
            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                Product Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-3 text-sm text-gray-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 transition cursor-pointer"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-70 text-sm tracking-wide mt-4 cursor-pointer"
            >
              {loading ? "Publishing Product..." : "Create Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProduct;