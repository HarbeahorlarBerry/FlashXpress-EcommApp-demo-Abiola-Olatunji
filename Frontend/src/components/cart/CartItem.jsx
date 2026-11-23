import useCart from "../../hooks/useCart";
import formatCurrency from "../../utils/formatCurrency";
import { PLACEHOLDER } from "../../utils/placeholder";

export default function CartItem({ item }) {
  const { removeFromCart } = useCart();

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
      <img
        src={item.images?.[0] || PLACEHOLDER}
        alt={item.name}
        className="w-20 h-20 rounded-xl object-cover bg-gray-100 dark:bg-zinc-800 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{item.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity || 1}</p>
        <p className="text-orange-600 font-black text-base mt-1">
          {formatCurrency(item.price * (item.quantity || 1))}
        </p>
      </div>
      <button
        onClick={() => removeFromCart(item._id)}
        className="text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2.5 rounded-xl transition"
      >
        Remove
      </button>
    </div>
  );
}