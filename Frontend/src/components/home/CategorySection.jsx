import { Link } from "react-router-dom";

const categories = [
  { name: "Fashion", icon: "👗" },
  { name: "Electronics", icon: "💻" },
  { name: "Gaming", icon: "🎮" },
  { name: "Phones", icon: "📱" },
  { name: "Beauty", icon: "💄" },
  { name: "Shoes", icon: "👟" },
];

export default function CategorySection() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.name}
          to={`/category/${cat.name}`}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 text-center hover:shadow-lg hover:border-orange-500 dark:hover:border-orange-500 transition-all group flex flex-col items-center justify-center gap-2"
        >
          <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
          <h2 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{cat.name}</h2>
        </Link>
      ))}
    </div>
  );
}