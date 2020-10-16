import { useState, useEffect } from "react";
import { useFetch } from "./use-fetch";

export interface StakingPool {
  not_bonded_tokens: string;
  bonded_tokens: string;
}

interface Result {
  height: string;
  result: StakingPool;
}

/**
 * @param baseUrl Url of rest endpoint
 */
export const useStakingPool = (baseUrl: string) => {
  const [pool, setPool] = useState<StakingPool | undefined>();

  const fetch = useFetch<Result>(baseUrl + "/staking/pool", "get");

  useEffect(() => {
    if (fetch.data && fetch.data.result) {
      const result = fetch.data.result;

      setPool(result);
    }
  }, [fetch.data]);

  return {
    pool,
    refresh: fetch.refresh,
    fetching: fetch.fetching
  };
};
