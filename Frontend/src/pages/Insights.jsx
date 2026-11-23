import { useEffect, useState } from "react";
import { getPredictions } from "../api/mlApi";

export default function Insights() {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const response = await getPredictions();
        setPredictions(response.data.data || []);
      } catch (err) {
        console.log(err);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black tracking-tight">AI Insights</h1>
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm divide-y divide-gray-100 dark:divide-zinc-800">
          {predictions.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No active insights available.</p>
          ) : (
            predictions.map((item, index) => (
              <p key={index} className="py-3 text-sm font-medium">{item.label}</p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}