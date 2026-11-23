import { useEffect, useState } from "react";

const STORAGE_KEY = "flashxpress_theme_mode"; // "light" | "dark" | "system"

const OPTIONS = [
  { id: "light", label: "Light", icon: "☀️" },
  { id: "dark", label: "Dark", icon: "🌙" },
  { id: "system", label: "System", icon: "💻" },
];

function systemPrefersDark() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function readSavedMode() {
  if (typeof window === "undefined") return "system";
  try {
    const val = window.localStorage.getItem(STORAGE_KEY);
    if (val === "light" || val === "dark" || val === "system") return val;
  } catch {
    // ignore storage errors
  }
  return "system";
}

function applyTheme(mode) {
  if (typeof document === "undefined") return false;
  const dark = mode === "dark" || (mode === "system" && systemPrefersDark());
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  root.setAttribute("data-theme", dark ? "dark" : "light");
  return dark;
}

export default function ThemeSwitcher() {
  const [mode, setMode] = useState(readSavedMode);
  const [, setSystemTick] = useState(0);

  const selectMode = (nextMode) => {
    setMode(nextMode);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // ignore storage errors
    }
    applyTheme(nextMode);
  };

  useEffect(() => {
    applyTheme(mode);

    if (mode !== "system" || typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      applyTheme("system");
      setSystemTick((n) => n + 1);
    };

    if (mq.addEventListener) {
      mq.addEventListener("change", onSystemChange);
      return () => mq.removeEventListener("change", onSystemChange);
    }
    mq.addListener(onSystemChange);
    return () => mq.removeListener(onSystemChange);
  }, [mode]);

  return (
    <div
      role="group"
      aria-label="Theme selector"
      className="inline-flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-zinc-800 p-1 border border-gray-200 dark:border-zinc-700 shrink-0"
    >
      {OPTIONS.map((opt) => {
        const isSelected = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => selectMode(opt.id)}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              isSelected
                ? "bg-orange-600 text-white shadow-sm"
                : "text-zinc-700 dark:text-zinc-200 hover:bg-white/70 dark:hover:bg-zinc-700"
            }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}