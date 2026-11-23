import { useEffect, useState, useCallback } from "react";

const THEME_KEY = "flashxpress_theme"; // "light" | "dark" | "system"
const THEME_ORDER = ["light", "dark", "system"];

function getSystemIsDark() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getInitialTheme() {
  if (typeof window === "undefined") return "system";
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (THEME_ORDER.includes(saved)) {
      return saved;
    }
  } catch {
    // ignore storage access issues
  }
  return "system";
}

function applyThemeToDocument(mode) {
  if (typeof document === "undefined") return false;
  const shouldBeDark = mode === "dark" || (mode === "system" && getSystemIsDark());
  const root = document.documentElement;
  root.classList.toggle("dark", shouldBeDark);
  root.dataset.theme = shouldBeDark ? "dark" : "light";
  root.style.colorScheme = shouldBeDark ? "dark" : "light";
  return shouldBeDark;
}

export default function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [systemDark, setSystemDark] = useState(getSystemIsDark);

  const setTheme = useCallback((nextTheme) => {
    if (!THEME_ORDER.includes(nextTheme)) return;
    setThemeState(nextTheme);
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // ignore storage access issues
    }
    applyThemeToDocument(nextTheme);
  }, []);

  const cycleTheme = useCallback(() => {
    const currentIndex = THEME_ORDER.indexOf(theme);
    const nextTheme = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
    setTheme(nextTheme);
  }, [theme, setTheme]);

  const darkMode =
    theme === "dark" || (theme === "system" && systemDark);

  const toggleTheme = useCallback(() => {
    setTheme(darkMode ? "light" : "dark");
  }, [darkMode, setTheme]);

  useEffect(() => {
    applyThemeToDocument(theme);

    if (
      theme !== "system" ||
      typeof window === "undefined" ||
      !window.matchMedia
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (event) => {
      setSystemDark(event.matches);
      applyThemeToDocument("system");
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemChange);
      return () => mediaQuery.removeEventListener("change", handleSystemChange);
    }
    mediaQuery.addListener(handleSystemChange);
    return () => mediaQuery.removeListener(handleSystemChange);
  }, [theme]);

  return {
    theme,
    darkMode,
    setTheme,
    cycleTheme,
    toggleTheme,
  };
}