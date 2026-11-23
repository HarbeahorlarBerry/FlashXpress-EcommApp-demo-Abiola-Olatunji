/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getWallet, withdraw } from "../api/walletApi";
import useAuth from "../hooks/useAuth";
import formatCurrency, { formatMoney } from "../utils/formatCurrency";
import useCurrency from "../hooks/useCurrency";
import { ErrorBox, Loading, Pager, Stat } from "../components/ui/kit.jsx";

const TONE = { pending: "bg-amber-100 text-amber-700", completed: "bg-emerald-100 text-emerald-700", requested: "bg-blue-100 text-blue-700", paid: "bg-emerald-100 text-emerald-700", rejected: "bg-gray-200 text-gray-600" };

export default function Wallet() {
  const { user } = useAuth();
  const { base } = useCurrency();
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ amount: "", bankName: "", accountName: "", accountNumber: "" });
  const [busy, setBusy] = useState(false);
  const canWithdraw = user?.role === "seller" || user?.role === "admin";

  const load = useCallback(async () => {
    try {
      const res = await getWallet(page);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your wallet");
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await withdraw({ ...form, amount: Number(form.amount) });
      toast.success("Withdrawal requested successfully.");
      setForm({ ...form, amount: "" });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!data) return <Loading />;
  const w = data.wallet;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-black tracking-tight">Merchant Wallet</h1>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat icon="💵" label="Available" value={formatCurrency(w.available)} hint="ready to withdraw" />
          <Stat icon="⏳" label="Pending" value={formatCurrency(w.pending)} hint="released on delivery" />
          <Stat icon="📈" label="Total earned" value={formatCurrency(w.totalEarned)} />
          <Stat icon="🏦" label="Withdrawn" value={formatCurrency(w.totalWithdrawn)} />
        </div>

        {canWithdraw ? (
          <form onSubmit={submit} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl grid gap-4 p-8 sm:grid-cols-2 shadow-sm">
            <h2 className="text-xl font-black sm:col-span-2">Request a Withdrawal</h2>
            <input type="number" min={data.minWithdrawal} step="0.01" required placeholder={`Amount in ${base} (min ${data.minWithdrawal})`} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input sm:col-span-2 bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 rounded-xl p-3.5 text-sm" />
            <input required placeholder="Bank name" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="input bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 rounded-xl p-3.5 text-sm" />
            <input required placeholder="Account name" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} className="input bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 rounded-xl p-3.5 text-sm" />
            <input required inputMode="numeric" pattern="\d{6,20}" placeholder="Account number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} className="input sm:col-span-2 bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 rounded-xl p-3.5 text-sm" />
            <button disabled={busy} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl text-sm transition sm:col-span-2 shadow-sm disabled:opacity-70">{busy ? "Submitting..." : "Request Withdrawal"}</button>
          </form>
        ) : (
          <p className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 text-sm text-gray-500 shadow-sm">Earnings appear here once your seller account is verified.</p>
        )}

        <section className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl divide-y divide-gray-100 dark:divide-zinc-800 shadow-sm overflow-hidden">
          {data.transactions.length === 0 && <p className="p-6 text-sm text-gray-500">No transactions yet.</p>}
          {data.transactions.map((t) => (
            <div key={t._id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-bold capitalize">{t.type === "sale" ? "Sale earnings" : "Withdrawal"}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(t.createdAt).toLocaleString()}
                  {t.meta?.fee > 0 && ` · after ${t.meta.feePercent}% fee (${formatMoney(t.meta.fee, base)})`}
                  {t.note && ` · ${t.note}`}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${TONE[t.status]}`}>{t.status}</span>
              <span className={`w-28 text-right font-black ${t.type === "sale" ? "text-emerald-600" : "text-zinc-700 dark:text-zinc-300"}`}>{t.type === "sale" ? "+" : "-"}{formatCurrency(t.amount)}</span>
            </div>
          ))}
        </section>
        <Pager page={page} pages={Math.ceil(data.total / data.limit)} onChange={setPage} />
      </div>
    </div>
  );
}