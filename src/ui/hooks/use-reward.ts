import { useState, useEffect } from "react";
import { useFetch } from "./use-fetch";

interface CoinPrimitive {
  denom: string;
  amount: string;
}

interface Result {
  height: string;
  result: {
    rewards?: DelegatorReward[];
    total: CoinPrimitive[];
  };
}

interface DelegatorReward {
  validator_address: string;
  reward: CoinPrimitive[];
}

/**
 * @param baseUrl Url of rest endpoint
 */
export const useReward = (baseUrl: string, bech32Address: string) => {
  const [url, setUrl] = useState("");

  const [rewards, setRewards] = useState<DelegatorReward[]>([]);
  const [totalReward, setTotalReward] = useState<CoinPrimitive[]>([]);

  const fetch = useFetch<Result>(url, "get");

  useEffect(() => {
    // Clear the informations of reward if address is changed.
    setRewards([]);
    setTotalReward([]);

    if (bech32Address) {
      setUrl(baseUrl + `/distribution/delegators/${bech32Address}/rewards`);
    }
  }, [baseUrl, bech32Address]);

  useEffect(() => {
    if (fetch.data && fetch.data.result) {
      const result = fetch.data.result;

      setRewards(result.rewards ? result.rewards : []);
      setTotalReward(result.total ? result.total : []);
    }
  }, [fetch.data]);

  return {
    url: fetch.url,
    bech32Address,
    refresh: fetch.refresh,
    fetching: fetch.fetching,
    rewards,
    totalReward
  };
};
