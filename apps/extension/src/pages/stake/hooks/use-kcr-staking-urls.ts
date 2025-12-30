import { useMemo } from "react";
import { useStore } from "../../../stores";
import { ChainInfo } from "@keplr-wallet/types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

const KCR_STAKING_CHAIN_IDENTIFIERS = new Set([
  "Oraichain",
  "allora-mainnet",
  "archway",
  "carbon",
  "milkyway",
  "ununifi-beta",
  "vota-ash",
  "xrplevm_1440000",
]);

export const useKcrStakingUrls = () => {
  const { queriesStore } = useStore();

  const queryChains = queriesStore.simpleQuery.queryGet<{
    chains: ChainInfo[];
  }>(
    "https://7v6zjsr36fqrqcaeuqbhyrq46a0qndzt.lambda-url.us-west-2.on.aws",
    `/chains`
  );

  const urlMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!queryChains.response?.data) return map;

    for (const chain of queryChains.response.data.chains) {
      const identifier = ChainIdHelper.parse(chain.chainId).identifier;
      if (
        KCR_STAKING_CHAIN_IDENTIFIERS.has(identifier) &&
        chain.walletUrlForStaking
      ) {
        map.set(identifier, chain.walletUrlForStaking);
      }
    }
    return map;
  }, [queryChains.response?.data]);

  return {
    getKcrStakingUrl: (chainId: string): string | undefined => {
      const identifier = ChainIdHelper.parse(chainId).identifier;
      return urlMap.get(identifier);
    },
    hasKcrStakingUrl: (chainId: string): boolean => {
      const identifier = ChainIdHelper.parse(chainId).identifier;
      return urlMap.has(identifier);
    },
  };
};
