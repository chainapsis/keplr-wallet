import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Coin, StargateClient } from "@cosmjs/stargate";
import { toGenerator } from "@keplr-wallet/common";
import { computed, flow, makeObservable, observable } from "mobx";

import { Chain } from "../../chains";
import { ChainStore } from "../chain";
import { WalletStore } from "../wallet";

const LOOP_JUNO1_ADDRESS =
  "juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup";

export interface ExtendedCoin {
  contract?: string;
  denom: string;
  amount: string;
  usdPrice: number;
}

export class BalancesStore {
  protected readonly chainStore: ChainStore;
  protected readonly walletStore: WalletStore;

  @observable
  public balancesPerChain: Partial<Record<Chain, ExtendedCoin[]>> = {};

  constructor({
    chainStore,
    walletStore,
  }: {
    chainStore: ChainStore;
    walletStore: WalletStore;
  }) {
    this.chainStore = chainStore;
    this.walletStore = walletStore;
    makeObservable(this);
  }

  @computed
  public get balances() {
    return this.balancesPerChain[this.chainStore.currentChain] ?? [];
  }

  @flow
  public *fetchBalances() {
    const { address } = this.walletStore;
    if (!address) return;

    const { rpc } = this.chainStore.currentChainInformation;
    const client = yield* toGenerator(StargateClient.connect(rpc));
    const wasmClient = yield* toGenerator(CosmWasmClient.connect(rpc));

    const customBalances = async () => {
      const custom_coins: ExtendedCoin[] = [];
      const token_contract_addresses = [
        { contract: LOOP_JUNO1_ADDRESS, denom: "uloop" },
        {
          contract:
            "juno18c5uecrztn4rqakm23fskusasud7s8afujnl8yu54ule2kak5q4sdnvcz4",
          denom: "udrink",
        },
        {
          contract:
            "juno1x5xz6wu8qlau8znmc60tmazzj3ta98quhk7qkamul3am2x8fsaqqcwy7n9",
          denom: "ubottle",
        },
      ];
      for (let i = 0; i < token_contract_addresses.length; i++) {
        await wasmClient
          .queryContractSmart(token_contract_addresses[i].contract, {
            balance: { address: address },
          })
          .then((res) => {
            custom_coins.push({
              denom: token_contract_addresses[i].denom,
              amount: res.balance,
              contract: token_contract_addresses[i].contract,
              usdPrice: 0,
            });
          });
      }
      return custom_coins;
    };

    const balances = yield* toGenerator(
      client
        .getAllBalances(address)
        .then((coins) => {
          return coins.map((coin: Coin) => {
            return {
              denom: coin.denom,
              amount: coin.amount,
              usdPrice: 0,
            };
          });
        })
        .then(async (extended_coins) =>
          extended_coins.concat(await customBalances())
        )
    );

    /// Return nothing if asset is considered 1 USD
    /// Return one contract address (string) if only one conversion is needed (just LOOP)
    /// Return two contract addresses (strings) if price must be grabbed from first
    /// and then divided by second price.
    const getContractRoute = (asset: string) => {
      switch (this.chainStore.currentChain) {
        case "uni-3":
          return [
            "juno1dmwfwqvke4hew5s93ut8h4tgu6sxv67zjw0y3hskgkfpy3utnpvseqyjs7",
          ];
        case "juno-1":
          switch (asset) {
            case "ujuno":
              return [
                "juno1ctsmp54v79x7ea970zejlyws50cj9pkrmw49x46085fn80znjmpqz2n642",
              ]; // needs to be juno type
            case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034":
              return null; //axlUSDC
            case "uloop": //LOOP
              return [
                "",
                "juno1utkr0ep06rkxgsesq6uryug93daklyd6wneesmtvxjkz0xjlte9qdj2s8q",
              ];
          }
      }
      return null;
    };

    const getUsdRate = async (coin: ExtendedCoin) => {
      const route = getContractRoute(coin.denom);

      if (!route) return 0;
      if (route.length === 0) return 1;

      let dexBasePriceElements: any;

      let dexBasePrice: number;
      if (
        route[0] ===
        "juno1ctsmp54v79x7ea970zejlyws50cj9pkrmw49x46085fn80znjmpqz2n642"
      ) {
        dexBasePriceElements = await wasmClient.queryContractSmart(route[0], {
          token1_for_token2_price: {
            token1_amount: "10000000",
          },
        });
        dexBasePrice = Number(dexBasePriceElements.token2_amount) / 10;
      } else if (route[0] !== "") {
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
        dexBasePrice =
          (Number(dexBasePriceElements.commissionAmount) +
            Number(dexBasePriceElements.returnAmount)) /
          10;
      } else {
        if (route.length === 0) {
          console.error("No price route found for " + coin.denom);
        }
        dexBasePrice = 1000000;
      }

      if (route.length === 1) {
        // is base asset
        return dexBasePrice;
      }
      try {
        const basePriceInUsdElements = await wasmClient.queryContractSmart(
          route[1],
          {
            reverse_simulation: {
              ask_asset: {
                amount: "10000000", //$10
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
          Number(basePriceInUsdElements.offer_amount);
        return (dexBasePrice * 10000000) / basePrice;
      } catch (e) {
        console.error("Price query failed");
        return 0;
      }
    };

    const extendedCoins = yield* toGenerator(
      Promise.all(
        balances.map(async (coin: ExtendedCoin) => {
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

    this.balancesPerChain[this.chainStore.currentChain] = extendedCoins;

    client.disconnect();
    wasmClient.disconnect();
  }
}
