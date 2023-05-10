import { AppCurrency } from "@keplr-wallet/types";
import { ChainStore, IQueriesStore } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryEVMTokenInfo } from "./token-info";

export class AxelarEVMBridgeCurrencyRegistrar {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainStore: ChainStore,
    protected readonly queriesStore: IQueriesStore<{
      keplrETC: {
        readonly queryEVMTokenInfo: DeepReadonly<ObservableQueryEVMTokenInfo>;
      };
    }>,
    public readonly mainChain: string
  ) {
    this.chainStore.registerCurrencyRegistrar(
      this.currencyRegistrar.bind(this)
    );
  }

  protected currencyRegistrar(
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

    const chainInfo = this.chainStore.getChain(chainId);
    if (
      !chainInfo.features ||
      !chainInfo.features.includes("axelar-evm-bridge")
    ) {
      return;
    }

    const queries = this.queriesStore.get(chainId);

    const tokenInfo = queries.keplrETC.queryEVMTokenInfo.getAsset(
      this.mainChain,
      coinMinimalDenom
    );
    if (
      tokenInfo.symbol &&
      tokenInfo.decimals != null &&
      tokenInfo.isConfirmed
    ) {
      return {
        value: {
          coinMinimalDenom,
          coinDenom: tokenInfo.symbol,
          coinDecimals: tokenInfo.decimals,
        },
        done: !tokenInfo.isFetching,
      };
    }

    if (tokenInfo.isFetching) {
      return {
        value: undefined,
        done: false,
      };
    }

    return {
      value: undefined,
      done: true,
    };
  }
}
