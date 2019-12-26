import { useState, useEffect } from "react";
import { useFetch } from "./use-fetch";

export interface DelegateInfo {
  delegator_address: string;
  validator_address: string;
  shares: string;
  balance: string;
}

interface Result {
  height: string;
  result: DelegateInfo[];
}

/**
 * @param baseUrl Url of rest endpoint
 */
export const useDelegatingInfos = (baseUrl: string, bech32Address: string) => {
  const [url, setUrl] = useState("");

  const [delegateInfos, setDelegateInfos] = useState<DelegateInfo[]>([]);

  const fetch = useFetch<Result>(url, "get");

  useEffect(() => {
    // Clear the informations of reward if address is changed.
    setDelegateInfos([]);

    if (bech32Address) {
      setUrl(baseUrl + `/staking/delegators/${bech32Address}/delegations`);
    }
  }, [baseUrl, bech32Address]);

  useEffect(() => {
    if (fetch.data && fetch.data.result) {
      const result = fetch.data.result;

      setDelegateInfos(result ? result : []);
    }
  }, [fetch.data]);

  return {
    url: fetch.url,
    bech32Address,
    refresh: fetch.refresh,
    fetching: fetch.fetching,
    delegateInfos
  };
};
