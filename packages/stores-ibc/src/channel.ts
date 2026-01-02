import { KVStore, PrefixKVStore } from "@keplr-wallet/common";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { Channel } from "./types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { IChainStore } from "@keplr-wallet/stores";

/**
 * IBCChannelStore saves the IBC channel infomations to the storage.
 */
export class IBCChannelStore {
  // Key: chainIdentifier, second key: ${portId}/${channelId}
  @observable
  protected channelMap: Map<string, Map<string, Channel>> = new Map();

  @observable
  public isInitialized = false;

  protected readonly legacyKVStore: KVStore;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainStore: IChainStore & {
      waitUntilInitialized?: () => Promise<void>;
    }
  ) {
    this.legacyKVStore = kvStore;
    this.kvStore = new PrefixKVStore(kvStore, "v2");

    makeObservable(this);

    this.init();
  }

  async init(): Promise<void> {
    if (this.chainStore.waitUntilInitialized) {
      await this.chainStore.waitUntilInitialized();
    }

    const migrate = await this.kvStore.get<boolean>("migrate/v1");
    if (!migrate) {
      const migrationData = new Map<string, Map<string, Channel>>();

      for (const chainInfo of this.chainStore.modularChainInfos) {
        const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId);
        const legacyKey = `${chainIdentifier.identifier}-channels`;
        const legacyObj = await this.legacyKVStore.get<
          Record<string, Record<string, Channel | undefined> | undefined>
        >(legacyKey);
        if (legacyObj) {
          for (const portId of Object.keys(legacyObj)) {
            const map = legacyObj[portId];
            if (map) {
              for (const channelId of Object.keys(map)) {
                if (!migrationData.has(chainIdentifier.identifier)) {
                  migrationData.set(chainIdentifier.identifier, new Map());
                }

                const innerMap = migrationData.get(chainIdentifier.identifier)!;
                const channel = map[channelId];
                if (channel) {
                  innerMap.set(
                    `${channel.portId}/${channel.channelId}`,
                    channel
                  );
                }
              }
            }
          }
        }
      }

      runInAction(() => {
        this.channelMap = migrationData;
      });

      await this.kvStore.set<boolean>("migrate/v1", true);
    }

    const saved = await this.kvStore.get<
      Record<string, Record<string, Channel | undefined> | undefined>
    >("channelMap");
    if (saved) {
      runInAction(() => {
        for (const [chainIdentifier, inner] of Object.entries(saved)) {
          const map = new Map<string, Channel>();
          if (inner) {
            for (const [key, channel] of Object.entries(inner)) {
              if (channel) {
                map.set(key, channel);
              }
            }
          }
          this.channelMap.set(chainIdentifier, map);
        }
      });
    }

    autorun(() => {
      const data: Record<
        string,
        Record<string, Channel | undefined> | undefined
      > = {};
      for (const [chainIdentifier, inner] of this.channelMap.entries()) {
        const map: Record<string, Channel | undefined> = {};
        for (const [key, channel] of inner.entries()) {
          map[key] = channel;
        }
        data[chainIdentifier] = map;
      }
      this.kvStore.set("channelMap", data);
    });

    autorun(() => {
      // Clear the channel map if the chain is removed.
      const savedChainIdentifiers = new Set<string>(Object.keys(saved ?? {}));
      const removingChainIdentifiers: string[] = [];
      for (const savedChainIdentifier of savedChainIdentifiers) {
        if (
          !this.chainStore.hasModularChain(savedChainIdentifier) ||
          !this.chainStore
            .getModularChainInfoImpl(savedChainIdentifier)
            .matchModule("cosmos")
        ) {
          removingChainIdentifiers.push(savedChainIdentifier);
        }
      }
      if (removingChainIdentifiers.length > 0) {
        runInAction(() => {
          for (const removingChainIdentifier of removingChainIdentifiers) {
            this.channelMap.delete(removingChainIdentifier);
          }
        });
      }
    });

    runInAction(() => {
      this.isInitialized = true;
    });
  }

  getTransferChannels(chainId: string): Channel[] {
    return this.getChannels(chainId, "transfer");
  }

  readonly getChannels = computedFn(
    (chainId: string, portId: string): Channel[] => {
      const inner = this.channelMap.get(
        ChainIdHelper.parse(chainId).identifier
      );
      if (!inner) {
        return [];
      }
      const res = [];
      for (const [key, channel] of inner.entries()) {
        if (key.startsWith(`${portId}/`)) {
          res.push(channel);
        }
      }
      return res;
    }
  );

  readonly getChannel = computedFn(
    (
      chainId: string,
      portId: string,
      channelId: string
    ): Channel | undefined => {
      const inner = this.channelMap.get(
        ChainIdHelper.parse(chainId).identifier
      );
      if (!inner) {
        return undefined;
      }
      return inner.get(`${portId}/${channelId}`);
    }
  );

  @action
  addChannel(chainId: string, channel: Channel) {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    if (!this.channelMap.has(chainIdentifier)) {
      this.channelMap.set(chainIdentifier, new Map());
    }
    const inner = this.channelMap.get(chainIdentifier)!;
    inner.set(`${channel.portId}/${channel.channelId}`, channel);
  }
}
