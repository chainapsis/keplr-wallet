import { makeObservable, observable, runInAction } from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryBalances } from "./balances";
import { ChainGetter } from "../common";
import { Keplr } from "@keplr-wallet/types";

export class QueriesSetBase {
  public readonly queryBalances: DeepReadonly<ObservableQueryBalances>;

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    this.queryBalances = new ObservableQueryBalances(
      kvStore,
      chainId,
      chainGetter
    );
  }
}

export class QueriesStore<QueriesSet extends QueriesSetBase> {
  @observable.shallow
  protected queriesMap: Map<string, QueriesSet> = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainGetter: ChainGetter,
    protected readonly apiGetter: () => Promise<Keplr | undefined>,
    protected readonly queriesCreator: new (
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter,
      apiGetter: () => Promise<Keplr | undefined>
    ) => QueriesSet
  ) {
    makeObservable(this);
  }

  get(chainId: string): DeepReadonly<QueriesSet> {
    if (!this.queriesMap.has(chainId)) {
      const queries = new this.queriesCreator(
        this.kvStore,
        chainId,
        this.chainGetter,
        this.apiGetter
      );
      runInAction(() => {
        this.queriesMap.set(chainId, queries);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queriesMap.get(chainId)! as DeepReadonly<QueriesSet>;
  }
}
