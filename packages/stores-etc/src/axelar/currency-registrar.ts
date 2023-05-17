import { observable, runInAction } from "mobx";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import {
  ChainInfoInner,
  ChainStore,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryEVMTokenInfo } from "./token-info";

export class AxelarEVMBridgeCurrencyRegistrarInner<
  C extends ChainInfo = ChainInfo
> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainInfoInner: ChainInfoInner<C>,
    protected readonly chainStore: ChainStore<C>,
    protected readonly queriesStore: IQueriesStore<{
      keplrETC: {
        readonly queryEVMTokenInfo: DeepReadonly<ObservableQueryEVMTokenInfo>;
      };
    }>,
    protected readonly mainChain: string
  ) {}

  registerUnknownCurrencies(
    coinMinimalDenom: string
  ): [AppCurrency | undefined, boolean] | undefined {
    const chainInfo = this.chainStore.getChain(this.chainInfoInner.chainId);
    if (
      !chainInfo.features ||
      !chainInfo.features.includes("axelar-evm-bridge")
    ) {
      return;
    }

    const queries = this.queriesStore.get(this.chainInfoInner.chainId);

    const tokenInfo = queries.keplrETC.queryEVMTokenInfo.getAsset(
      this.mainChain,
      coinMinimalDenom
    );
    if (
      tokenInfo.symbol &&
      tokenInfo.decimals != null &&
      tokenInfo.isConfirmed
    ) {
      return [
        {
          coinMinimalDenom,
          coinDenom: tokenInfo.symbol,
          coinDecimals: tokenInfo.decimals,
        },
        !tokenInfo.isFetching,
      ];
    }

    // There is no matching response after query completes,
    // there is no way to get the asset info.
    if (!tokenInfo.isFetching) {
      return;
    }

    return [undefined, false];
  }
}

export class AxelarEVMBridgeCurrencyRegistrar<C extends ChainInfo = ChainInfo> {
  @observable.shallow
  protected map: Map<
    string,
    AxelarEVMBridgeCurrencyRegistrarInner<C>
  > = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainStore: ChainStore<C>,
    protected readonly queriesStore: IQueriesStore<{
      keplrETC: {
        readonly queryEVMTokenInfo: DeepReadonly<ObservableQueryEVMTokenInfo>;
      };
    }>,
    public readonly mainChain: string
  ) {
    this.chainStore.addSetChainInfoHandler((chainInfoInner) =>
      this.setChainInfoHandler(chainInfoInner)
    );
  }

  setChainInfoHandler(chainInfoInner: ChainInfoInner<C>): void {
    const inner = this.get(chainInfoInner);
    chainInfoInner.registerCurrencyRegistrar((coinMinimalDenom) =>
      inner.registerUnknownCurrencies(coinMinimalDenom)
    );
  }

  protected get(
    chainInfoInner: ChainInfoInner<C>
  ): AxelarEVMBridgeCurrencyRegistrarInner<C> {
    if (!this.map.has(chainInfoInner.chainId)) {
      runInAction(() => {
        this.map.set(
          chainInfoInner.chainId,
          new AxelarEVMBridgeCurrencyRegistrarInner<C>(
            this.kvStore,
            chainInfoInner,
            this.chainStore,
            this.queriesStore,
            this.mainChain
          )
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.map.get(chainInfoInner.chainId)!;
  }
}
