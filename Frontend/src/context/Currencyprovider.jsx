import { Fragment, useEffect, useState } from "react";
import CurrencyContext from "./CurrencyContext";
import { getCurrency } from "../api/currencyApi";
import { COUNTRIES, guessCountry } from "../utils/countries";
import { currencyStore } from "../utils/formatCurrency";

const readCountry = () => {
  try {
    return localStorage.getItem("country") || guessCountry();
  } catch {
    return guessCountry();
  }
};

function CurrencyProvider({ children }) {
  const [data, setData] = useState(null); // { base, rates, chargeable, stale }
  const [country, setCountryState] = useState(readCountry);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getCurrency();
        if (!cancelled) setData(res.data);
      } catch {
        // rates unavailable: everything keeps showing in the base currency
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const wanted = COUNTRIES.find((c) => c.code === country)?.currency;
  const usable = data && wanted && (wanted === data.base || data.rates[wanted]);
  const code = usable ? wanted : data?.base || "USD";
  const rate = data && code !== data.base ? data.rates[code] : 1;

  // Idempotent: keeps the plain formatCurrency() helper in sync before children render.
  currencyStore.set({ base: data?.base || "USD", code, rate });

  const setCountry = (c) => {
    setCountryState(c);
    try {
      localStorage.setItem("country", c);
    } catch {
      // storage unavailable: the choice still applies for this session
    }
  };

  return (
    <CurrencyContext.Provider
      value={{ country, setCountry, code, rate, base: data?.base || "USD", chargeable: data?.chargeable || [], stale: data?.stale, countries: COUNTRIES }}
    >
      {/* Changing currency remounts the page tree so every price re-renders (URL and login are kept). */}
      <Fragment key={code}>{children}</Fragment>
    </CurrencyContext.Provider>
  );
}

export default CurrencyProvider;