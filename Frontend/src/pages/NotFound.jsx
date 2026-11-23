// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="text-5xl font-black text-orange-600">404</div>
      <h1 className="text-xl font-black text-zinc-900 dark:text-white">
        Page not found
      </h1>
      <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm">
        The page or deal link you opened doesn&apos;t exist or may have moved.
      </p>
      <Link
        to="/home"
        className="rounded-xl bg-orange-600 hover:bg-orange-700 px-5 py-2.5 text-xs font-bold text-white transition"
      >
        Back to FlashXpress+
      </Link>
    </div>
  );
}