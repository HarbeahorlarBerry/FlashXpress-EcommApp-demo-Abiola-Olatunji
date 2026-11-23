import useCart from "../hooks/useCart";
import CartItem from "../components/cart/CartItem";
import { Link } from "react-router-dom";
import formatCurrency from "../utils/formatCurrency";

export default function Cart() {
  const { cart } = useCart();
  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black tracking-tight">Shopping Cart ({cart.length})</h1>

        {cart.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
            <p className="text-gray-500 mb-4">Your cart is currently empty.</p>
            <Link to="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition">Start Shopping →</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-4">
              {cart.map((item) => <CartItem key={item._id} item={item} />)}
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold border-b border-gray-100 dark:border-zinc-800 pb-3">Order Summary</h2>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-emerald-600 font-semibold">Calculated at checkout</span>
              </div>
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 flex justify-between text-base font-black">
                <span>Total</span>
                <span className="text-orange-600">{formatCurrency(total)}</span>
              </div>
              <Link to="/checkout" className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl text-center text-sm transition shadow-sm">
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}