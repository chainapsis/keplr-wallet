import { useState, useEffect } from "react";
import { useFetch } from "./use-fetch";
import { Dec } from "@chainapsis/cosmosjs/common/decimal";

interface Result {
  height: string;
  result: string;
}

/**
 * @param baseUrl Url of rest endpoint
 */
export const useInflationInfo = (baseUrl: string) => {
  const [inflation, setInflation] = useState<Dec | undefined>();

  const fetch = useFetch<Result>(baseUrl + "/minting/inflation", "get");

  useEffect(() => {
    if (fetch.data && fetch.data.result) {
      const result = fetch.data.result;

      setInflation(new Dec(result));
    }
  }, [fetch.data]);

  return {
    inflation,
    refresh: fetch.refresh,
    fetching: fetch.fetching
  };
};
