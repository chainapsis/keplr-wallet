import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Coin, StargateClient } from "@cosmjs/stargate";
import { toGenerator } from "@keplr-wallet/common";
import { computed, flow, makeObservable, observable } from "mobx";

import { Chain } from "../../chains";
import { MultisigStore } from "../multisig";

export interface ExtendedCoin {
  denom: string;
  amount: string;
  usdPrice: number;
}

export class BalancesStore {
  @observable
  public balancesPerChain: Partial<Record<Chain, ExtendedCoin[]>> = {};

  constructor(protected multisigStore: MultisigStore) {
    makeObservable(this);
  }

  @computed
  public get balances() {
    return this.balancesPerChain[this.multisigStore.currentChain] ?? [];
  }

  @flow
  public *fetchBalances() {
    const { proxyAddress } = this.multisigStore;
    if (!proxyAddress) return;

    const { rpc } = this.multisigStore.currentChainInformation;
    const client = yield* toGenerator(StargateClient.connect(rpc));
    const wasmClient = yield* toGenerator(CosmWasmClient.connect(rpc));

    const { address } = proxyAddress;
    const balances = yield* toGenerator(client.getAllBalances(address));

    /// Return nothing if asset is considered 1 USD
    /// Return one contract address (string) if only one conversion is needed (just LOOP)
    /// Return two contract addresses (strings) if price must be grabbed from first
    /// and then divided by second price.
    const getContractRoute = (asset: string) => {
      switch (this.multisigStore.currentChain) {
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
    };

    const getUsdRate = async (coin: Coin) => {
      const route = getContractRoute(coin.denom);

      if (!route) return 0;
      if (route.length === 0) return 1;

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
      const dexBasePrice =
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
        const basePrice =
          Number(basePriceInUsdElements.commission_amount) +
          Number(basePriceInUsdElements.return_amount);
        return dexBasePrice / basePrice;
      } catch (e) {
        console.error("Price query failed");
        return 0;
      }
    };

    const extendedCoins = yield* toGenerator(
      Promise.all(
        balances.map(async (coin) => {
          try {
            return {
              ...coin,
              usdPrice: await getUsdRate(coin),
            };
          } catch (e) {
            console.warn("error with coin", JSON.stringify(coin), ":", e);
            return {
              ...coin,
              usdPrice: 0,
            };
          }
        })
      )
    );

    this.balancesPerChain[this.multisigStore.currentChain] = extendedCoins;

    client.disconnect();
    wasmClient.disconnect();
  }
}
