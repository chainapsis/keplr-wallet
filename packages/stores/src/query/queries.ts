import { makeObservable, observable, runInAction } from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly, UnionToIntersection } from "utility-types";
import { ObservableQueryBalances } from "./balances";
import { ChainGetter, IObject, mergeStores, TupleFunctionify } from "../common";

export interface QueriesSetBase {
  readonly queryBalances: DeepReadonly<ObservableQueryBalances>;
}

export const createQueriesSetBase = (
  kvStore: KVStore,
  chainId: string,
  chainGetter: ChainGetter
): QueriesSetBase => {
  return {
    queryBalances: new ObservableQueryBalances(kvStore, chainId, chainGetter),
  };
};

export class QueriesStore<T extends Array<IObject>> {
  @observable.shallow
  protected queriesMap: Map<
    string,
    QueriesSetBase & UnionToIntersection<T[number]>
  > = new Map();

  protected readonly queriesCreators: TupleFunctionify<
    // queriesSetBase: QueriesSetBase,
    // kvStore: KVStore,
    // chainId: string,
    // chainGetter: ChainGetter
    [QueriesSetBase, KVStore, string, ChainGetter],
    T
  >;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainGetter: ChainGetter,
    ...queriesCreators: TupleFunctionify<
      // queriesSetBase: QueriesSetBase,
      // kvStore: KVStore,
      // chainId: string,
      // chainGetter: ChainGetter
      [QueriesSetBase, KVStore, string, ChainGetter],
      T
    >
  ) {
    this.queriesCreators = queriesCreators;

    makeObservable(this);
  }

  get(
    chainId: string
  ): DeepReadonly<QueriesSetBase & UnionToIntersection<T[number]>> {
    if (!this.queriesMap.has(chainId)) {
      const queriesSetBase = createQueriesSetBase(
        this.kvStore,
        chainId,
        this.chainGetter
      );
      runInAction(() => {
        const merged = mergeStores<
          [QueriesSetBase, KVStore, string, ChainGetter],
          T
        >(
          [queriesSetBase, this.kvStore, chainId, this.chainGetter],
          ...this.queriesCreators
        );

        this.queriesMap.set(chainId, Object.assign(queriesSetBase, merged));
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queriesMap.get(chainId)! as DeepReadonly<
      QueriesSetBase & UnionToIntersection<T[number]>
    >;
  }
}
