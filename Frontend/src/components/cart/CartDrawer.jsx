import { Link } from "react-router-dom";
import useCart from "../../hooks/useCart";
import CartItem from "./CartItem";
import formatCurrency from "../../utils/formatCurrency";

export default function CartDrawer({ isOpen, onClose }) {
  const { cart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
          <h2 className="text-lg font-black">Shopping Cart ({cart.length})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-zinc-900 dark:hover:text-white font-bold text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-12">Your cart is empty.</p>
          ) : (
            cart.map((item) => <CartItem key={item._id} item={item} />)
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-4">
            <div className="flex justify-between font-black text-base">
              <span>Subtotal:</span>
              <span className="text-orange-600">{formatCurrency(total)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center font-bold py-3.5 rounded-xl text-sm transition shadow-sm"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}