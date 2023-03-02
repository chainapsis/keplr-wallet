import { AppCurrency } from "@keplr-wallet/types";
import { ChainStore, IQueriesStore } from "@keplr-wallet/stores";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { KeplrETCQueries } from "../queries";

export class GravityBridgeCurrencyRegistrar {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainStore: ChainStore,
    protected readonly queriesStore: IQueriesStore<KeplrETCQueries>
  ) {
    this.chainStore.registerCurrencyRegistrar(
      this.ibcCurrencyRegistrar.bind(this)
    );
  }

  protected ibcCurrencyRegistrar(
    chainId: string,
    coinMinimalDenom: string
  ):
    | {
        value: AppCurrency | undefined;
        done: boolean;
      }
    | undefined {
    if (!this.chainStore.hasChain(chainId)) {
      return;
    }

    const denomHelper = new DenomHelper(coinMinimalDenom);
    if (
      denomHelper.type !== "native" ||
      !denomHelper.denom.startsWith("gravity0x")
    ) {
      return;
    }

    const queries = this.queriesStore.get(chainId);

    const contractAddress = denomHelper.denom.replace("gravity", "");

    const erc20Metadata =
      queries.keplrETC.queryERC20Metadata.get(contractAddress);
    if (erc20Metadata.symbol && erc20Metadata.decimals != null) {
      return {
        value: {
          coinMinimalDenom: denomHelper.denom,
          coinDenom: erc20Metadata.symbol,
          coinDecimals: erc20Metadata.decimals,
        },
        done: true,
      };
    }

    return {
      value: undefined,
      done: false,
    };
  }
}
