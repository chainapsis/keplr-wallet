import { autorun, makeObservable, observable, runInAction } from "mobx";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { ChainStore } from "../chain";
import { DeepReadonly } from "utility-types";
import { HasCosmosQueries, QueriesSetBase } from "../query";
import { HasMapStore } from "../common";
import { Balances } from "../query/cosmos/balance/types";
import { computedFn } from "mobx-utils";

export class IBCCurrencyRegsitrarInner<C extends ChainInfo = ChainInfo> {
  @observable.shallow
  protected _ibcCurrencies: AppCurrency[] = [];

  constructor(
    protected readonly chainId: string,
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
    makeObservable(this);

    autorun(() => {
      const ibcCurrencies: AppCurrency[] = [];

      // If account access is generated,
      if (this.accountStore.hasAccount(this.chainId)) {
        const accountInfo = this.accountStore.getAccount(this.chainId);
        if (accountInfo.bech32Address.length > 0) {
          const queries = queriesStore.get(this.chainId);
          const balances = queries.queryBalances.getQueryBech32Address(
            accountInfo.bech32Address
          ).stakable;

          const response = balances.response;
          if (response) {
            for (const bal of (response.data as Balances).result) {
              if (bal.denom.startsWith("ibc/")) {
                const hash = bal.denom.replace("ibc/", "");
                const denomTrace = queries.cosmos.queryIBCDenomTrace.getDenomTrace(
                  hash
                ).denomTrace;
                if (denomTrace) {
                  const paths = denomTrace.paths;
                  // The previous chain id from current path.
                  let chainIdBefore = this.chainId;
                  let counterpartyChainInfo: C | undefined;
                  let originChainInfo: C | undefined;
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
                      originChainInfo = this.chainStore.getChain(
                        clientState.clientChainId
                      );
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
                    const currency = originChainInfo.currencies.find((cur) => {
                      return cur.coinMinimalDenom === denomTrace.denom;
                    });

                    if (currency && !("type" in currency)) {
                      ibcCurrencies.push({
                        ...currency,
                        coinMinimalDenom: bal.denom,
                        coinDenom: `${currency.coinDenom} (${
                          counterpartyChainInfo
                            ? counterpartyChainInfo.chainName
                            : "Unknown"
                        }/${paths[0].channelId})`,
                        paths: paths,
                        originChainId: originChainInfo.chainId,
                        originCurrency: currency,
                      });
                    }
                  } else {
                    ibcCurrencies.push({
                      coinDecimals: 0,
                      coinMinimalDenom: bal.denom,
                      coinDenom: `${denomTrace.denom} (${
                        counterpartyChainInfo
                          ? counterpartyChainInfo.chainName
                          : "Unknown"
                      }/${paths[0].channelId})`,
                      paths: paths,
                      originChainId: undefined,
                      originCurrency: undefined,
                    });
                  }
                }
              }
            }
          }
        }
      }

      runInAction(() => {
        // TODO: Change the type from array to map.
        for (const currency of this._ibcCurrencies) {
          const exist = ibcCurrencies.find(
            (cur) => cur.coinMinimalDenom === currency.coinMinimalDenom
          );
          // Don't remove the existing currency even if user doesn't have the ibc balances.
          // Currenctly, it can't be handled if the currency become unexisting.
          if (exist && exist.coinDenom !== currency.coinDenom) {
            this._ibcCurrencies = this._ibcCurrencies.filter(
              (cur) => cur.coinMinimalDenom !== currency.coinMinimalDenom
            );
          }
        }

        for (const currency of ibcCurrencies) {
          if (
            !this._ibcCurrencies.find(
              (cur) => cur.coinMinimalDenom === currency.coinMinimalDenom
            )
          ) {
            this._ibcCurrencies.push(currency);
          }
        }
      });
    });
  }

  get ibcCurrencies(): AppCurrency[] {
    return this._ibcCurrencies;
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
export class IBCCurrencyRegsitrar<
  C extends ChainInfo = ChainInfo
> extends HasMapStore<IBCCurrencyRegsitrarInner<C>> {
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
    super((chainId: string) => {
      return new IBCCurrencyRegsitrarInner<C>(
        chainId,
        this.chainStore,
        this.accountStore,
        this.queriesStore
      );
    });

    this.chainStore.registerChainInfoOverrider(this.overrideChainInfo);
  }

  protected readonly overrideChainInfo = computedFn(
    (chainInfo: DeepReadonly<C>): C => {
      if (!chainInfo.features || !chainInfo.features.includes("stargate")) {
        return chainInfo as C;
      }

      const inner = this.get(chainInfo.chainId);
      if (inner.ibcCurrencies.length > 0) {
        return {
          ...(chainInfo as C),
          currencies: chainInfo.currencies.concat(inner.ibcCurrencies),
        };
      }
      return chainInfo as C;
    }
  );
}
