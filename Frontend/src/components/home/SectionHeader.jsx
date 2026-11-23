export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}