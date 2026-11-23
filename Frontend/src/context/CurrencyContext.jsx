import { createContext } from "react";

const CurrencyContext = createContext({
  country: "US",
  setCountry: () => {},
  code: "USD",
  rate: 1,
  base: "USD",
  chargeable: [],
  stale: false,
  countries: [],
});

export default CurrencyContext;