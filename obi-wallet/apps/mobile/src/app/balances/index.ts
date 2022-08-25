import { Coin, StargateClient } from "@cosmjs/stargate";
import { useEffect, useState } from "react";

import { useStore } from "../stores";

export function useBalances() {
  const { multisigStore } = useStore();
  const address = multisigStore.getProxyAddress();

  const [balances, setBalances] = useState<readonly Coin[]>([]);

  useEffect(() => {
    function f() {
      (async () => {
        const rcp = "https://rpc.uni.junonetwork.io/";
        const client = await StargateClient.connect(rcp);
        setBalances(await client.getAllBalances(address));
      })();
      return setTimeout(() => {
        f();
      }, 5000);
    }
    f();
  }, [address]);

  return balances;
}

export function formatCoin(coin: Coin) {
  switch (coin.denom) {
    case "ujunox": {
      const digits = 6;
      const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
      return {
        icon: null,
        denom: "JUNOX",
        digits,
        label: "Juno-testnet Staking Coin",
        amount,
        valueInUsd: amount * 0,
      };
    }
    default:
      throw new Error("Unknown coin denom");
  }
}
