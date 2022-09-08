import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Coin } from "@cosmjs/stargate";
import { useEffect, useState } from "react";

import { rootStore } from "../../background/root-store";
import { useCosmWasmClient, useStargateClient } from "../clients";
import { useStore } from "../stores";

export interface ExtendedCoin {
  denom: string;
  amount: string;
  usdPrice: number;
}

export function useBalances() {
  const { multisigStore } = useStore();
  const { address } = multisigStore.proxyAddress;

  const client = useStargateClient();
  const wasmClient = useCosmWasmClient();
  const [balances, setBalances] = useState<ExtendedCoin[]>([]);

  useEffect(() => {
    async function f() {
      if (client && wasmClient) {
        const balances = await client.getAllBalances(address);
        setBalances(await extendCoinsWithPrices({ balances, wasmClient }));
      }
    }
    const interval = setInterval(f, 5000);
    void f();
    return () => {
      clearInterval(interval);
    };
  }, [address, client, wasmClient]);

  return balances;
}

export async function extendCoinsWithPrices({
  balances,
  wasmClient,
}: {
  balances: readonly Coin[];
  wasmClient: CosmWasmClient;
}) {
  const extendedCoins = [];
  for (const coin of balances) {
    let price;
    try {
      price = await getUsdRate({ coin, wasmClient });
      extendedCoins.push({
        denom: coin.denom,
        amount: coin.amount,
        usdPrice: price,
      });
    } catch (e) {
      console.warn("error with coin", JSON.stringify(coin), ":", e);
    }
  }
  return extendedCoins;
}

export async function getUsdRate({
  coin,
  wasmClient,
}: {
  coin: Coin;
  wasmClient: CosmWasmClient;
}) {
  const network = rootStore.multisigStore.currentChain;
  const route = getContractRoute(coin.denom, network);
  if (!route == null) return 0;
  if (route.length === 0) {
    return 1;
  } else {
    let dexBasePriceElements = {
      commissionAmount: 1,
      returnAmount: 9,
    };
    if (route[0] !== "") {
      dexBasePriceElements = await wasmClient.queryContractSmart(route[0], {
        simulation: {
          offer_asset: {
            amount: "10000000", // force 10 for now, but may have slippage or other issues with assets
            info: {
              native_token: { denom: coin.denom },
            },
          },
        },
      });
    }
    const dexBasePrice: number =
      (Number(dexBasePriceElements.commissionAmount) +
        Number(dexBasePriceElements.returnAmount)) /
      10;
    if (route.length === 1) {
      // is base asset
      return dexBasePrice;
    }
    try {
      const basePriceInUsdElements = await wasmClient.queryContractSmart(
        route[1],
        {
          simulation: {
            offer_asset: {
              amount: "1000000", //$1
              info: {
                native_token: {
                  denom:
                    "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034",
                },
              },
            },
          },
        }
      );
      const basePrice: number =
        Number(basePriceInUsdElements.commission_amount) +
        Number(basePriceInUsdElements.return_amount);
      return dexBasePrice / basePrice;
    } catch (e) {
      console.error("Price query failed");
    }
  }
}

/// Return nothing if asset is considered 1 USD
/// Return one contract address (string) if only one conversion is needed (just LOOP)
/// Return two contract addresses (strings) if price must be grabbed from first
/// and then divided by second price.
export function getContractRoute(asset: string, network: string) {
  switch (network) {
    case "uni-3":
      return [
        "juno1dmwfwqvke4hew5s93ut8h4tgu6sxv67zjw0y3hskgkfpy3utnpvseqyjs7",
        "juno1dmwfwqvke4hew5s93ut8h4tgu6sxv67zjw0y3hskgkfpy3utnpvseqyjs7",
      ];
    case "juno-1":
      switch (asset) {
        case "ujuno":
          return [
            "juno1qc8mrs3hmxm0genzrd92akja5r0v7mfm6uuwhktvzphhz9ygkp8ssl4q07",
            "juno1utkr0ep06rkxgsesq6uryug93daklyd6wneesmtvxjkz0xjlte9qdj2s8q",
          ];
        case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034":
          return null; //axlUSDC
        case "juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup": //LOOP
          return [
            "",
            "juno1utkr0ep06rkxgsesq6uryug93daklyd6wneesmtvxjkz0xjlte9qdj2s8q",
          ];
      }
  }
  return null;
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
        valueInUsd: amount * 0,
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
        valueInUsd: amount * 1,
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
