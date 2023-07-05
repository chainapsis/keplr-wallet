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
  protected bech32Address: string;

  @observable.shallow
  protected balanceImplMap: Map<string, IObservableQueryBalanceImpl> =
    new Map();

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly balanceRegistries: BalanceRegistry[],
    bech32Address: string
  ) {
    makeObservable(this);

    this.bech32Address = bech32Address;
  }

  fetch() {
    this.balanceImplMap.forEach((bal) => bal.fetch());
  }

  protected getBalanceInner(
    currency: AppCurrency
  ): IObservableQueryBalanceImpl {
    let key = currency.coinMinimalDenom;
    // If the currency is secret20, it will be different according to not only the minimal denom but also the viewing key of the currency.
    if ("type" in currency && currency.type === "secret20") {
      key = currency.coinMinimalDenom + "/" + currency.viewingKey;
    }

    if (!this.balanceImplMap.has(key)) {
      runInAction(() => {
        let balanceImpl: IObservableQueryBalanceImpl | undefined;

        for (const registry of this.balanceRegistries) {
          balanceImpl = registry.getBalanceImpl(
            this.chainId,
            this.chainGetter,
            this.bech32Address,
            currency.coinMinimalDenom
          );
          if (balanceImpl) {
            break;
          }
        }

        if (balanceImpl) {
          this.balanceImplMap.set(key, balanceImpl);
        } else {
          throw new Error(`Failed to get and parse the balance for ${key}`);
        }
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.balanceImplMap.get(key)!;
  }

  @computed
  get stakable(): IObservableQueryBalanceImpl {
    const chainInfo = this.chainGetter.getChain(this.chainId);

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
      result.push(this.getBalanceInner(currency));
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
          chainInfo.stakeCurrency.coinMinimalDenom
    );
  }

  @computed
  get unstakables(): IObservableQueryBalanceImpl[] {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const currencies = chainInfo.currencies.filter(
      (cur) => cur.coinMinimalDenom !== chainInfo.stakeCurrency.coinMinimalDenom
    );

    const result = [];

    for (let i = 0; i < currencies.length; i++) {
      const currency = currencies[i];
      result.push(this.getBalanceInner(currency));
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
        (bal) => bal.currency.coinMinimalDenom === currency.coinMinimalDenom
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
  private refreshInterval: NodeJS.Timer | null = null;

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super((bech32Address: string) => {
      return new ObservableQueryBalancesImplMap(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        this.balanceRegistries,
        bech32Address
      );
    });

    this.startAutoRefresh();
  }

  startAutoRefresh() {
    this.stopAutoRefresh();

    this.refreshInterval = setInterval(() => {
      this.fetchAll();
    }, 60000);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  fetchAll() {
    this.map.forEach((balances) => {
      console.log(balances);
      balances.fetch();
    });
  }

  addBalanceRegistry(registry: BalanceRegistry) {
    this.balanceRegistries.push(registry);
  }

  getQueryBech32Address(bech32Address: string): ObservableQueryBalancesImplMap {
    return this.get(bech32Address) as ObservableQueryBalancesImplMap;
  }
}
