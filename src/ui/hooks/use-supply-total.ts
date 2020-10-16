import { useState, useEffect } from "react";
import { useFetch } from "./use-fetch";

interface Result {
  height: string;
  result: string;
}

/**
 * @param baseUrl Url of rest endpoint
 */
export const useSupplyTotal = (baseUrl: string, denom: string) => {
  const [result, setResult] = useState<string | undefined>();

  const fetch = useFetch<Result>(baseUrl + `/supply/total/${denom}`, "get");

  useEffect(() => {
    if (fetch.data && fetch.data.result) {
      const result = fetch.data.result;

      setResult(result);
    }
  }, [fetch.data]);

  return {
    result,
    refresh: fetch.refresh,
    fetching: fetch.fetching
  };
};
