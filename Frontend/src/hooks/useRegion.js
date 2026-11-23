import {
  useMemo,
} from "react";


export default function useRegion() {

  const region =
    useMemo(
      () => {

        const timezone =
          Intl
            .DateTimeFormat()
            .resolvedOptions()
            .timeZone;


        if (
          timezone.includes(
            "Africa"
          )
        ) {
          return "AFRICA";
        }


        if (
          timezone.includes(
            "Europe"
          )
        ) {
          return "EUROPE";
        }


        return "GLOBAL";

      },
      []
    );


  return region;
}