import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPredictions, getSegments } from "../api/mlApi";
import useAuth from "../hooks/useAuth";
import formatCurrency from "../utils/formatCurrency";
import { BarChart, ErrorBox, Loading, Stat } from "../components/ui/kit.jsx";

export default function Analytics() {
  const { user } = useAuth();
  const [pred, setPred] = useState(null);
  const [seg, setSeg] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const p = await getPredictions();
        if (!cancelled) setPred(p.data);
        if (user.role === "admin") {
          const s = await getSegments();
          if (!cancelled) setSeg(s.data);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Could not load analytics");
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user.role]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!pred) return <Loading />;

  const chart = [
    ...pred.history.slice(-14).map((h) => ({ label: h.date.slice(5), value: h.revenue })),
    ...pred.forecast.map((f) => ({ label: f.date.slice(5), value: f.revenue, forecast: true })),
  ];
  const next7 = pred.forecast.reduce((s, f) => s + f.revenue, 0);
  const arrow = { up: "▲ rising", down: "▼ falling", flat: "• steady" }[pred.trend];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Analytics & ML Forecasts</h1>
            <p className="text-xs text-gray-500 mt-1">Predictive business metrics and customer clustering</p>
          </div>
          <Link to="/insights" className="border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 font-bold px-4 py-2 rounded-xl text-xs transition">← Insights</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat icon="🔮" label="Forecast, next 7 days" value={formatCurrency(next7)} />
          <Stat icon="📊" label="Trend" value={arrow} hint="last 15 days vs previous 15" />
          <Stat icon="🎯" label="Model fit (R²)" value={pred.model.r2} hint="closer to 1 = better fit" />
        </div>

        <section className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-1">Revenue: last 14 days and 7-day forecast</h2>
          <p className="text-xs text-gray-500 mb-6">Predictions generated using linear regression trend analysis.</p>
          <BarChart data={chart} format={formatCurrency} height={180} />
        </section>

        <section className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-3">⚠️ Stock-out Risk</h2>
          {pred.stockRisk.length === 0 ? <p className="text-sm text-gray-500">No products projected to run out soon.</p> : pred.stockRisk.map((p) => (
            <div key={p._id} className="flex flex-wrap justify-between gap-2 border-b border-gray-100 dark:border-zinc-800 py-3 text-sm last:border-0">
              <span className="font-medium">{p.name}</span>
              <span className="text-gray-500">{p.stock} left · selling {p.unitsPerDay}/day · <b className={p.daysLeft < 5 ? "text-rose-600" : "text-amber-600"}>~{p.daysLeft} days left</b></span>
            </div>
          ))}
        </section>

        {seg && (
          <section className="space-y-4">
            <h2 className="text-xl font-black">Customer Segments (RFM)</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {seg.segments.map((s) => (
                <div key={s.name} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2"><b className="font-bold">{s.name}</b><span className="text-xs text-gray-500 font-semibold">{s.count} customers</span></div>
                    <p className="text-2xl font-black text-orange-600 mb-3">{formatCurrency(s.revenue)}</p>
                  </div>
                  <ul className="space-y-1.5 text-xs text-gray-500 border-t border-gray-100 dark:border-zinc-800 pt-3">
                    {s.customers.map((c) => <li key={c.gmail} className="truncate">{c.username} · {c.orders} orders · {formatCurrency(c.spent)}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}