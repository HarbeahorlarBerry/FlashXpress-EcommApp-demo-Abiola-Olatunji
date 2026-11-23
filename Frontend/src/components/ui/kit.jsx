export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
      <p className="text-xs font-semibold">{message}</p>
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
    </div>
  );
}

export function Stat({ title, value, icon, change }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-gray-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{value}</p>
        {change && (
          <span className={`text-xs font-bold ${change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

export function Pager({ page, pages, onChange }) {
  return (
    <div className="flex items-center justify-between py-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-xl border border-gray-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold disabled:opacity-40 transition hover:bg-gray-100 dark:hover:bg-zinc-800"
      >
        Previous
      </button>
      <span className="text-xs text-gray-500 font-semibold">
        Page {page} of {pages || 1}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="rounded-xl border border-gray-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold disabled:opacity-40 transition hover:bg-gray-100 dark:hover:bg-zinc-800"
      >
        Next
      </button>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex space-x-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
      {tabs.map((tab) => {
        const id = Array.isArray(tab) ? tab[0] : tab.id || tab;
        const label = Array.isArray(tab) ? tab[1] : tab.label || tab;
        const isActive = value === id;

        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              isActive
                ? "bg-orange-600 text-white shadow-sm"
                : "text-gray-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function BarChart({ data = [], title, format = (v) => v, height = 180 }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-gray-200 dark:border-zinc-800">
      {title && <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">{title}</h3>}
      <div className="flex items-end gap-2 pt-4 border-b border-gray-100 dark:border-zinc-800" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const heightPercent = item.value ? Math.min(Math.max((item.value / 100) * 100, 10), 100) : 15;
          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group relative">
              <div 
                style={{ height: `${heightPercent}%` }} 
                className="w-full bg-orange-600 rounded-t-lg transition-all duration-300 group-hover:bg-orange-500"
                title={`${item.label}: ${format(item.value)}`}
              ></div>
              <span className="text-[10px] text-gray-400 truncate max-w-full">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}