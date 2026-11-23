/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyProducts } from "../api/productApi";
import { getSellerOrders, updateFulfilment } from "../api/orderApi";
import formatCurrency from "../utils/formatCurrency";
import { ErrorBox, Loading, Stat } from "../components/ui/kit";

const STATUSES = [["processing", "Processing"], ["shipped", "Shipped"], ["delivered", "Delivered"]];

function OrderCard({ order, reload }) {
  const [status, setStatus] = useState(order.fulfilment);
  const [tracking, setTracking] = useState(order.trackingNumber || "");
  const [busy, setBusy] = useState(false);
  const mine = order.items.reduce((s, i) => s + i.total, 0);
  const dirty = status !== order.fulfilment || tracking !== (order.trackingNumber || "");
  const a = order.shippingAddress;
  const held = order.risk?.review === "blocked";

  const save = async () => {
    setBusy(true);
    try {
      await updateFulfilment(order._id, status, tracking);
      toast.success(status === "delivered" ? "Delivered: earnings released!" : "Order updated");
      await reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-bold">{order.orderNumber}</p>
          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className="rounded-full bg-orange-50 dark:bg-orange-950/40 px-3 py-1 text-xs font-semibold capitalize text-orange-600 dark:text-orange-400">{order.fulfilment}</span>
      </div>
      <ul className="space-y-1.5 text-sm border-t border-b border-gray-100 dark:border-zinc-800 py-3">
        {order.items.map((i) => <li key={i._id} className="flex justify-between gap-3"><span className="line-clamp-1">{i.name} x{i.quantity}</span><b className="font-semibold">{formatCurrency(i.total)}</b></li>)}
      </ul>
      <p className="text-xs text-gray-500">
        Ship to <b className="text-zinc-800 dark:text-zinc-200">{a.fullName}</b>, {a.street}, {a.city}, {a.country} · {a.phone} · Your sales: <b className="text-orange-600">{formatCurrency(mine)}</b>
      </p>
      {held ? (
        <p className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-600">This order is on hold for review. Do not ship it.</p>
      ) : order.fulfilment !== "cancelled" && (
        <div className="flex flex-wrap gap-2 pt-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs">{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking number" className="input min-w-0 flex-1 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs" />
          <button disabled={!dirty || busy} onClick={save} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-40">{busy ? "Saving..." : "Update"}</button>
        </div>
      )}
    </div>
  );
}

export default function SellerDashboard() {
  const [products, setProducts] = useState(null);
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const [p, o] = await Promise.all([getMyProducts(), getSellerOrders(50)]);
      setProducts(p.data.products);
      setOrders(o.data.orders);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load dashboard");
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!products || !orders) return <Loading />;

  const live = products.filter((p) => p.isActive);
  const sales = orders.filter((o) => o.fulfilment !== "cancelled").reduce((s, o) => s + o.items.reduce((t, i) => t + i.total, 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Seller Dashboard</h1>
            <p className="text-xs text-gray-500 mt-1">Manage catalog items, track orders, and monitor earnings</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/dashboard/create-product" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition">+ Add Product</Link>
            <Link to="/dashboard/my-products" className="border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 font-bold px-4 py-2 rounded-xl text-xs transition">My Products</Link>
            <Link to="/wallet" className="border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 font-bold px-4 py-2 rounded-xl text-xs transition">Wallet</Link>
            <Link to="/insights" className="border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 font-bold px-4 py-2 rounded-xl text-xs transition">Insights</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat icon="📦" label="Live products" value={live.length} hint={`${products.length} total`} />
          <Stat icon="⚠️" label="Low stock" value={live.filter((p) => p.stock <= 5).length} hint="5 or fewer left" />
          <Stat icon="🚚" label="To ship" value={orders.filter((o) => o.fulfilment === "processing").length} />
          <Stat icon="💵" label="Sales" value={formatCurrency(sales)} hint={`last ${orders.length} orders`} />
        </div>

        <div>
          <h2 className="text-xl font-black mb-4">Incoming Orders</h2>
          {orders.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-gray-500 shadow-sm">
              Paid orders containing your products will appear here.
            </div>
          ) : (
            <div className="space-y-4">{orders.map((o) => <OrderCard key={o._id} order={o} reload={reload} />)}</div>
          )}
        </div>
      </div>
    </div>
  );
}