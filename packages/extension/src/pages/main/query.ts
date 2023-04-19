import { ChainStore } from "../../stores";
import {
  CoinGeckoPriceStore,
  CosmosQueries,
  IAccountStore,
  IChainInfoImpl,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { DenomHelper } from "@keplr-wallet/common";

interface ViewToken {
  chainInfo: IChainInfoImpl;
  token: CoinPretty;
  price: PricePretty | undefined;
}

/**
 * 메인 페이지에 쿼리가 넘 많아서 좀 더 간단하게 하려고 만듬
 * 얘는 사용하는 순간 많은 쿼리를 만들기 때문에
 * 메인 페이지말고 다른 곳에서 이거 임포트해서 쓰면 안됨
 */
export class MainQueryState {
  constructor(
    protected readonly chainStore: ChainStore,
    protected readonly queriesStore: IQueriesStore<CosmosQueries>,
    protected readonly accountStore: IAccountStore,
    protected readonly priceStore: CoinGeckoPriceStore
  ) {
    makeObservable(this);
  }

  // Key: {chainIdentifier}/{coinMinimalDenom}
  @computed
  protected get allKnownBalancesMap(): Map<string, ViewToken> {
    const map = new Map<string, ViewToken>();

    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      if (account.bech32Address === "") {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryBalance = queries.queryBalances.getQueryBech32Address(
        account.bech32Address
      );

      const currencies = [chainInfo.stakeCurrency, ...chainInfo.currencies];
      for (const currency of currencies) {
        const key = `${chainInfo.chainIdentifier}/${currency.coinMinimalDenom}`;
        if (!map.has(key)) {
          if (
            chainInfo.stakeCurrency.coinMinimalDenom ===
            currency.coinMinimalDenom
          ) {
            const balance = queryBalance.stakable.balance;
            map.set(key, {
              chainInfo,
              token: balance,
              price: currency.coinGeckoId
                ? this.priceStore.calculatePrice(balance)
                : undefined,
            });
          } else {
            const balance = queryBalance.getBalanceFromCurrency(currency);
            map.set(key, {
              chainInfo,
              token: balance,
              price: currency.coinGeckoId
                ? this.priceStore.calculatePrice(balance)
                : undefined,
            });
          }
        }
      }
    }

    return map;
  }

  @computed
  get allKnownBalances(): ViewToken[] {
    return Array.from(this.allKnownBalancesMap.values());
  }

  @computed
  get stakables(): ViewToken[] {
    const res: ViewToken[] = [];
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const key = `${chainInfo.chainIdentifier}/${chainInfo.stakeCurrency.coinMinimalDenom}`;
      const viewToken = this.allKnownBalancesMap.get(key);
      if (viewToken) {
        res.push(viewToken);
      }
    }
    return res;
  }

  @computed
  get notStakbles(): ViewToken[] {
    const res: ViewToken[] = [];
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      for (const currency of chainInfo.currencies) {
        if (
          currency.coinMinimalDenom === chainInfo.stakeCurrency.coinMinimalDenom
        ) {
          continue;
        }
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        if (
          denomHelper.type === "native" &&
          denomHelper.denom.startsWith("ibc/")
        ) {
          continue;
        }

        const key = `${chainInfo.chainIdentifier}/${currency.coinMinimalDenom}`;
        const viewToken = this.allKnownBalancesMap.get(key);
        if (viewToken) {
          res.push(viewToken);
        }
      }
    }
    return res;
  }

  @computed
  get ibcTokens(): ViewToken[] {
    const res: ViewToken[] = [];
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      for (const currency of chainInfo.currencies) {
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        if (
          denomHelper.type === "native" &&
          denomHelper.denom.startsWith("ibc/")
        ) {
          const key = `${chainInfo.chainIdentifier}/${currency.coinMinimalDenom}`;
          const viewToken = this.allKnownBalancesMap.get(key);
          if (viewToken) {
            res.push(viewToken);
          }
        }
      }
    }
    return res;
  }

  @computed
  get delegations(): ViewToken[] {
    const res: ViewToken[] = [];
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      if (account.bech32Address === "") {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryDelegation =
        queries.cosmos.queryDelegations.getQueryBech32Address(
          account.bech32Address
        );

      res.push({
        chainInfo,
        token: queryDelegation.total,
        price: this.priceStore.calculatePrice(queryDelegation.total),
      });
    }
    return res;
  }

  @computed
  get unbondings(): ViewToken[] {
    const res: ViewToken[] = [];
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      if (account.bech32Address === "") {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryUnbonding =
        queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
          account.bech32Address
        );

      res.push({
        chainInfo,
        token: queryUnbonding.total,
        price: this.priceStore.calculatePrice(queryUnbonding.total),
      });
    }
    return res;
  }
}
