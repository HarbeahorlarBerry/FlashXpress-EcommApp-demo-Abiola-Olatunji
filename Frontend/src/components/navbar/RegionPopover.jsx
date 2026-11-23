/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useRef, useEffect } from "react";
import useRegion, {
  SHIP_TO_COUNTRIES,
  LANGUAGES,
  CURRENCIES,
} from "../../context/RegionContext";

export default function RegionPopover({ compact = false }) {
  const {
    shipTo,
    language,
    currency,
    activeCountry,
    activeLanguage,
    saveRegionSettings,
  } = useRegion();

  const [open, setOpen] = useState(false);
  const [draftShipTo, setDraftShipTo] = useState(shipTo);
  const [draftLanguage, setDraftLanguage] = useState(language);
  const [draftCurrency, setDraftCurrency] = useState(currency);

  const containerRef = useRef(null);

  useEffect(() => {
    if (open) {
      setDraftShipTo(shipTo);
      setDraftLanguage(language);
      setDraftCurrency(currency);
    }
  }, [open, shipTo, language, currency]);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSave = (e) => {
    e.preventDefault();
    saveRegionSettings({
      shipTo: draftShipTo,
      language: draftLanguage,
      currency: draftCurrency,
    });
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Ship to, Language, and Currency settings"
        className={`inline-flex items-center gap-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-gray-200 dark:border-zinc-700 transition cursor-pointer ${
          compact ? "px-2 py-1.5 text-[11px]" : "px-2.5 py-1.5 text-xs"
        }`}
      >
        <span className="text-sm leading-none">{activeCountry.flag}</span>
        <span className="leading-tight text-left font-bold">
          {activeLanguage.short}/{currency}
        </span>
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">⌄</span>
      </button>

      {open && (
        <form
          onSubmit={handleSave}
          role="dialog"
          aria-label="Ship to, Language, and Currency"
          className="fixed sm:absolute left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 mt-2.5 w-[calc(100vw-2rem)] max-w-[340px] sm:w-[340px] rounded-3xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-gray-200/90 dark:border-zinc-800 shadow-2xl p-6 z-50 space-y-4"
        >
          {/* Ship to */}
          <div className="space-y-1.5">
            <label
              htmlFor="region-ship-to"
              className="block text-sm font-bold text-zinc-900 dark:text-white"
            >
              Ship to
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base">
                {SHIP_TO_COUNTRIES.find((c) => c.code === draftShipTo)?.flag || "🇳🇬"}
              </span>
              <select
                id="region-ship-to"
                value={draftShipTo}
                onChange={(e) => {
                  const nextCode = e.target.value;
                  setDraftShipTo(nextCode);
                  const matched = SHIP_TO_COUNTRIES.find((c) => c.code === nextCode);
                  if (matched?.currency) {
                    setDraftCurrency(matched.currency);
                  }
                }}
                className="w-full appearance-none rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-10 pr-9 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-900 dark:focus:border-orange-500 cursor-pointer"
              >
                {SHIP_TO_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-600 dark:text-zinc-400">
                ⌄
              </span>
            </div>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label
              htmlFor="region-language"
              className="block text-sm font-bold text-zinc-900 dark:text-white"
            >
              Language
            </label>
            <div className="relative">
              <select
                id="region-language"
                value={draftLanguage}
                onChange={(e) => setDraftLanguage(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-3.5 pr-9 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-900 dark:focus:border-orange-500 cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-600 dark:text-zinc-400">
                ⌄
              </span>
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <label
              htmlFor="region-currency"
              className="block text-sm font-bold text-zinc-900 dark:text-white"
            >
              Currency
            </label>
            <div className="relative">
              <select
                id="region-currency"
                value={draftCurrency}
                onChange={(e) => setDraftCurrency(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-3.5 pr-9 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-900 dark:focus:border-orange-500 cursor-pointer"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-600 dark:text-zinc-400">
                ⌄
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-zinc-950 dark:bg-orange-600 hover:bg-zinc-800 dark:hover:bg-orange-700 py-3 text-sm font-bold text-white transition cursor-pointer"
          >
            Save
          </button>
        </form>
      )}
    </div>
  );
}