const BASE = () => (process.env.CURRENCY || "USD").toUpperCase();
const CHARGEABLE = () =>
  (process.env.CHARGE_CURRENCIES || "NGN,USD,GBP,EUR,GHS,KES,ZAR,UGX,TZS,RWF,XOF,XAF")
    .split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);

// Approximate USD-based rates, only used when the live feed has never loaded.
const FALLBACK_USD = {
  USD: 1, NGN: 1500, GBP: 0.78, EUR: 0.92, GHS: 15, KES: 129, ZAR: 18.5, UGX: 3700, TZS: 2600, RWF: 1350,
  XOF: 605, XAF: 605, EGP: 49, MAD: 10, CAD: 1.37, AUD: 1.52, NZD: 1.65, INR: 83, PKR: 278, BDT: 118,
  CNY: 7.2, JPY: 150, KRW: 1350, SGD: 1.35, MYR: 4.7, IDR: 15800, PHP: 57, THB: 36, VND: 25000,
  AED: 3.67, SAR: 3.75, TRY: 32, BRL: 5.1, MXN: 17, ARS: 900, CLP: 940, COP: 3900,
};

const TTL = 6 * 60 * 60 * 1000;
let cache = { rates: null, fetchedAt: 0, stale: true };

const refresh = async () => {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${BASE()}`);
    const data = await res.json();
    if (data.result === "success" && data.rates) {
      cache = { rates: data.rates, fetchedAt: Date.now(), stale: false };
    }
  } catch (error) {
    console.error("FX refresh failed:", error.message);
  }
};

export const getRates = async () => {
  if (!cache.rates || Date.now() - cache.fetchedAt > TTL) await refresh();

  if (!cache.rates) {
    const b = FALLBACK_USD[BASE()] || 1;
    const rates = Object.fromEntries(Object.entries(FALLBACK_USD).map(([k, v]) => [k, v / b]));
    cache = { rates, fetchedAt: Date.now() - TTL + 10 * 60 * 1000, stale: true }; // retry the feed in 10 min
  }
  return {
    base: BASE(),
    rates: cache.rates,
    stale: cache.stale,
    updatedAt: new Date(cache.fetchedAt).toISOString(),
    chargeable: CHARGEABLE(),
  };
};

export const decimalsFor = (code) => {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: code }).resolvedOptions().maximumFractionDigits;
  } catch {
    return 2;
  }
};

export const roundFor = (amount, code) => {
  const f = 10 ** decimalsFor(code);
  return Math.round(amount * f) / f;
};

export const convertFromBase = async (amount, to) => {
  const { rates, base } = await getRates();
  const target = String(to || base).toUpperCase();
  const rate = target === base ? 1 : rates[target];
  if (!rate) return { amount: roundFor(amount, base), currency: base, rate: 1 };
  return { amount: roundFor(amount * rate, target), currency: target, rate };
};

// Decide what the customer is actually charged. Unsupported currencies fall back to the base currency.
export const resolveCharge = async (baseAmount, requested) => {
  const { base, chargeable } = await getRates();
  const want = String(requested || base).toUpperCase();
  if (want === base || !chargeable.includes(want)) {
    return { chargeAmount: roundFor(baseAmount, base), chargeCurrency: base, fxRate: 1 };
  }
  const c = await convertFromBase(baseAmount, want);
  return { chargeAmount: c.amount, chargeCurrency: c.currency, fxRate: c.rate };
};