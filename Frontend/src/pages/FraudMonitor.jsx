export default function FraudMonitor() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Fraud Monitor</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time risk scoring, chargebacks, and transaction security flags</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-base mb-2">Suspicious Orders</h3>
            <p className="text-xs text-gray-500">No high-risk orders flagged in the last 24 hours.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-base mb-2">Chargebacks</h3>
            <p className="text-xs text-gray-500">0 active chargeback disputes.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-base mb-2">High Risk Users</h3>
            <p className="text-xs text-gray-500">All accounts verified and compliant.</p>
          </div>
        </div>
      </div>
    </div>
  );
}