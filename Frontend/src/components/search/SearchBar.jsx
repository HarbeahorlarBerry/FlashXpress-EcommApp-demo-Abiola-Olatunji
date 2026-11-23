import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ onImageSearch }) {
  const [query, setQuery] = useState("");
  const [previewName, setPreviewName] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewName(file.name);

    if (typeof onImageSearch === "function") {
      onImageSearch(file);
    } else {
      // Fallback: derive a keyword from the filename and route to search
      const inferredTerm = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .trim();
      if (inferredTerm) {
        setQuery(inferredTerm);
        navigate(`/search?q=${encodeURIComponent(inferredTerm)}&visual=1`);
      }
    }

    e.target.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center w-full">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={previewName ? `Image: ${previewName}` : "Search millions of products..."}
        aria-label="Search products"
        className="w-full rounded-full border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/90 pl-4 pr-20 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition"
      />

      {/* Hidden file picker for Search by Image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Search by Image (Camera) Button */}
      <button
        type="button"
        onClick={handlePickImage}
        title="Search by image"
        aria-label="Search by image"
        className="absolute right-10 flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-gray-200/80 dark:hover:bg-zinc-700 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer"
      >
        <svg className="h-4 w-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h3l2-3h8l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      </button>

      {/* Text Search Submit Button */}
      <button
        type="submit"
        aria-label="Submit search"
        className="absolute right-1.5 flex h-7 w-8 items-center justify-center rounded-full bg-orange-600 hover:bg-orange-700 text-white transition cursor-pointer"
      >
        <svg className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2.4" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}