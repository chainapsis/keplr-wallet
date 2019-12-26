import { useState, useEffect } from "react";
import { useFetch } from "./use-fetch";

export interface UnbondInfo {
  delegator_address: string;
  validator_address: string;
  entries: [
    {
      creation_height: string;
      completion_time: string;
      initial_balance: string;
      balance: string;
    }
  ];
}

interface Result {
  height: string;
  result: UnbondInfo[];
}

/**
 * @param baseUrl Url of rest endpoint
 */
export const useUnbondingInfos = (baseUrl: string, bech32Address: string) => {
  const [url, setUrl] = useState("");

  const [unbondInfos, setUnbondInfos] = useState<UnbondInfo[]>([]);

  const fetch = useFetch<Result>(url, "get");

  useEffect(() => {
    // Clear the informations of reward if address is changed.
    setUnbondInfos([]);

    if (bech32Address) {
      setUrl(
        baseUrl + `/staking/delegators/${bech32Address}/unbonding_delegations`
      );
    }
  }, [baseUrl, bech32Address]);

  useEffect(() => {
    if (fetch.data && fetch.data.result) {
      const result = fetch.data.result;

      setUnbondInfos(result ? result : []);
    }
  }, [fetch.data]);

  return {
    url: fetch.url,
    bech32Address,
    refresh: fetch.refresh,
    fetching: fetch.fetching,
    unbondInfos
  };
};
