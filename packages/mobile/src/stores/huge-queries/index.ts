import {ChainStore} from '../chain';
import {
  CoinGeckoPriceStore,
  CosmosQueries,
  IAccountStore,
  IChainInfoImpl,
  IQueriesStore,
  QueryError,
} from '@keplr-wallet/stores';
import {CoinPretty, Dec, PricePretty} from '@keplr-wallet/unit';
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  onBecomeObserved,
  onBecomeUnobserved,
} from 'mobx';
import {DenomHelper} from '@keplr-wallet/common';
import {computedFn} from 'mobx-utils';

interface ViewToken {
  readonly chainInfo: IChainInfoImpl;
  readonly token: CoinPretty;
  readonly price: PricePretty | undefined;
  readonly isFetching: boolean;
  readonly error: QueryError<any> | undefined;
}

/**
 * 거대한 쿼리를 만든다.
 * 거대하기 때문에 로직을 분리하기 위해서 따로 만들었다.
 * 근데 이름그대로 거대한 쿼리를 만들기 때문에 꼭 필요할때만 써야한다.
 * 특정 밸런스가 필요하다고 여기서 balance를 다 가져와서 그 중에 한개만 찾아서 쓰고 그러면 안된다.
 * 꼭 필요할때만 쓰자
 */
export class HugeQueriesStore {
  protected static zeroDec = new Dec(0);

  protected balanceBinarySort: BinarySortArray<ViewToken>;
  protected delegationBinarySort: BinarySortArray<ViewToken>;
  protected unbondingBinarySort: BinarySortArray<{
    viewToken: ViewToken;
    completeTime: string;
  }>;

  constructor(
    protected readonly chainStore: ChainStore,
    protected readonly queriesStore: IQueriesStore<CosmosQueries>,
    protected readonly accountStore: IAccountStore,
    protected readonly priceStore: CoinGeckoPriceStore,
  ) {
    let balanceDisposal: (() => void) | undefined;
    this.balanceBinarySort = new BinarySortArray<ViewToken>(
      this.sortByPrice,
      () => {
        balanceDisposal = autorun(() => {
          this.updateBalances();
        });
      },
      () => {
        if (balanceDisposal) {
          balanceDisposal();
        }
      },
    );
    let delegationDisposal: (() => void) | undefined;
    this.delegationBinarySort = new BinarySortArray<ViewToken>(
      this.sortByPrice,
      () => {
        delegationDisposal = autorun(() => {
          this.updateDelegations();
        });
      },
      () => {
        if (delegationDisposal) {
          delegationDisposal();
        }
      },
    );
    let unbondingDisposal: (() => void) | undefined;
    this.unbondingBinarySort = new BinarySortArray<{
      viewToken: ViewToken;
      completeTime: string;
    }>(
      (a, b) => {
        return this.sortByPrice(a.viewToken, b.viewToken);
      },
      () => {
        unbondingDisposal = autorun(() => {
          this.updateUnbondings();
        });
      },
      () => {
        if (unbondingDisposal) {
          unbondingDisposal();
        }
      },
    );
  }

  @action
  protected updateBalances() {
    const keysUsed = new Map<string, boolean>();
    const prevKeyMap = new Map(this.balanceBinarySort.indexForKeyMap());

    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);

      if (account.bech32Address === '') {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryBalance = queries.queryBalances.getQueryBech32Address(
        account.bech32Address,
      );

      const currencies = [...chainInfo.currencies];
      if (chainInfo.stakeCurrency) {
        currencies.push(chainInfo.stakeCurrency);
      }
      for (const currency of currencies) {
        const key = `${chainInfo.chainIdentifier}/${currency.coinMinimalDenom}`;
        if (!keysUsed.get(key)) {
          if (
            chainInfo.stakeCurrency?.coinMinimalDenom ===
            currency.coinMinimalDenom
          ) {
            const balance = queryBalance.stakable?.balance;
            if (!balance) {
              continue;
            }
            // If the balance is zero, don't show it.
            // 다시 제로 일때 보여주기 위해서 아래코드를 주석처리함
            // if (balance.toDec().equals(HugeQueriesStore.zeroDec)) {
            //   continue;
            // }

            keysUsed.set(key, true);
            prevKeyMap.delete(key);
            this.balanceBinarySort.pushAndSort(key, {
              chainInfo,
              token: balance,
              price: currency.coinGeckoId
                ? this.priceStore.calculatePrice(balance)
                : undefined,
              isFetching: queryBalance.stakable.isFetching,
              error: queryBalance.stakable.error,
            });
          } else {
            const balance = queryBalance.getBalance(currency);
            if (balance) {
              // If the balance is zero and currency is "native", don't show it.
              if (
                balance.balance.toDec().equals(HugeQueriesStore.zeroDec) &&
                new DenomHelper(currency.coinMinimalDenom).type === 'native'
              ) {
                continue;
              }

              keysUsed.set(key, true);
              prevKeyMap.delete(key);
              this.balanceBinarySort.pushAndSort(key, {
                chainInfo,
                token: balance.balance,
                price: currency.coinGeckoId
                  ? this.priceStore.calculatePrice(balance.balance)
                  : undefined,
                isFetching: balance.isFetching,
                error: balance.error,
              });
            }
          }
        }
      }
    }

