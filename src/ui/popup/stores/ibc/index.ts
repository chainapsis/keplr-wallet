import { KVStore } from "../../../../common/kvstore";
import { autorun, observable, runInAction } from "mobx";
import { actionAsync, computedFn, task } from "mobx-utils";
import { HasMapStore } from "../common/map";
import { Channel, ChannelWithChainId } from "./types";
import { ChainUpdaterKeeper } from "../../../../background/updater/keeper";
import { Currency } from "../../../../common/currency";
import { ChainGetter, QueriesStore } from "../query";
import { QueryResponse } from "../query/base";
import { DenomTractResponse } from "../query/denom-trace";

export class IBCStoreInner {
  // channelMap[portId]
  @observable.shallow
  protected channelMap!: Map<string, Map<string, Channel>>;

  @observable
  protected loaded!: boolean;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string
  ) {
    runInAction(() => {
      this.channelMap = new Map();
      this.loaded = false;
    });

    this.loadChannels();
  }

  async waitLoad() {
    if (this.loaded) return;

    return new Promise<void>(resolve => {
      const disposer = autorun(() => {
        if (this.loaded) {
          disposer();
          resolve();
        }
      });
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
          observable.map(
            {},
            {
              deep: false
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

  @actionAsync
  async addChannel(channel: Channel) {
    if (!this.channelMap.has(channel.portId)) {
      this.channelMap.set(
        channel.portId,
        observable.map(
          {},
          {
            deep: false
          }
        )
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.channelMap.get(channel.portId)!.set(channel.channelId, channel);

    await task(this.saveChannels());
  }

  @actionAsync
  protected async loadChannels() {
    const obj = await task(
      this.kvStore.get<{
        [portId: string]: { [channelId: string]: Channel };
      }>(
        `${
          ChainUpdaterKeeper.getChainVersion(this.chainId).identifier
        }-channels`
      )
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

    this.loaded = true;
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
      `${ChainUpdaterKeeper.getChainVersion(this.chainId).identifier}-channels`,
      obj
    );
  }
}

export class IBCStore extends HasMapStore<IBCStoreInner> {
  @observable
  ibcAssetsPerChain!: Map<string, Currency[]>;

  protected querier!: QueriesStore;
  protected chainGetter!: ChainGetter;

  constructor(protected readonly kvStore: KVStore) {
    super((chainId: string) => {
      return new IBCStoreInner(kvStore, chainId);
    });

    runInAction(() => {
      this.ibcAssetsPerChain = new Map();
    });
  }

  init(querier: QueriesStore, chainGetter: ChainGetter) {
    this.querier = querier;
    this.chainGetter = chainGetter;
  }

  get(chainId: string): IBCStoreInner {
    return super.get(chainId);
  }

  async addChannels(...channels: ChannelWithChainId[]) {
    for (const channel of channels) {
      await this.get(channel.chainId).addChannel(channel);
    }
  }

  async setAssets(
    chainId: string,
    assetPrimitives: { denom: string; amount: string }[]
  ) {
    const ibcCurrencies: Currency[] = [];

    for (const asset of assetPrimitives) {
      if (asset.denom.startsWith("ibc/")) {
        const hash = asset.denom.replace("ibc/", "");
        const queryDenomTrace = this.querier
          .get(chainId)
          .getQueryDenomTrace()
          .getDenomTrace(hash);

        const denomTrace = await (() => {
          return new Promise<QueryResponse<DenomTractResponse>>(resolve => {
            const disposer = autorun(() => {
              if (!queryDenomTrace.isFetching) {
                resolve(queryDenomTrace.response);
                disposer();
              }
            });
          });
        })();

        if (denomTrace && denomTrace.data) {
          const path = denomTrace.data.denom_trace.path;
          const sourcePort = path.split("/")[0];
          const sourceChannel = path.split("/")[1];

          const channelStore = this.get(chainId);
          await channelStore.waitLoad();

          const channel = channelStore.getChannel(sourcePort, sourceChannel);

          if (channel) {
            const chainInfo = this.chainGetter.getChain(
              channel.counterpartyChainId
            );

            const baseCurrency = chainInfo.currencies.find(
              cur =>
                cur.coinMinimalDenom === denomTrace.data.denom_trace.base_denom
            );
            if (baseCurrency) {
              ibcCurrencies.push({
                coinDenom: `${baseCurrency.coinDenom} (${channel.channelId})`,
                coinMinimalDenom: asset.denom,
                coinDecimals: baseCurrency.coinDecimals
              });
            }
          }
        }
      }
    }

    runInAction(() => {
      this.ibcAssetsPerChain.set(chainId, ibcCurrencies);
    });
  }
}
