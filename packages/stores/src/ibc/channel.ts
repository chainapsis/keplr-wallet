import { KVStore, toGenerator } from "@keplr-wallet/common";
import { flow, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { Channel } from "./types";
import { HasMapStore } from "../common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class IBCChannelStoreInner {
  // channelMap[portId][channelId]
  @observable.shallow
  protected channelMap: Map<string, Map<string, Channel>> = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string
  ) {
    makeObservable(this);

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
          observable.map(
            {},
            {
              deep: false,
            }
          )
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const channelMapOfPort = this.channelMap.get(portId)!;

    const channels: Channel[] = [];
    for (const channel of channelMapOfPort.values()) {
      channels.push(channel);
    }

    return channels;
  });

  readonly getChannel = computedFn((portId: string, channelId: string) => {
    return this.channelMap.get(portId)?.get(channelId);
  });

  @flow
  *addChannel(channel: Channel) {
    if (!this.channelMap.has(channel.portId)) {
      this.channelMap.set(
        channel.portId,
        observable.map(
          {},
          {
            deep: false,
          }
        )
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.channelMap.get(channel.portId)!.set(channel.channelId, channel);

    yield this.saveChannels();
  }

  @flow
  protected *loadChannels() {
    const obj = yield* toGenerator(
      this.kvStore.get<{
        [portId: string]: { [channelId: string]: Channel };
      }>(`${ChainIdHelper.parse(this.chainId).identifier}-channels`)
    );

    if (obj) {
      for (const portId of Object.keys(obj)) {
        const map = obj[portId];
        for (const channelId of Object.keys(map)) {
          if (!this.channelMap.has(portId)) {
            this.channelMap.set(portId, observable.map({}, { deep: false }));
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const innerMap = this.channelMap.get(portId)!;
          innerMap.set(channelId, map[channelId]);
        }
      }
    }
  }

  async saveChannels() {
    const obj: {
      [portId: string]: { [channelId: string]: Channel };
    } = {};
    this.channelMap.forEach((v, portId) => {
      obj[portId] = (() => {
        const obj: { [channelId: string]: Channel } = {};
        v.forEach((channel, channelId) => {
          obj[channelId] = channel;
        });
        return obj;
      })();
    });

    await this.kvStore.set(
      `${ChainIdHelper.parse(this.chainId).identifier}-channels`,
      obj
    );
  }
}

/**
 * IBCChannelStore saves the IBC channel infomations to the storage.
 */
export class IBCChannelStore extends HasMapStore<IBCChannelStoreInner> {
  constructor(protected readonly kvStore: KVStore) {
    super((chainId: string) => {
      return new IBCChannelStoreInner(kvStore, chainId);
    });
  }

  get(chainId: string): IBCChannelStoreInner {
    return super.get(chainId);
  }
}
