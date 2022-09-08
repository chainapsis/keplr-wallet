import { Coin } from "@cosmjs/stargate";
import { useEffect, useState } from "react";

import { useStargateClient } from "../stargate-client";
import { useStore } from "../stores";

export function useBalances() {
  const { multisigStore } = useStore();
  const { address } = multisigStore.proxyAddress;

  const client = useStargateClient();
  const [balances, setBalances] = useState<readonly Coin[]>([]);

  useEffect(() => {
    function f() {
      (async () => {
        if (client) {
          setBalances(await client.getAllBalances(address));
        }
      })();
      return setTimeout(() => {
        f();
      }, 5000);
    }
    const timeout = f();
    return () => {
      clearTimeout(timeout);
    };
  }, [address, client]);

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
      return {
        icon: null,
        denom: coin.denom,
        digits: 6,
        label: "Unknown Coin",
        amount: coin.amount,
        valueInUsd: 0,
      };
  }
}
