/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/purity */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  getStats, 
  listUsers, 
  setUserRole, 
  deleteUser, 
  listAllOrders, 
  listWithdrawals, 
  resolveWithdrawal 
} from "../api/adminApi";
import useAuth from "../hooks/useAuth";
import formatCurrency, { formatMoney } from "../utils/formatCurrency";
import { BarChart, ErrorBox, Loading, Pager, Stat, Tabs } from "../components/ui/kit.jsx";

function useList(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, error: "", loading: true });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setState((s) => ({ ...s, loading: true }));
      try {
        const res = await fetcher();
        if (!cancelled) setState({ data: res.data, error: "", loading: false });
      } catch (err) {
        if (!cancelled) {
          setState({ 
            data: null, 
            error: err.response?.data?.message || "Could not load data", 
            loading: false 
          });
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

function Overview() {
  const { data, error } = useList(() => getStats(), []);
  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!data) return <Loading />;
  
  const t = data.totals;
  const byDate = new Map(data.salesByDay.map((d) => [d.date, d]));
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10);
    return { label: date.slice(5), value: byDate.get(date)?.revenue || 0 };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat icon="💵" label="Revenue" value={formatCurrency(t.revenue)} />
        <Stat icon="📦" label="Paid orders" value={t.paidOrders} />
        <Stat icon="👥" label="Users" value={t.users} />
        <Stat icon="🏪" label="Sellers" value={t.sellers} />
        <Stat icon="🧾" label="Live products" value={t.products} />
      </div>
      <section className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-lg">Revenue, last 14 days</h2>
        <BarChart data={days} format={formatCurrency} />
      </section>
      <section className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-lg">Top products</h2>
        {data.topProducts.length === 0 ? (
          <p className="text-sm text-gray-500">No sales yet.</p>
        ) : (
          data.topProducts.map((p) => (
            <div key={p._id} className="flex justify-between border-b border-gray-100 dark:border-zinc-800 py-3 text-sm last:border-0">
              <Link to={`/product/${p._id}`} className="hover:text-orange-600 font-medium">{p.name}</Link>
              <span className="text-gray-500 font-semibold">{p.soldCount} sold</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function Users() {
  const { user: me } = useAuth();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState({ q: "", role: "" });
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useList(() => listUsers({ ...query, page }), [query.q, query.role, page]);

  const act = async (fn, okMessage) => {
    try {
      await fn();
      toast.success(okMessage);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery((s) => ({ ...s, q })); }} className="flex flex-wrap gap-3">
        <input 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
          placeholder="Search username or email..." 
          className="input min-w-0 flex-1 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm" 
        />
        <select 
          value={query.role} 
          onChange={(e) => { setPage(1); setQuery((s) => ({ ...s, role: e.target.value })); }} 
          className="input !w-auto bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm"
        >
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
        <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-sm cursor-pointer">
          Search
        </button>
      </form>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl divide-y divide-gray-100 dark:divide-zinc-800 shadow-sm ${loading ? "opacity-60" : ""}`}>
        {data?.users?.map((u) => {
          const self = u._id === me?.id;
          return (
            <div key={u._id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{u.username} {self && "(you)"}</p>
                <p className="truncate text-xs text-gray-500">{u.gmail}{!u.isVerified && " · unverified"}</p>
              </div>
              <select 
                value={u.role} 
                disabled={self} 
                onChange={(e) => act(() => setUserRole(u._id, e.target.value), `${u.username} is now ${e.target.value}`)} 
                className="input !w-auto !py-2 text-xs bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-lg"
              >
                <option value="user">user</option>
                <option value="seller">seller</option>
                <option value="admin">admin</option>
              </select>
              <button 
                disabled={self} 
                onClick={() => window.confirm(`Delete ${u.username}?`) && act(() => deleteUser(u._id), "User deleted")} 
                className="rounded-xl px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-30 cursor-pointer"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
      {data && <Pager page={page} pages={Math.ceil(data.total / data.limit)} onChange={setPage} />}
    </div>
  );
}

function Orders() {
  const [filters, setFilters] = useState({ paymentStatus: "", fulfilment: "" });
  const [page, setPage] = useState(1);
  const { data, error, loading } = useList(() => listAllOrders({ ...filters, page }), [filters.paymentStatus, filters.fulfilment, page]);
  
  const set = (patch) => { 
    setPage(1); 
    setFilters((f) => ({ ...f, ...patch })); 
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select value={filters.paymentStatus} onChange={(e) => set({ paymentStatus: e.target.value })} className="input !w-auto bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm">
          <option value="">Any payment</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="canceled">Canceled</option>
          <option value="failed">Failed</option>
        </select>
        <select value={filters.fulfilment} onChange={(e) => set({ fulfilment: e.target.value })} className="input !w-auto bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm">
          <option value="">Any fulfilment</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl divide-y divide-gray-100 dark:divide-zinc-800 shadow-sm ${loading ? "opacity-60" : ""}`}>
        {data?.orders?.map((o) => (
          <div key={o._id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-mono font-bold">{o.orderNumber}</p>
              <p className="truncate text-xs text-gray-500">{o.userId?.username || "Deleted user"} · {o.items?.length || 0} item(s) · {new Date(o.createdAt).toLocaleDateString()}</p>
            </div>
            <span className="rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold px-3 py-1 text-xs capitalize">
              {o.paymentStatus} / {o.fulfilment}
            </span>
            {o.risk?.score >= 30 && (
              <span className="rounded-full bg-rose-100 dark:bg-rose-950/40 px-2.5 py-1 text-xs font-bold text-rose-600">
                risk {o.risk.score}
              </span>
            )}
            <b className="text-orange-600">{formatMoney(o.chargeAmount ?? o.amount, o.chargeCurrency || o.currency)}</b>
          </div>
        ))}
      </div>
      {data && <Pager page={page} pages={Math.ceil(data.total / data.limit)} onChange={setPage} />}
    </div>
  );
}

function Payouts() {
  const [status, setStatus] = useState("requested");
  const { data, error, reload } = useList(() => listWithdrawals(status), [status]);

  const resolve = async (id, s) => {
    const note = s === "rejected" ? window.prompt("Reason for rejecting:") || "" : "";
    try {
      await resolveWithdrawal(id, s, note);
      toast.success(`Marked ${s}`);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="space-y-4">
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm">
        <option value="requested">Requested</option>
        <option value="paid">Paid</option>
        <option value="rejected">Rejected</option>
      </select>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl divide-y divide-gray-100 dark:divide-zinc-800 shadow-sm">
        {data?.withdrawals?.length === 0 && <p className="p-6 text-sm text-gray-500">Nothing here.</p>}
        {data?.withdrawals?.map((w) => (
          <div key={w._id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-bold">{w.userId?.username} · <span className="text-orange-600">{formatCurrency(w.amount)}</span></p>
              <p className="text-xs text-gray-500">{w.bank?.bankName} · {w.bank?.accountName} · {w.bank?.accountNumber}</p>
            </div>
            {w.status === "requested" ? (
              <div className="flex gap-2">
                <button onClick={() => resolve(w._id, "paid")} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer">Mark paid</button>
                <button onClick={() => resolve(w._id, "rejected")} className="border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer">Reject</button>
              </div>
            ) : (
              <span className="rounded-full bg-gray-100 dark:bg-zinc-800 px-3 py-1 text-xs font-semibold uppercase text-gray-600 dark:text-zinc-400">
                {w.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const views = { overview: <Overview />, users: <Users />, orders: <Orders />, payouts: <Payouts /> };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-gray-500 mt-1">Platform management & analytics control center</p>
          </div>
          <div className="flex gap-2">
            <Link to="/fraud" className="border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 font-bold px-4 py-2 rounded-xl text-xs transition">Fraud monitor</Link>
            <Link to="/operations" className="border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 font-bold px-4 py-2 rounded-xl text-xs transition">Operations</Link>
            <Link to="/analytics" className="border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 font-bold px-4 py-2 rounded-xl text-xs transition">Analytics</Link>
          </div>
        </div>
        <Tabs value={tab} onChange={setTab} tabs={[["overview", "Overview"], ["users", "Users"], ["orders", "Orders"], ["payouts", "Payouts"]]} />
        {views[tab]}
      </div>
    </div>
  );
}