    for (const removedKey of prevKeyMap.keys()) {
      this.balanceBinarySort.remove(removedKey);
    }
  }

  @computed
  get allKnownBalances(): ReadonlyArray<ViewToken> {
    return this.balanceBinarySort.arr;
  }

  getAllBalances = computedFn(
    (allowIBCToken: boolean): ReadonlyArray<ViewToken> => {
      const keys: Map<string, boolean> = new Map();
      for (const chainInfo of this.chainStore.chainInfosInUI) {
        for (const currency of chainInfo.currencies) {
          const denomHelper = new DenomHelper(currency.coinMinimalDenom);
          if (
            !allowIBCToken &&
            denomHelper.type === 'native' &&
            denomHelper.denom.startsWith('ibc/')
          ) {
            continue;
          }

          const key = `${chainInfo.chainIdentifier}/${currency.coinMinimalDenom}`;
          keys.set(key, true);
        }
      }
      return this.balanceBinarySort.arr.filter(viewToken => {
        const key = viewToken[BinarySortArray.SymbolKey];
        return keys.get(key);
      });
    },
  );

  filterLowBalanceTokens = computedFn(
    (viewTokens: ReadonlyArray<ViewToken>): ViewToken[] => {
      return viewTokens.filter(viewToken => {
        // Hide the unknown ibc tokens.
        if (
          'paths' in viewToken.token.currency &&
          !viewToken.token.currency.originCurrency
        ) {
          return false;
        }

        // If currency has coinGeckoId, hide the low price tokens (under $1)
        if (viewToken.token.currency.coinGeckoId != null) {
          return (
            this.priceStore
              .calculatePrice(viewToken.token, 'usd')
              ?.toDec()
              .gte(new Dec('1')) ?? false
          );
        }

        // Else, hide the low balance tokens (under 0.001)
        return viewToken.token.toDec().gte(new Dec('0.001'));
      });
    },
  );

  @computed
  get stakables(): ViewToken[] {
    const keys: Map<string, boolean> = new Map();
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      if (!chainInfo.stakeCurrency) {
        continue;
      }
      const key = `${chainInfo.chainIdentifier}/${chainInfo.stakeCurrency.coinMinimalDenom}`;
      keys.set(key, true);
    }
    return this.balanceBinarySort.arr.filter(viewToken => {
      const key = viewToken[BinarySortArray.SymbolKey];
      return keys.get(key);
    });
  }

  @computed
  get notStakbles(): ViewToken[] {
    const keys: Map<string, boolean> = new Map();
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      for (const currency of chainInfo.currencies) {
        if (
          currency.coinMinimalDenom ===
          chainInfo.stakeCurrency?.coinMinimalDenom
        ) {
          continue;
        }
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        if (
          denomHelper.type === 'native' &&
          denomHelper.denom.startsWith('ibc/')
        ) {
          continue;
        }

        const key = `${chainInfo.chainIdentifier}/${currency.coinMinimalDenom}`;
        keys.set(key, true);
      }
    }
    return this.balanceBinarySort.arr.filter(viewToken => {
      const key = viewToken[BinarySortArray.SymbolKey];
      return keys.get(key);
    });
  }

  @computed
  get ibcTokens(): ViewToken[] {
    const keys: Map<string, boolean> = new Map();
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      for (const currency of chainInfo.currencies) {
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        if (
          denomHelper.type === 'native' &&
          denomHelper.denom.startsWith('ibc/')
        ) {
          const key = `${chainInfo.chainIdentifier}/${currency.coinMinimalDenom}`;
          keys.set(key, true);
        }
      }
    }
    return this.balanceBinarySort.arr.filter(viewToken => {
      const key = viewToken[BinarySortArray.SymbolKey];
      return keys.get(key);
    });
  }

  @action
  protected updateDelegations(): void {
    const prevKeyMap = new Map(this.delegationBinarySort.indexForKeyMap());

    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      if (account.bech32Address === '') {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryDelegation =
        queries.cosmos.queryDelegations.getQueryBech32Address(
          account.bech32Address,
        );
      if (!queryDelegation.total) {
        continue;
      }

      const key = `${chainInfo.chainId}/${account.bech32Address}`;
      prevKeyMap.delete(key);
      this.delegationBinarySort.pushAndSort(key, {
        chainInfo,
        token: queryDelegation.total,
        price: this.priceStore.calculatePrice(queryDelegation.total),
        isFetching: queryDelegation.isFetching,
        error: queryDelegation.error,
      });
    }

    for (const removedKey of prevKeyMap.keys()) {
      this.delegationBinarySort.remove(removedKey);
    }
  }

  @computed
  get delegations(): ReadonlyArray<ViewToken> {
    return this.delegationBinarySort.arr;
  }

  @action
  protected updateUnbondings(): void {
    const prevKeyMap = new Map(this.unbondingBinarySort.indexForKeyMap());

    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      if (account.bech32Address === '') {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryUnbonding =
        queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
          account.bech32Address,
        );

      for (let i = 0; i < queryUnbonding.unbondings.length; i++) {
        const unbonding = queryUnbonding.unbondings[i];
        for (const entry of unbonding.entries) {
          if (!chainInfo.stakeCurrency) {
            continue;
          }
          const balance = new CoinPretty(
            chainInfo.stakeCurrency,
            entry.balance,
          );

          const key = `${chainInfo.chainId}/${account.bech32Address}/${i}`;
          prevKeyMap.delete(key);
          this.unbondingBinarySort.pushAndSort(key, {
            viewToken: {
              chainInfo,
              token: balance,
              price: this.priceStore.calculatePrice(balance),
              isFetching: queryUnbonding.isFetching,
              error: queryUnbonding.error,
            },
            completeTime: entry.completion_time,
          });
        }
      }
    }

    for (const removedKey of prevKeyMap.keys()) {
      this.unbondingBinarySort.remove(removedKey);
    }
  }

  @computed
  get unbondings(): ReadonlyArray<{
    viewToken: ViewToken;
    completeTime: string;
  }> {
    return this.unbondingBinarySort.arr;
  }

  protected sortByPrice(a: ViewToken, b: ViewToken): number {
    const aPrice = a.price?.toDec() ?? HugeQueriesStore.zeroDec;
    const bPrice = b.price?.toDec() ?? HugeQueriesStore.zeroDec;

    if (aPrice.equals(bPrice)) {
      return 0;
    } else if (aPrice.gt(bPrice)) {
      return -1;
    } else {
      return 1;
    }
  }
}

