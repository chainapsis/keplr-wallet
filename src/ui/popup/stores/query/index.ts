import { observable, runInAction } from "mobx";
import { KVStore } from "../../../../common/kvstore";
import { DeepReadonly } from "utility-types";
import { ChainInfo } from "../../../../background/chains";
import { ObservableQueryIBCChannel } from "./channel";
import { ObservableQueryIBCClientState } from "./client-state";

export interface ChainGetter {
  // Return the chain info matched with chain id.
  // Expect that this method will return the chain info reactively,
  // so it is possible to detect the chain info changed without any additional effort.
  getChain(chainId: string): ChainInfo;
}

export class Queries {
  protected readonly _queryIBCChannel: ObservableQueryIBCChannel;
  protected readonly _queryIBCClientState: ObservableQueryIBCClientState;

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    this._queryIBCChannel = new ObservableQueryIBCChannel(
      kvStore,
      chainId,
      chainGetter
    );
    this._queryIBCClientState = new ObservableQueryIBCClientState(
      kvStore,
      chainId,
      chainGetter
    );
  }

  getQueryIBCChannel(): DeepReadonly<ObservableQueryIBCChannel> {
    return this._queryIBCChannel;
  }

  getQueryIBCClientState(): DeepReadonly<ObservableQueryIBCClientState> {
    return this._queryIBCClientState;
  }
}

export class QueriesStore {
  @observable.shallow
  protected queriesMap!: Map<string, Queries>;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainGetter: ChainGetter
  ) {
    runInAction(() => {
      this.queriesMap = new Map();
    });
  }

  get(chainId: string): DeepReadonly<Queries> {
    if (!this.queriesMap.has(chainId)) {
      const queries = new Queries(this.kvStore, chainId, this.chainGetter);
      runInAction(() => {
        this.queriesMap.set(chainId, queries);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queriesMap.get(chainId)!;
  }
}
