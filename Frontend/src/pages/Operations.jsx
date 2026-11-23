import fraudAgent from "../agents/fraudAgent";
import inventoryAgent from "../agents/inventoryAgent";

export default function Operations() {
  const fraud = fraudAgent.analyze({ amount: 2000000, items: 2 });
  const stock = inventoryAgent.analyze({ stock: 3 });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">AI Operations & Automated Safeguards</h1>
          <p className="text-xs text-gray-500 mt-1">Autonomous agent diagnostics and risk audits</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h2 className="font-bold text-lg">🛡️ Fraud Agent Status</h2>
            <p className="text-sm text-gray-600 dark:text-zinc-400">Analysis Result: <span className="font-bold text-orange-600">{fraud.reason || "Safe / Verified"}</span></p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h2 className="font-bold text-lg">📦 Inventory Agent Status</h2>
            <p className="text-sm text-gray-600 dark:text-zinc-400">Analysis Result: <span className="font-bold text-amber-600">{stock.message || "Healthy Stock"}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}