class BinarySortArray<T> {
  static readonly SymbolKey = Symbol('__key');

  @observable.ref
  protected _arr: (T & {
    [BinarySortArray.SymbolKey]: string;
  })[] = [];
  protected readonly indexForKey = new Map<string, number>();
  protected readonly compareFn: (a: T, b: T) => number;

  constructor(
    compareFn: (a: T, b: T) => number,
    onObserved: () => void,
    onUnobserved: () => void,
  ) {
    this.compareFn = compareFn;

    makeObservable(this);

    let i = 0;
    onBecomeObserved(this, '_arr', () => {
      i++;
      if (i === 1) {
        onObserved();
      }
    });
    onBecomeUnobserved(this, '_arr', () => {
      i--;
      if (i === 0) {
        onUnobserved();
      }
    });
  }

  @action
  pushAndSort(key: string, value: T): boolean {
    const prevIndex = this.indexForKey.get(key);

    const v = {
      ...value,
      [BinarySortArray.SymbolKey]: key,
    };

    if (this._arr.length === 0) {
      this._arr.push(v);
      this.indexForKey.set(key, 0);
      // Update reference
      this._arr = this._arr.slice();
      return false;
    }

    if (prevIndex != null && prevIndex >= 0) {
      // 이미 존재했을때
      // 위치를 수정할 필요가 없으면 값만 바꾼다.
      let b = false;
      if (prevIndex > 0) {
        const prev = this._arr[prevIndex - 1];
        b = this.compareFn(prev, value) <= 0;
      }
      if (b || prevIndex === 0) {
        if (prevIndex < this._arr.length - 1) {
          const next = this._arr[prevIndex + 1];
          b = this.compareFn(value, next) <= 0;
        }
      }

      if (b) {
        this._arr[prevIndex] = v;
        // Update reference
        this._arr = this._arr.slice();
        return true;
      }
    }

    // Do binary insertion sort
    let left = 0;
    let right = this._arr.length - 1;
    let mid = 0;
    while (left <= right) {
      mid = Math.floor((left + right) / 2);
      const el = this._arr[mid];
      const compareRes = this.compareFn(el, value);
      if (compareRes === 0) {
        if (prevIndex != null && prevIndex >= 0) {
          const elKey = el[BinarySortArray.SymbolKey];
          const elIndex = this.indexForKey.get(elKey)!;
          const compareIndexRes = prevIndex - elIndex;
          if (compareIndexRes < 0) {
            left = mid + 1;
          } else if (compareIndexRes > 0) {
            right = mid - 1;
          } else {
            // Can't be happened
            break;
          }
        } else {
          left = mid + 1;
        }
      } else if (compareRes < 0) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    if (right < 0) {
      mid = Math.floor((left + right) / 2);
    } else {
      mid = Math.ceil((left + right) / 2);
    }
    if (mid < 0) {
      for (let i = 0; i < this._arr.length; i++) {
        if (prevIndex != null && prevIndex <= i) {
          break;
        }
        this.indexForKey.set(this._arr[i][BinarySortArray.SymbolKey], i + 1);
      }
      if (prevIndex != null && prevIndex >= 0) {
        this._arr.splice(prevIndex, 1);
      }
      this._arr.unshift(v);
      // Update reference
      this._arr = this._arr.slice();
      this.indexForKey.set(key, 0);
    } else if (mid >= this._arr.length) {
      if (prevIndex != null) {
        for (let i = prevIndex + 1; i < this._arr.length; i++) {
          this.indexForKey.set(this._arr[i][BinarySortArray.SymbolKey], i - 1);
        }
      }
      if (prevIndex != null && prevIndex >= 0) {
        this._arr.splice(prevIndex, 1);
      }
      this._arr.push(v);
      // Update reference
      this._arr = this._arr.slice();
      this.indexForKey.set(key, this._arr.length - 1);
    } else {
      if (prevIndex != null && prevIndex >= 0) {
        if (prevIndex < mid) {
          for (let i = prevIndex + 1; i <= mid; i++) {
            this.indexForKey.set(
              this._arr[i][BinarySortArray.SymbolKey],
              i - 1,
            );
          }
        } else {
          for (let i = mid; i < prevIndex; i++) {
            this.indexForKey.set(
              this._arr[i][BinarySortArray.SymbolKey],
              i + 1,
            );
          }
        }
      } else {
        for (let i = mid; i < this._arr.length; i++) {
          this.indexForKey.set(this._arr[i][BinarySortArray.SymbolKey], i + 1);
        }
      }
      if (prevIndex != null && prevIndex >= 0) {
        if (prevIndex < mid) {
          this._arr.splice(mid, 0, v);
          this._arr.splice(prevIndex, 1);
        } else if (prevIndex > mid) {
          this._arr.splice(prevIndex, 1);
          this._arr.splice(mid, 0, v);
        } else {
          this._arr[prevIndex] = v;
        }
      } else {
        this._arr.splice(mid, 0, v);
      }
      // Update reference
      this._arr = this._arr.slice();
      this.indexForKey.set(key, mid);
    }

    // 이미 존재했으면(sort이면) true, 새롭게 추가되었으면(pushAndSort이면) false
    return prevIndex != null && prevIndex >= 0;
  }

  @action
  remove(key: string) {
    const index = this.indexForKey.get(key);
    if (index != null && index >= 0) {
      this.indexForKey.delete(key);
      for (let i = index + 1; i < this._arr.length; i++) {
        this.indexForKey.set(this._arr[i][BinarySortArray.SymbolKey], i - 1);
      }
      this._arr.splice(index, 1);
    }
  }

  indexForKeyMap(): ReadonlyMap<string, number> {
    return this.indexForKey;
  }

  get arr(): ReadonlyArray<
    T & {
      [BinarySortArray.SymbolKey]: string;
    }
  > {
    return this._arr;
  }
}
