import {
  useState,
} from "react";


export default function useCurrency() {

  const [
    currency,
    setCurrency,
  ] = useState(
    "NGN"
  );


  return {
    currency,
    setCurrency,
  };
}