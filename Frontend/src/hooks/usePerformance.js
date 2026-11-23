import {
  useEffect,
} from "react";

import {
  logInfo,
} from "../utils/logger";


export default function usePerformance() {

  useEffect(
    () => {

      const start =
        performance.now();


      return () => {

        const end =
          performance.now();

        logInfo(
          `Render took ${
            end - start
          }ms`
        );
      };

    },
    []
  );
}