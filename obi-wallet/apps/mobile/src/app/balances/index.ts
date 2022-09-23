import { useCallback, useEffect, useState } from "react";

import { rootStore } from "../../background/root-store";
import { useStore } from "../stores";
import LoopIcon from "./assets/loop.svg";

export interface ExtendedCoin {
  denom: string;
  amount: string;
  usdPrice: number;
}

export function useBalances() {
  const { demoStore, balancesStore, walletStore } = useStore();
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
  }, [refreshBalances, walletStore.address]);

  return {
    balances: demoStore.demoMode ? [] : balancesStore.balances,
    refreshBalances,
    refreshing,
  };
}

export function formatCoin(coin: ExtendedCoin) {
  const { denom } = rootStore.chainStore.currentChainInformation;
  switch (coin.denom) {
    case denom: {
      const digits = 6;
      const usdValue = coin.usdPrice / Math.pow(10, digits);
      const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
      return {
        icon: denom.includes("ujuno") ? require("./assets/juno.png") : null,
        denom: denom.slice(1).toUpperCase(),
        digits,
        label: denom[1].toUpperCase() + denom.slice(2),
        amount,
        valueInUsd: amount * usdValue,
      };
    }
    case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034": {
      const digits = 6;
      const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
      return {
        icon: require("./assets/usdc.png"),
        denom: "axlUSDC",
        digits,
        label: "USDC (Axelar)",
        amount,
        valueInUsd: amount,
      };
    }
    case "uloop": {
      const digits = 6;
      const usdValue = coin.usdPrice / Math.pow(10, digits);
      const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
      return {
        icon: LoopIcon,
        denom: "LOOP",
        digits,
        label: "Loop",
        amount,
        valueInUsd: usdValue * amount,
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
        valueInUsd: amount * coin.usdPrice,
      };
    }
  }
}
