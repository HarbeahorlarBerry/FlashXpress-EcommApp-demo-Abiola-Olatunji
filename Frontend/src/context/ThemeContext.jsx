/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const THEME_KEY = "flashxpress_theme_mode"; // "light" | "dark" | "system"
const THEME_ORDER = ["light", "dark", "system"];

const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  darkMode: false,
  setTheme: () => {},
  cycleTheme: () => {},
  toggleTheme: () => {},
});

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
    // ignore storage errors
  }
  return "system";
}

function applyThemeToDom(mode) {
  if (typeof document === "undefined") return false;
  const isDark = mode === "dark" || (mode === "system" && getSystemIsDark());
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.dataset.theme = isDark ? "dark" : "light";
  root.style.colorScheme = isDark ? "dark" : "light";
  return isDark;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [darkMode, setDarkMode] = useState(() => applyThemeToDom(getInitialTheme()));

  const setTheme = useCallback((nextMode) => {
    if (!THEME_ORDER.includes(nextMode)) return;
    setThemeState(nextMode);
    try {
      window.localStorage.setItem(THEME_KEY, nextMode);
    } catch {
      // ignore storage errors
    }
    const nextDark = applyThemeToDom(nextMode);
    setDarkMode((prev) => (prev === nextDark ? prev : nextDark));
  }, []);

  const cycleTheme = useCallback(() => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
    setTheme(next);
  }, [theme, setTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(darkMode ? "light" : "dark");
  }, [darkMode, setTheme]);

  useEffect(() => {
    const nextDark = applyThemeToDom(theme);
    setDarkMode((prev) => (prev === nextDark ? prev : nextDark));

    if (theme !== "system" || typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const systemDark = applyThemeToDom("system");
      setDarkMode((prev) => (prev === systemDark ? prev : systemDark));
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: darkMode ? "dark" : "light",
        darkMode,
        setTheme,
        cycleTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default function useTheme() {
  return useContext(ThemeContext);
}