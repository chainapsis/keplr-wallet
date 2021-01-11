import { KVStore } from "../../../../common/kvstore";
import { observable, runInAction } from "mobx";
import { actionAsync, computedFn, task } from "mobx-utils";
import { HasMapStore } from "../common/map";
import { Channel, ChannelWithChainId } from "./types";
import { ChainUpdaterKeeper } from "../../../../background/updater/keeper";

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

    this.loadChannels();
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

  @actionAsync
  async addChannel(channel: Channel) {
    const channels = this.getChannelsToPort(channel.portId);
    this.channelMap.set(channel.portId, channels.concat(channel));

    await task(this.saveChannels());
  }

  @actionAsync
  protected async loadChannels() {
    const obj = await task(
      this.kvStore.get<{
        [portId: string]: Channel[];
      }>(
        `${
          ChainUpdaterKeeper.getChainVersion(this.chainId).identifier
        }-channels`
      )
    );

    if (obj) {
      for (const portId of Object.keys(obj)) {
        this.channelMap.set(portId, obj[portId]);
      }
    }
  }

  async saveChannels() {
    const obj: {
      [portId: string]: Channel[];
    } = {};
    this.channelMap.forEach((v, k) => {
      obj[k] = v;
    });

    await this.kvStore.set(
      `${ChainUpdaterKeeper.getChainVersion(this.chainId).identifier}-channels`,
      obj
    );
  }
}

export class IBCStore extends HasMapStore<IBCStoreInner> {
  constructor(protected readonly kvStore: KVStore) {
    super((chainId: string) => {
      return new IBCStoreInner(kvStore, chainId);
    });
  }

  get(chainId: string): IBCStoreInner {
    return super.get(chainId);
  }

  async addChannels(...channels: ChannelWithChainId[]) {
    for (const channel of channels) {
      await this.get(channel.chainId).addChannel(channel);
    }
  }
}
