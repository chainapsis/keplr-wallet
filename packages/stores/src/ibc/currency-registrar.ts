import { observable, runInAction } from "mobx";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { ChainInfoInner, ChainStore } from "../chain";
import { HasCosmosQueries, QueriesSetBase } from "../query";
import { DenomHelper } from "@keplr-wallet/common";

export class IBCCurrencyRegsitrarInner<C extends ChainInfo = ChainInfo> {
  constructor(
    protected readonly chainInfoInner: ChainInfoInner<C>,
    protected readonly chainStore: ChainStore<C>,
    protected readonly accountStore: {
      hasAccount(chainId: string): boolean;
      getAccount(
        chainId: string
      ): {
        bech32Address: string;
      };
    },
    protected readonly queriesStore: {
      get(chainId: string): QueriesSetBase & HasCosmosQueries;
    }
  ) {}

  registerUnknownCurrencies(
    coinMinimalDenom: string
  ): [AppCurrency | undefined, boolean] | undefined {
    const denomHelper = new DenomHelper(coinMinimalDenom);
    if (
      denomHelper.type !== "native" ||
      !denomHelper.denom.startsWith("ibc/")
    ) {
      // ibc/로 시작하는 토큰만 IBC 토큰으로 처리한다.
      return;
    }

    const queries = this.queriesStore.get(this.chainInfoInner.chainId);

    const hash = denomHelper.denom.replace("ibc/", "");
    const queryDenomTrace = queries.cosmos.queryIBCDenomTrace.getDenomTrace(
      hash
    );
    const denomTrace = queryDenomTrace.denomTrace;

    if (denomTrace) {
      const paths = denomTrace.paths;
      // The previous chain id from current path.
      let chainIdBefore = this.chainInfoInner.chainId;
      let counterpartyChainInfo: ChainInfoInner | undefined;
      let originChainInfo: ChainInfoInner | undefined;
      for (const path of paths) {
        const clientState = this.queriesStore
          .get(chainIdBefore)
          .cosmos.queryIBCClientState.getClientState(
            path.portId,
            path.channelId
          );

        if (
          clientState.clientChainId &&
          this.chainStore.hasChain(clientState.clientChainId)
        ) {
          chainIdBefore = clientState.clientChainId;
          originChainInfo = this.chainStore.getChain(clientState.clientChainId);
          if (!counterpartyChainInfo) {
            counterpartyChainInfo = this.chainStore.getChain(
              clientState.clientChainId
            );
          }
        } else {
          originChainInfo = undefined;
          break;
        }
      }

      if (originChainInfo) {
        const currency = originChainInfo.findCurrency(denomTrace.denom);

        if (currency && !("type" in currency)) {
          return [
            {
              ...currency,
              coinMinimalDenom: denomHelper.denom,
              coinDenom: `${currency.coinDenom} (${
                counterpartyChainInfo
                  ? counterpartyChainInfo.chainName
                  : "Unknown"
              }/${paths[0].channelId})`,
              paths: paths,
              originChainId: originChainInfo.chainId,
              originCurrency: currency,
            },
            true,
          ];
        }
      }

      // 이 경우 그냥 raw한 값을 보여준다.
      // 하지만 이후에 쿼리를 통해 얻은 currency를 계산하게 될 수 있으므로
      // committed를 false로 반환해서 계속 observe되게 한다.
      return [
        {
          coinDecimals: 0,
          coinMinimalDenom: denomHelper.denom,
          coinDenom: `${denomTrace.denom} (${
            counterpartyChainInfo ? counterpartyChainInfo.chainName : "Unknown"
          }/${paths[0].channelId})`,
          paths: paths,
          originChainId: undefined,
          originCurrency: undefined,
        },
        false,
      ];
    }

    return [undefined, !queryDenomTrace.isFetching];
  }
}

/**
 * IBCCurrencyRegsitrar gets the native balances that exist on the chain itself (ex. atom, scrt...)
 * And, IBCCurrencyRegsitrar registers the currencies from IBC to the chain info.
 * In cosmos-sdk, the denomination of IBC token has the form of "ibc/{hash}".
 * And, its paths can be found by getting the denom trace from the node.
 * If the native balance querier's response have the token that is form of IBC token,
 * this will try to get the denom info by traversing the paths, and register the currency with the decimal and denom info.
 * But, if failed to traverse the paths, this will register the currency with 0 decimal and the minimal denom even though it is not suitable for human.
 */
export class IBCCurrencyRegsitrar<C extends ChainInfo = ChainInfo> {
  @observable.shallow
  protected map: Map<string, IBCCurrencyRegsitrarInner<C>> = new Map();

  constructor(
    protected readonly chainStore: ChainStore<C>,
    protected readonly accountStore: {
      hasAccount(chainId: string): boolean;
      getAccount(
        chainId: string
      ): {
        bech32Address: string;
      };
    },
    protected readonly queriesStore: {
      get(chainId: string): QueriesSetBase & HasCosmosQueries;
    }
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
  ): IBCCurrencyRegsitrarInner<C> {
    if (!this.map.has(chainInfoInner.chainId)) {
      runInAction(() => {
        this.map.set(
          chainInfoInner.chainId,
          new IBCCurrencyRegsitrarInner<C>(
            chainInfoInner,
            this.chainStore,
            this.accountStore,
            this.queriesStore
          )
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.map.get(chainInfoInner.chainId)!;
  }
}
