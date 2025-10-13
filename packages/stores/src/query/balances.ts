import { DenomHelper } from "@keplr-wallet/common";
import { ChainGetter } from "../chain";
import { computed, makeObservable, observable, runInAction } from "mobx";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";
import { HasMapStore, IObservableQuery, QuerySharedContext } from "../common";
import { computedFn } from "mobx-utils";

export interface IObservableQueryBalanceImpl extends IObservableQuery {
  balance: CoinPretty;
  currency: AppCurrency;
}

export interface BalanceRegistry {
  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): IObservableQueryBalanceImpl | undefined;
}

export class ObservableQueryBalancesImplMap {
  protected address: string;

  @observable.shallow
  protected balanceImplMap: Map<string, IObservableQueryBalanceImpl> =
    new Map();

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly balanceRegistries: BalanceRegistry[],
    address: string
  ) {
    makeObservable(this);

    this.address = address;
  }

  fetch() {
    this.balanceImplMap.forEach((bal) => bal.fetch());
  }

  protected getBalanceInner(
    currency: AppCurrency
  ): IObservableQueryBalanceImpl | undefined {
    let key = currency.coinMinimalDenom;
    // If the currency is secret20, it will be different according to not only the minimal denom but also the viewing key of the currency.
    if ("type" in currency && currency.type === "secret20") {
      key = currency.coinMinimalDenom + "/" + currency.viewingKey;
    }

    if (!this.balanceImplMap.has(key)) {
      runInAction(() => {
        this.balanceRegistries.forEach((registry) => {
          const balanceImpl = registry.getBalanceImpl(
            this.chainId,
            this.chainGetter,
            this.address,
            currency.coinMinimalDenom
          );

          if (balanceImpl) {
            this.balanceImplMap.set(key, balanceImpl);
          }
        });
      });
    }

    return this.balanceImplMap.get(key);
  }

  @computed
  get stakable(): IObservableQueryBalanceImpl | undefined {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (!chainInfo.stakeCurrency) {
      return undefined;
    }

    return this.getBalanceInner(chainInfo.stakeCurrency);
  }

  /**
   * 알려진 모든 Currency들의 balance를 반환환다.
   */
  @computed
  get balances(): IObservableQueryBalanceImpl[] {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const result = [];

    for (let i = 0; i < chainInfo.currencies.length; i++) {
      const currency = chainInfo.currencies[i];
      const balanceInner = this.getBalanceInner(currency);
      if (balanceInner) {
        result.push(balanceInner);
      }
    }

    return result;
  }

  /**
   * 알려진 모든 Currency들 중 0 이상의 잔고를 가진 balance를 반환환다.
   */
  @computed
  get positiveBalances(): IObservableQueryBalanceImpl[] {
    const balances = this.balances;
    return balances.filter((bal) => bal.balance.toDec().gt(new Dec(0)));
  }

  /**
   * Returns that the balances that are not native tokens.
   * Native token means that the token that exists on the `bank` module.
   */
  @computed
  get nonNativeBalances(): IObservableQueryBalanceImpl[] {
    const balances = this.balances;
    return balances.filter(
      (bal) => new DenomHelper(bal.currency.coinMinimalDenom).type !== "native"
    );
  }

  /**
   * Returns that the balances that are native tokens with greater than 0 balance.
   * Native token means that the token that exists on the `bank` module.
   */
  @computed
  get positiveNativeUnstakables(): IObservableQueryBalanceImpl[] {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const balances = this.balances;
    return balances.filter(
      (bal) =>
        new DenomHelper(bal.currency.coinMinimalDenom).type === "native" &&
        bal.balance.toDec().gt(new Dec(0)) &&
        bal.currency.coinMinimalDenom !==
          chainInfo.stakeCurrency?.coinMinimalDenom
    );
  }

  @computed
  get unstakables(): IObservableQueryBalanceImpl[] {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const currencies = chainInfo.currencies.filter(
      (cur) =>
        cur.coinMinimalDenom !== chainInfo.stakeCurrency?.coinMinimalDenom
    );

    const result = [];

    for (let i = 0; i < currencies.length; i++) {
      const currency = currencies[i];
      const balanceInner = this.getBalanceInner(currency);
      if (balanceInner) {
        result.push(balanceInner);
      }
    }

    return result;
  }

  /**
   * @deprecated
   */
  readonly getBalanceFromCurrency = computedFn(
    (currency: AppCurrency): CoinPretty => {
      const bal = this.balances.find(
        (bal) => bal.currency.coinMinimalDenom === currency.coinMinimalDenom
      );
      if (bal) {
        return bal.balance;
      }

      return new CoinPretty(currency, new Int(0));
    }
  );

  readonly getBalance = computedFn(
    (currency: AppCurrency): IObservableQueryBalanceImpl | undefined => {
      const bal = this.balances.find(
        (bal) =>
          DenomHelper.normalizeDenom(bal.currency.coinMinimalDenom) ===
          DenomHelper.normalizeDenom(currency.coinMinimalDenom)
      );
      if (bal) {
        return bal;
      }

      return;
    }
  );
}

export class ObservableQueryBalances extends HasMapStore<ObservableQueryBalancesImplMap> {
  protected balanceRegistries: BalanceRegistry[] = [];

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super((address: string) => {
      return new ObservableQueryBalancesImplMap(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        this.balanceRegistries,
        address
      );
    });
  }

  addBalanceRegistry(registry: BalanceRegistry) {
    this.balanceRegistries.push(registry);
  }

  getQueryBech32Address(bech32Address: string): ObservableQueryBalancesImplMap {
    return this.get(bech32Address) as ObservableQueryBalancesImplMap;
  }

  getQueryEthereumHexAddress(
    ethereumHexAddress: string
  ): ObservableQueryBalancesImplMap {
    return this.get(ethereumHexAddress) as ObservableQueryBalancesImplMap;
  }
}
