import { KVStore } from "../../../../common/kvstore";
import { observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { HasMapStore } from "../common/map";
import { Channel } from "./types";

export class IBCStoreInner {
  // channelMap[portId]
  @observable.shallow
  protected channelMap!: Map<string, Channel[]>;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string
  ) {
    runInAction(() => {
      this.channelMap = new Map();
    });
  }

  getTransferChannels(): Channel[] {
    return this.getChannelsToPort("transfer");
  }

  readonly getChannelsToPort = computedFn((portId: string) => {
    if (!this.channelMap.has(portId)) {
      runInAction(() => {
        this.channelMap.set(
          portId,
          observable.array([], {
            deep: false
          })
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.channelMap.get(portId)!;
  });
}

export class IBCStore extends HasMapStore<IBCStoreInner> {
  constructor(protected readonly kvStore: KVStore) {
    super((chainId: string) => {
      return new IBCStoreInner(kvStore, chainId);
    });
  }

  protected get(chainId: string): IBCStoreInner {
    return super.get(chainId);
  }
}
