import { autorun, makeObservable, observable, runInAction } from "mobx";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { ChainStore } from "../chain";
import { DeepReadonly } from "utility-types";
import {
  ObservableQueryDenomTrace,
  ObservableQueryIBCClientState,
} from "../query";
import { AccountStore } from "../account";
import { HasMapStore } from "../common";
import { ObservableQueryBalances } from "../query/balances";
import { Balances } from "../query/cosmos/balance/types";

export class IBCCurrencyRegsitrarInner<C extends ChainInfo = ChainInfo> {
  @observable.shallow
  protected _ibcCurrencies: AppCurrency[] = [];

  constructor(
    protected readonly chainId: string,
    protected readonly chainStore: ChainStore<C>,
    protected readonly accountStore: AccountStore,
    protected readonly queriesStore: {
      get(
        chainId: string
      ): {
        getQueryIBCClientState(): DeepReadonly<ObservableQueryIBCClientState>;
        getQueryIBCDenomTrace(): DeepReadonly<ObservableQueryDenomTrace>;
        getQueryBalances(): DeepReadonly<ObservableQueryBalances>;
      };
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
          const balances = queries
            .getQueryBalances()
            .getQueryBech32Address(accountInfo.bech32Address).stakable;

          const response = balances.response;
          if (response) {
            for (const bal of (response.data as Balances).result) {
              if (bal.denom.startsWith("ibc/")) {
                const hash = bal.denom.replace("ibc/", "");
                const denomTrace = queries
                  .getQueryIBCDenomTrace()
                  .getDenomTrace(hash).denomTrace;
                if (denomTrace) {
                  const paths = denomTrace.paths;
                  let chainInfo: C | undefined;
                  for (const path of paths) {
                    const clientState = queries
                      .getQueryIBCClientState()
                      .getClientState(path.portId, path.channelId);
                    if (
                      clientState.clientChainId &&
                      this.chainStore.hasChain(clientState.clientChainId)
                    ) {
                      chainInfo = this.chainStore.getChain(
                        clientState.clientChainId
                      );
                    } else {
                      chainInfo = undefined;
                      break;
                    }
                  }

                  if (chainInfo) {
                    const currency = chainInfo.currencies.find((cur) => {
                      return cur.coinMinimalDenom === denomTrace.denom;
                    });

                    if (currency) {
                      ibcCurrencies.push({
                        ...currency,
                        coinMinimalDenom: bal.denom,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }

      runInAction(() => {
        this._ibcCurrencies = ibcCurrencies;
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
    protected readonly accountStore: AccountStore,
    protected readonly queriesStore: {
      get(
        chainId: string
      ): {
        getQueryIBCClientState(): DeepReadonly<ObservableQueryIBCClientState>;
        getQueryIBCDenomTrace(): DeepReadonly<ObservableQueryDenomTrace>;
        getQueryBalances(): DeepReadonly<ObservableQueryBalances>;
      };
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

  protected readonly overrideChainInfo = (chainInfo: DeepReadonly<C>): C => {
    const inner = this.get(chainInfo.chainId);
    if (inner.ibcCurrencies.length > 0) {
      return {
        ...(chainInfo as C),
        currencies: chainInfo.currencies.concat(inner.ibcCurrencies),
      };
    }
    return chainInfo as C;
  };
}
