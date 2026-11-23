/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "flashxpress_region_settings";

export const SHIP_TO_COUNTRIES = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬", currency: "NGN", language: "en" },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", language: "en" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", language: "en" },
  { code: "EU", name: "European Union", flag: "🇪🇺", currency: "EUR", language: "en" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", currency: "GHS", language: "en" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", currency: "KES", language: "en" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", currency: "ZAR", language: "en" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", language: "en" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", language: "en" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", currency: "AED", language: "ar" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", language: "ar" },
  { code: "CN", name: "China", flag: "🇨🇳", currency: "CNY", language: "zh" },
  { code: "JP", name: "Japan", flag: "🇯🇵", currency: "JPY", language: "ja" },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", language: "hi" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", currency: "BRL", language: "pt" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", currency: "MXN", language: "es" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR", language: "fr" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR", language: "de" },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR", language: "es" },
  { code: "IT", name: "Italy", flag: "🇮🇹", currency: "EUR", language: "it" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", currency: "EUR", language: "nl" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", currency: "SEK", language: "sv" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", currency: "CHF", language: "de" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "SGD", language: "en" },
];

export const LANGUAGES = [
  { code: "en", short: "EN", label: "English" },
  { code: "fr", short: "FR", label: "Français" },
  { code: "es", short: "ES", label: "Español" },
  { code: "ar", short: "AR", label: "العربية" },
  { code: "zh", short: "ZH", label: "简体中文" },
  { code: "de", short: "DE", label: "Deutsch" },
  { code: "pt", short: "PT", label: "Português" },
  { code: "ja", short: "JA", label: "日本語" },
  { code: "hi", short: "HI", label: "हिन्दी" },
  { code: "it", short: "IT", label: "Italiano" },
  { code: "nl", short: "NL", label: "Nederlands" },
  { code: "sv", short: "SV", label: "Svenska" },
];

export const CURRENCIES = [
  { code: "NGN", label: "NGN ( Nigerian Naira )", locale: "en-NG", rateFromNGN: 1 },
  { code: "USD", label: "USD ( US Dollar )", locale: "en-US", rateFromNGN: 1 / 1600 },
  { code: "EUR", label: "EUR ( Euro )", locale: "de-DE", rateFromNGN: 1 / 1730 },
  { code: "GBP", label: "GBP ( British Pound )", locale: "en-GB", rateFromNGN: 1 / 2050 },
  { code: "GHS", label: "GHS ( Ghanaian Cedi )", locale: "en-GH", rateFromNGN: 1 / 105 },
  { code: "KES", label: "KES ( Kenyan Shilling )", locale: "en-KE", rateFromNGN: 1 / 12.4 },
  { code: "ZAR", label: "ZAR ( South African Rand )", locale: "en-ZA", rateFromNGN: 1 / 88 },
  { code: "CAD", label: "CAD ( Canadian Dollar )", locale: "en-CA", rateFromNGN: 1 / 1160 },
  { code: "AUD", label: "AUD ( Australian Dollar )", locale: "en-AU", rateFromNGN: 1 / 1050 },
  { code: "AED", label: "AED ( UAE Dirham )", locale: "ar-AE", rateFromNGN: 1 / 436 },
  { code: "SAR", label: "SAR ( Saudi Riyal )", locale: "ar-SA", rateFromNGN: 1 / 427 },
  { code: "CNY", label: "CNY ( Chinese Yuan )", locale: "zh-CN", rateFromNGN: 1 / 222 },
  { code: "JPY", label: "JPY ( Japanese Yen )", locale: "ja-JP", rateFromNGN: 1 / 10.5 },
  { code: "INR", label: "INR ( Indian Rupee )", locale: "en-IN", rateFromNGN: 1 / 19 },
  { code: "BRL", label: "BRL ( Brazilian Real )", locale: "pt-BR", rateFromNGN: 1 / 280 },
  { code: "MXN", label: "MXN ( Mexican Peso )", locale: "es-MX", rateFromNGN: 1 / 82 },
  { code: "CHF", label: "CHF ( Swiss Franc )", locale: "de-CH", rateFromNGN: 1 / 1820 },
  { code: "SEK", label: "SEK ( Swedish Krona )", locale: "sv-SE", rateFromNGN: 1 / 152 },
  { code: "SGD", label: "SGD ( Singapore Dollar )", locale: "en-SG", rateFromNGN: 1 / 1190 },
];

const DEFAULT_SETTINGS = {
  shipTo: "NG",
  language: "en",
  currency: "NGN",
};

function getInitialSettings() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      shipTo: SHIP_TO_COUNTRIES.some((c) => c.code === parsed.shipTo)
        ? parsed.shipTo
        : DEFAULT_SETTINGS.shipTo,
      language: LANGUAGES.some((l) => l.code === parsed.language)
        ? parsed.language
        : DEFAULT_SETTINGS.language,
      currency: CURRENCIES.some((c) => c.code === parsed.currency)
        ? parsed.currency
        : DEFAULT_SETTINGS.currency,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const RegionContext = createContext({
  shipTo: "NG",
  language: "en",
  currency: "NGN",
  activeCountry: SHIP_TO_COUNTRIES[0],
  activeLanguage: LANGUAGES[0],
  activeCurrency: CURRENCIES[0],
  saveRegionSettings: () => {},
});

export function RegionProvider({ children }) {
  const [settings, setSettings] = useState(getInitialSettings);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage errors
    }
  }, [settings]);

  const saveRegionSettings = useCallback((next) => {
    setSettings((prev) => ({
      shipTo: next.shipTo ?? prev.shipTo,
      language: next.language ?? prev.language,
      currency: next.currency ?? prev.currency,
    }));
  }, []);

  const activeCountry =
    SHIP_TO_COUNTRIES.find((c) => c.code === settings.shipTo) || SHIP_TO_COUNTRIES[0];
  const activeLanguage =
    LANGUAGES.find((l) => l.code === settings.language) || LANGUAGES[0];
  const activeCurrency =
    CURRENCIES.find((c) => c.code === settings.currency) || CURRENCIES[0];

  return (
    <RegionContext.Provider
      value={{
        shipTo: settings.shipTo,
        language: settings.language,
        currency: settings.currency,
        activeCountry,
        activeLanguage,
        activeCurrency,
        saveRegionSettings,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export default function useRegion() {
  return useContext(RegionContext);
}