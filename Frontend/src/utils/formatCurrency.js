import { CURRENCIES } from "../context/RegionContext";

const STORAGE_KEY = "flashxpress_region_settings";

function getActiveCurrencyConfig() {
  if (typeof window === "undefined") return CURRENCIES[0];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return CURRENCIES[0];
    const { currency } = JSON.parse(raw);
    return CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  } catch {
    return CURRENCIES[0];
  }
}

export default function formatCurrency(amount, currencyOverride) {
  const num = Number(amount) || 0;
  const target = currencyOverride
    ? CURRENCIES.find((c) => c.code === currencyOverride) || CURRENCIES[0]
    : getActiveCurrencyConfig();

  const converted = num * (target.rateFromNGN ?? 1);

  return new Intl.NumberFormat(target.locale, {
    style: "currency",
    currency: target.code,
  }).format(converted);
}

export function formatMoney(amount) {
  if (amount === undefined || amount === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}