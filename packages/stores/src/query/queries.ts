import { makeObservable, observable, runInAction } from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly, UnionToIntersection } from "utility-types";
import { ObservableQueryBalances } from "./balances";
import {
  ChainGetter,
  IObject,
  mergeStores,
  ChainedFunctionifyTuple,
} from "../common";

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

// eslint-disable-next-line @typescript-eslint/ban-types
export interface IQueriesStore<T extends IObject = {}> {
  get(chainId: string): DeepReadonly<QueriesSetBase & T>;
}

export class QueriesStore<Injects extends Array<IObject>> {
  @observable.shallow
  protected queriesMap: Map<
    string,
    QueriesSetBase & UnionToIntersection<Injects[number]>
  > = new Map();

  protected readonly queriesCreators: ChainedFunctionifyTuple<
    QueriesSetBase,
    // kvStore: KVStore,
    // chainId: string,
    // chainGetter: ChainGetter
    [KVStore, string, ChainGetter],
    Injects
  >;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainGetter: ChainGetter,
    ...queriesCreators: ChainedFunctionifyTuple<
      QueriesSetBase,
      // kvStore: KVStore,
      // chainId: string,
      // chainGetter: ChainGetter
      [KVStore, string, ChainGetter],
      Injects
    >
  ) {
    this.queriesCreators = queriesCreators;

    makeObservable(this);
  }

  get(
    chainId: string
  ): DeepReadonly<QueriesSetBase & UnionToIntersection<Injects[number]>> {
    if (!this.queriesMap.has(chainId)) {
      const queriesSetBase = createQueriesSetBase(
        this.kvStore,
        chainId,
        this.chainGetter
      );
      runInAction(() => {
        const merged = mergeStores(
          queriesSetBase,
          [this.kvStore, chainId, this.chainGetter],
          ...this.queriesCreators
        );

        this.queriesMap.set(chainId, merged);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queriesMap.get(chainId)! as DeepReadonly<
      QueriesSetBase & UnionToIntersection<Injects[number]>
    >;
  }
}
