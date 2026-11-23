import { useEffect, useState } from "react";
import { getOrders } from "../api/orderApi";
import { Loading } from "../components/ui/kit";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await getOrders();
        setOrders(response.data.orders);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black tracking-tight">My Orders</h1>
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-gray-500 shadow-sm">
            You have no order history yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl divide-y divide-gray-100 dark:divide-zinc-800 shadow-sm">
            {orders.map((order) => (
              <div key={order._id} className="p-6 flex items-center justify-between text-sm">
                <span className="font-mono font-bold">Order ID: {order._id.slice(-6)}</span>
                <span className="rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-3 py-1 font-semibold capitalize text-xs">
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}