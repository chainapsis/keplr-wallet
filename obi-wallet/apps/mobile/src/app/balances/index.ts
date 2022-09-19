import { useCallback, useEffect, useState } from "react";

import { rootStore } from "../../background/root-store";
import { useStore } from "../stores";

const LOOP_JUNO1_ADDRESS =
  "juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup";

export interface ExtendedCoin {
  denom: string;
  amount: string;
  usdPrice: number;
}

export function useBalances() {
  const { demoStore, balancesStore } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const refreshBalances = useCallback(async () => {
    setRefreshing(true);
    if (!demoStore.demoMode) {
      await balancesStore.fetchBalances();
    }
    setRefreshing(false);
  }, [demoStore, balancesStore]);

  useEffect(() => {
    void refreshBalances();
  }, [refreshBalances]);

  return {
    balances: demoStore.demoMode ? [] : balancesStore.balances,
    refreshBalances,
    refreshing,
  };
}

export function formatCoin(coin: ExtendedCoin) {
  const { denom } = rootStore.multisigStore.currentChainInformation;
  switch (coin.denom) {
    case denom: {
      const digits = 6;
      const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
      return {
        icon: null,
        denom: denom.slice(1).toUpperCase(),
        digits,
        label: denom[1].toUpperCase() + denom.slice(2),
        amount,
        valueInUsd: 0,
      };
    }
    case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034": {
      const digits = 6;
      const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
      return {
        icon: null,
        denom: "axlUSDC",
        digits,
        label: "USDC (Axelar)",
        amount,
        valueInUsd: amount,
      };
    }
    case "juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup": {
      const digits = 6;
      const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
      return {
        icon: null,
        denom: "LOOP",
        digits,
        label: "Loop",
        amount,
        valueInUsd: coin.usdPrice * amount,
      };
    }
    default: {
      const digits = 6;
      const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
      return {
        icon: null,
        denom: coin.denom,
        digits: 6,
        label: "Unknown Token",
        amount: amount,
        valueInUsd: 0,
      };
    }
  }
}
