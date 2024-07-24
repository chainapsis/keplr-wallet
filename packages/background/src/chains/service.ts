import {
  KVStore,
  PrefixKVStore,
  sortedJsonByKeyStringify,
} from "@keplr-wallet/common";
import {
  ChainInfo,
  ChainInfoWithoutEndpoints,
  EVMInfo,
} from "@keplr-wallet/types";
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { computedFn } from "mobx-utils";
import {
  checkChainFeatures,
  validateBasicChainInfoType,
} from "@keplr-wallet/chain-validator";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { InteractionService } from "../interaction";
import { Env } from "@keplr-wallet/router";
import { SuggestChainInfoMsg } from "./messages";
import { ChainInfoWithCoreTypes, ChainInfoWithSuggestedOptions } from "./types";
import { AnalyticsService } from "../analytics";
import { runIfOnlyAppStart } from "../utils";

type ChainRemovedHandler = (chainInfo: ChainInfo) => void;
type ChainSuggestedHandler = (chainInfo: ChainInfo) => void | Promise<void>;
type UpdatedChainInfo = Pick<ChainInfo, "chainId" | "features">;

export class ChainsService {
  static getEVMInfo(chainInfo: ChainInfo): EVMInfo | undefined {
    return chainInfo.evm;
  }

  @observable.ref
  protected updatedChainInfos: UpdatedChainInfo[] = [];
  protected updatedChainInfoKVStore: KVStore;

  @observable.ref
  protected suggestedChainInfos: ChainInfoWithSuggestedOptions[] = [];
  protected suggestedChainInfoKVStore: KVStore;

  @observable.ref
  protected repoChainInfos: ChainInfo[] = [];
  protected repoChainInfoKVStore: KVStore;

  @observable.ref
  protected endpoints: {
    chainId: string;
    rpc?: string;
    rest?: string;
    evmRpc?: string;
  }[] = [];
  protected endpointsKVStore: KVStore;

  protected onChainRemovedHandlers: ChainRemovedHandler[] = [];
  protected onChainSuggestedHandlers: ChainSuggestedHandler[] = [];

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly migrationKVStore: {
      kvStore: KVStore;
      updaterKVStore: KVStore;
    },
    // embedChainInfos는 실행 이후에 변경되어서는 안된다.
    protected readonly embedChainInfos: ReadonlyArray<ChainInfoWithCoreTypes>,
    protected readonly communityChainInfoRepo: {
      readonly organizationName: string;
      readonly repoName: string;
      readonly branchName: string;
      readonly alternativeURL?: string;
    },
    protected readonly analyticsService: AnalyticsService,
    protected readonly interactionService: InteractionService,
    protected readonly afterInitFn:
      | ((
          service: ChainsService,
          lastEmbedChainInfos: ChainInfoWithCoreTypes[]
        ) => void | Promise<void>)
      | undefined
  ) {
    this.updatedChainInfoKVStore = new PrefixKVStore(
      kvStore,
      "updatedChainInfo"
    );
    this.suggestedChainInfoKVStore = new PrefixKVStore(
      kvStore,
      "suggestedChainInfo"
    );
    this.repoChainInfoKVStore = new PrefixKVStore(kvStore, "repoChainInfo");
    this.endpointsKVStore = new PrefixKVStore(kvStore, "endpoints");

    makeObservable(this);
  }

  async init(): Promise<void> {
    const migrated = await this.kvStore.get<boolean>("migration/v1");
    if (!migrated) {
      const legacySuggestedChainInfos = await this.migrationKVStore.kvStore.get<
        ChainInfoWithSuggestedOptions[]
      >("chain-infos");

      if (legacySuggestedChainInfos) {
        const filtered = legacySuggestedChainInfos.filter((chainInfo) => {
          return !this.embedChainInfos.some(
            (embed) =>
              ChainIdHelper.parse(embed.chainId).identifier ===
              ChainIdHelper.parse(chainInfo.chainId).identifier
          );
        });

        for (const chainInfo of filtered) {
          await this.addSuggestedChainInfo(chainInfo, true);
        }

        const chainInfos = this.embedChainInfos.concat(filtered);

        for (const chainInfo of chainInfos) {
          const chainIdentifier = ChainIdHelper.parse(
            chainInfo.chainId
          ).identifier;

          const repoUpdatedChainInfo =
            await this.migrationKVStore.updaterKVStore.get<ChainInfo>(
              "updated-chain-info/" + chainIdentifier
            );

          if (repoUpdatedChainInfo) {
            try {
              const validated = await validateBasicChainInfoType(
                repoUpdatedChainInfo
              );
              runInAction(() => {
                this.repoChainInfos = [...this.repoChainInfos, validated];
              });
            } catch (e) {
              console.log(e);
            }
          }

          const localUpdatedChainInfo =
            await this.migrationKVStore.updaterKVStore.get<Partial<ChainInfo>>(
              chainIdentifier
            );
          if (localUpdatedChainInfo) {
            this.setUpdatedChainInfo(chainInfo.chainId, {
              chainId: localUpdatedChainInfo.chainId,
              features: localUpdatedChainInfo.features,
            });
          }

          const endpoints = await this.migrationKVStore.updaterKVStore.get<{
            rpc: string | undefined;
            rest: string | undefined;
            evmRpc: string | undefined;
          }>("chain-info-endpoints/" + chainIdentifier);

          if (endpoints) {
            this.setEndpoint(chainInfo.chainId, endpoints);
          }
        }
      }

      await this.kvStore.set("migration/v1", true);
    }

    {
      const chainInfos = await this.updatedChainInfoKVStore.get<
        UpdatedChainInfo[]
      >("chainInfos");
      if (chainInfos) {
        runInAction(() => {
          this.updatedChainInfos = chainInfos;
        });
      }

      autorun(() => {
        this.updatedChainInfoKVStore.set("chainInfos", this.updatedChainInfos);
      });
    }

    {
      const chainInfos = await this.suggestedChainInfoKVStore.get<ChainInfo[]>(
        "chainInfos"
      );
      if (chainInfos) {
        runInAction(() => {
          // embedChainInfos에 있는 chainInfo는 suggestedChainInfos에 넣지 않는다.
          // embedChainInfos는 실행 이후에 변경되지 않기 때문에 여기서 처리해도 안전하다.
          this.suggestedChainInfos = chainInfos.filter(
            (chainInfo) =>
              !this.embedChainInfos.some(
                (embedChainInfo) =>
                  ChainIdHelper.parse(chainInfo.chainId).identifier ===
                  ChainIdHelper.parse(embedChainInfo.chainId).identifier
              )
          );
        });
      }

      autorun(() => {
        this.suggestedChainInfoKVStore.set(
          "chainInfos",
          this.suggestedChainInfos
        );
      });
    }

    {
      const chainInfos = await this.repoChainInfoKVStore.get<ChainInfo[]>(
        "chainInfos"
      );
      if (chainInfos) {
        runInAction(() => {
          this.repoChainInfos = chainInfos;
        });
      }

      autorun(() => {
        this.repoChainInfoKVStore.set("chainInfos", this.repoChainInfos);
      });
    }

    {
      const endpoints = await this.endpointsKVStore.get<
        {
          chainId: string;
          rpc?: string;
          rest?: string;
          evmRpc?: string;
        }[]
      >("endpoints");
      if (endpoints) {
        runInAction(() => {
          this.endpoints = endpoints;
        });
      }

      autorun(() => {
        this.endpointsKVStore.set("endpoints", this.endpoints);
      });
    }

    runIfOnlyAppStart("analytics/test-cointypes", async () => {
      const coinTypes = new Map<number, boolean>();
      const chainInfos = this.getChainInfos();
      for (const chainInfo of chainInfos) {
        if (
          chainInfo.bip44.coinType !== 118 &&
          chainInfo.bip44.coinType !== 60
        ) {
          coinTypes.set(chainInfo.bip44.coinType, true);
        }
        for (const alternative of chainInfo.alternativeBIP44s ?? []) {
          if (alternative.coinType !== 118 && alternative.coinType !== 60) {
            coinTypes.set(alternative.coinType, true);
          }
        }
      }
      this.analyticsService.logEventIgnoreError("test-cointypes", {
        coinTypes: Array.from(coinTypes.keys()),
      });
    });
  }

  /**
   * 이 서비스 자체를 포함한 다른 모든 서비스들이 init된 이후에 실행된다. (message를 받을 수 있는 상태 직전)
   * 모든 서비스가 init이 된 이후에 실행될 추가적인 로직을 여기에 작성할 수 있다.
   */
  async afterInit(): Promise<void> {
    const lastEmbedChainInfos = await this.kvStore.get<
      ChainInfoWithCoreTypes[]
    >("last_embed_chain_infos");

    if (this.afterInitFn) {
      await this.afterInitFn(this, lastEmbedChainInfos ?? []);
    }

    await this.kvStore.set(
      "last_embed_chain_infos",
      toJS(this.embedChainInfos)
    );
  }

  getChainInfos = computedFn(
    (): ChainInfo[] => {
      return this.mergeChainInfosWithDynamics(
        this.embedChainInfos.concat(this.suggestedChainInfos)
      );
    },
    {
      keepAlive: true,
    }
  );

  getChainInfosWithoutEndpoints = computedFn(
    (): ChainInfoWithoutEndpoints[] => {
      return this.mergeChainInfosWithDynamics(
        this.embedChainInfos.concat(this.suggestedChainInfos)
      ).map((chainInfo) => {
        return {
          ...chainInfo,
          rpc: undefined,
          rest: undefined,
          nodeProvider: undefined,
          updateFromRepoDisabled: undefined,
          embedded: undefined,
          evm:
            chainInfo.evm !== undefined
              ? {
                  ...chainInfo.evm,
                  rpc: undefined,
                }
              : undefined,
        };
      });
    },
    {
      keepAlive: true,
    }
  );

  getChainInfoWithoutEndpoints = computedFn(
    (chainId: string): ChainInfoWithoutEndpoints | undefined => {
      return this.getChainInfosWithoutEndpoints().find(
        (chainInfo) => chainInfo.chainId === chainId
      );
    },
    {
      keepAlive: true,
    }
  );

  getChainInfo = computedFn(
    (chainId: string): ChainInfo | undefined => {
      return this.chainInfoMap.get(ChainIdHelper.parse(chainId).identifier);
    },
    {
      keepAlive: true,
    }
  );

  hasChainInfo(chainId: string): boolean {
    return this.getChainInfo(chainId) != null;
  }

  getChainInfoOrThrow(chainId: string): ChainInfo {
    const chainInfo = this.getChainInfo(chainId);
    if (!chainInfo) {
      throw new Error(`There is no chain info for ${chainId}`);
    }
    return chainInfo;
  }

  getChainInfosWithCoreTypes = computedFn(
    (): ChainInfoWithCoreTypes[] => {
      return this.mergeChainInfosWithDynamics(
        this.embedChainInfos
          .map((chainInfo) => {
            return {
              ...chainInfo,
              embedded: true,
            };
          })
          .concat(
            this.suggestedChainInfos.map((chainInfo) => {
              return {
                ...chainInfo,
                beta: true,
                embedded: false,
              };
            })
          )
      );
    },
    {
      keepAlive: true,
    }
  );

  getChainInfoWithCoreTypes = computedFn(
    (chainId: string): ChainInfoWithCoreTypes | undefined => {
      return this.chainInfoMapWithCoreTypes.get(
        ChainIdHelper.parse(chainId).identifier
      );
    },
    {
      keepAlive: true,
    }
  );

  async tryUpdateChainInfoFromRepo(chainId: string): Promise<boolean> {
    if (!this.hasChainInfo(chainId)) {
      throw new Error(`${chainId} is not registered`);
    }

    if (
      (this.getChainInfoOrThrow(chainId) as ChainInfoWithCoreTypes)
        .updateFromRepoDisabled
    ) {
      return false;
    }

    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    const isEvmOnlyChain = this.isEvmOnlyChain(chainId);

    const res = await simpleFetch<
      (Omit<ChainInfo, "rest"> & { websocket: string }) | ChainInfo
    >(
      this.communityChainInfoRepo.alternativeURL
        ? this.communityChainInfoRepo.alternativeURL
            .replace("{chain_identifier}", chainIdentifier)
            .replace("/cosmos/", isEvmOnlyChain ? "/evm/" : "/cosmos/")
        : `https://raw.githubusercontent.com/${
            this.communityChainInfoRepo.organizationName
          }/${this.communityChainInfoRepo.repoName}/${
            this.communityChainInfoRepo.branchName
          }/${isEvmOnlyChain ? "evm" : "cosmos"}/${chainIdentifier}.json`
    );
    let chainInfo: ChainInfo =
      "rest" in res.data
        ? res.data
        : {
            ...res.data,
            rest: res.data.rpc,
            evm: {
              chainId: parseInt(res.data.chainId.replace("eip155:", ""), 10),
              rpc: res.data.rpc,
              websocket: res.data.websocket,
            },
            features: ["eth-address-gen", "eth-key-sign"].concat(
              res.data.features ?? []
            ),
          };

    const fetchedChainIdentifier = ChainIdHelper.parse(
      chainInfo.chainId
    ).identifier;
    if (chainIdentifier !== fetchedChainIdentifier) {
      throw new Error(
        `The chainId is not valid.(${chainId} -> ${fetchedChainIdentifier})`
      );
    }

    chainInfo = await validateBasicChainInfoType(chainInfo);

    if (!this.hasChainInfo(chainId)) {
      throw new Error(`${chainId} became unregistered after fetching`);
    }

    const prevChainInfoFromRepo = this.getRepoChainInfo(chainId);
    if (
      !prevChainInfoFromRepo ||
      sortedJsonByKeyStringify(prevChainInfoFromRepo) !==
        sortedJsonByKeyStringify(chainInfo)
    ) {
      const i = this.repoChainInfos.findIndex(
        (c) => ChainIdHelper.parse(c.chainId).identifier === chainIdentifier
      );
      runInAction(() => {
        if (i >= 0) {
          const newChainInfos = this.repoChainInfos.slice();
          newChainInfos[i] = chainInfo;
          this.repoChainInfos = newChainInfos;
        } else {
          const newChainInfos = this.repoChainInfos.slice();
          newChainInfos.push(chainInfo);
          this.repoChainInfos = newChainInfos;
        }
      });

      return true;
    }

    return false;
  }

  async tryUpdateChainInfoFromRpcOrRest(chainId: string): Promise<boolean> {
    if (!this.hasChainInfo(chainId)) {
      throw new Error(`${chainId} is not registered`);
    }

    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;

    const chainInfo = this.getChainInfoOrThrow(chainId);

    let chainIdUpdated = false;
    const statusResponse = await simpleFetch<
      | {
          result: {
            node_info: {
              network: string;
            };
          };
        }
      | {
          node_info: {
            network: string;
          };
        }
    >(chainInfo.rpc, "/status");

    const statusResult = (() => {
      if ("result" in statusResponse.data) {
        return statusResponse.data.result;
      }
      return statusResponse.data;
    })();
    const chainIdFromRPC = statusResult.node_info.network;
    if (ChainIdHelper.parse(chainIdFromRPC).identifier !== chainIdentifier) {
      throw new Error(
        `Chain id is different from rpc: (expected: ${chainId}, actual: ${chainIdFromRPC})`
      );
    }
    if (chainInfo.chainId !== chainIdFromRPC) {
      chainIdUpdated = true;

      if (!this.hasChainInfo(chainId)) {
        throw new Error(`${chainId} became unregistered after fetching`);
      }

      this.setUpdatedChainInfo(chainId, {
        chainId: chainIdFromRPC,
      });
    }

    const toUpdateFeatures = await checkChainFeatures(chainInfo);

    const featuresUpdated = toUpdateFeatures.length !== 0;
    if (featuresUpdated) {
      if (!this.hasChainInfo(chainId)) {
        throw new Error(`${chainId} became unregistered after fetching`);
      }

      const features = [
        ...new Set([...toUpdateFeatures, ...(chainInfo.features ?? [])]),
      ];

      this.setUpdatedChainInfo(chainId, {
        features,
      });
    }

    return chainIdUpdated || featuresUpdated;
  }

  @action
  protected setUpdatedChainInfo(
    chainId: string,
    chainInfo: Partial<Pick<UpdatedChainInfo, "chainId" | "features">>
  ): void {
    if (!this.hasChainInfo(chainId)) {
      throw new Error(`${chainId} is not registered`);
    }

    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    const i = this.updatedChainInfos.findIndex(
      (c) => ChainIdHelper.parse(c.chainId).identifier === chainIdentifier
    );
    if (i >= 0) {
      const prev = this.updatedChainInfos[i];
      const newChainInfos = this.updatedChainInfos.slice();
      newChainInfos[i] = {
        ...prev,
        ...chainInfo,
      };

      this.updatedChainInfos = newChainInfos;
    } else {
      const original = this.getChainInfoOrThrow(chainId);
      const newChainInfos = this.updatedChainInfos.slice();
      newChainInfos.push({
        chainId: chainInfo.chainId || original.chainId,
        features: chainInfo.features || original.features,
      });

      this.updatedChainInfos = newChainInfos;
    }
  }

  async suggestChainInfo(
    env: Env,
    chainInfo: ChainInfo,
    origin: string
  ): Promise<void> {
    chainInfo = await validateBasicChainInfoType(chainInfo);

    await this.interactionService.waitApproveV2(
      env,
      "/suggest-chain",
      SuggestChainInfoMsg.type(),
      {
        chainInfo,
        origin,
      },
      async (receivedChainInfo: ChainInfoWithSuggestedOptions) => {
        const validChainInfo = {
          ...(await validateBasicChainInfoType(receivedChainInfo)),
          beta: chainInfo.beta,
          updateFromRepoDisabled: receivedChainInfo.updateFromRepoDisabled,
        };

        if (validChainInfo.updateFromRepoDisabled) {
          console.log(
            `Chain ${validChainInfo.chainName}(${validChainInfo.chainId}) added with updateFromRepoDisabled`
          );
        } else {
          console.log(
            `Chain ${validChainInfo.chainName}(${validChainInfo.chainId}) added`
          );
        }

        await this.addSuggestedChainInfo(validChainInfo);
      }
    );
  }

  async addSuggestedChainInfo(
    chainInfo: ChainInfoWithSuggestedOptions,
    // Used for migration
    notInvokeHandlers?: boolean
  ): Promise<void> {
    const i = this.suggestedChainInfos.findIndex(
      (c) =>
        ChainIdHelper.parse(c.chainId).identifier ===
        ChainIdHelper.parse(chainInfo.chainId).identifier
    );
    if (i < 0) {
      const newChainInfos = this.suggestedChainInfos.slice();
      newChainInfos.push(chainInfo);
      runInAction(() => {
        this.suggestedChainInfos = newChainInfos;
      });

      if (!notInvokeHandlers) {
        const updated = this.mergeChainInfosWithDynamics([chainInfo])[0];

        for (const handler of this.onChainSuggestedHandlers) {
          try {
            await handler(updated);
          } catch (e) {
            console.error(e);
          }
        }
      }
    } else {
      throw new Error(`There is already chain info for ${chainInfo.chainId}`);
    }
  }

  @action
  removeSuggestedChainInfo(chainId: string): void {
    const i = this.suggestedChainInfos.findIndex(
      (c) =>
        ChainIdHelper.parse(c.chainId).identifier ===
        ChainIdHelper.parse(chainId).identifier
    );
    if (i >= 0) {
      const chainInfo = this.suggestedChainInfos[i];

      const newChainInfos = this.suggestedChainInfos.slice();
      newChainInfos.splice(i, 1);
      this.suggestedChainInfos = newChainInfos;

      this.onChainRemoved(chainInfo);
    } else {
      throw new Error(`There is no chain info for ${chainId}`);
    }
  }

  @action
  clearAllSuggestedChainInfos(): void {
    const prev = this.suggestedChainInfos.slice();

    this.suggestedChainInfos = [];

    for (const chainInfo of prev) {
      this.onChainRemoved(chainInfo);
    }
  }

  @computed({
    keepAlive: true,
  })
  protected get chainInfoMap(): Map<string, ChainInfo> {
    const map: Map<string, ChainInfo> = new Map();
    for (const chainInfo of this.getChainInfos()) {
      map.set(ChainIdHelper.parse(chainInfo.chainId).identifier, chainInfo);
    }
    return map;
  }

  @computed({
    keepAlive: true,
  })
  protected get chainInfoMapWithCoreTypes(): Map<
    string,
    ChainInfoWithCoreTypes
  > {
    const map: Map<string, ChainInfoWithCoreTypes> = new Map();
    for (const chainInfo of this.getChainInfosWithCoreTypes()) {
      map.set(ChainIdHelper.parse(chainInfo.chainId).identifier, chainInfo);
    }
    return map;
  }

  @computed({
    keepAlive: true,
  })
  protected get updatedChainInfoMap(): Map<string, UpdatedChainInfo> {
    const map: Map<string, UpdatedChainInfo> = new Map();
    for (const chainInfo of this.updatedChainInfos) {
      map.set(ChainIdHelper.parse(chainInfo.chainId).identifier, chainInfo);
    }
    return map;
  }

  protected getUpdatedChainInfo(chainId: string): UpdatedChainInfo | undefined {
    return this.updatedChainInfoMap.get(
      ChainIdHelper.parse(chainId).identifier
    );
  }

  @computed({
    keepAlive: true,
  })
  protected get repoChainInfoMap(): Map<string, ChainInfo> {
    const map: Map<string, ChainInfo> = new Map();
    for (const chainInfo of this.repoChainInfos) {
      map.set(ChainIdHelper.parse(chainInfo.chainId).identifier, chainInfo);
    }
    return map;
  }

  protected getRepoChainInfo(chainId: string): ChainInfo | undefined {
    return this.repoChainInfoMap.get(ChainIdHelper.parse(chainId).identifier);
  }

  @action
  setEndpoint(
    chainId: string,
    endpoint: {
      rpc?: string;
      rest?: string;
      evmRpc?: string;
    }
  ): void {
    const trim = {
      ...endpoint,
    };
    // "undefined"/"null" itself can affect the logic.
    // Make sure to delete field if it is null.
    if (!trim.rpc) {
      delete trim.rpc;
    }
    if (!trim.rest) {
      delete trim.rest;
    }
    if (!trim.evmRpc) {
      delete trim.evmRpc;
    }

    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    const i = this.endpoints.findIndex(
      (endpoint) =>
        ChainIdHelper.parse(endpoint.chainId).identifier === chainIdentifier
    );
    if (i >= 0) {
      const newEndpoints = this.endpoints.slice();
      newEndpoints[i] = {
        chainId,
        ...trim,
      };
      this.endpoints = newEndpoints;
    } else {
      const newEndpoints = this.endpoints.slice();
      newEndpoints.push({
        chainId,
        ...trim,
      });
      this.endpoints = newEndpoints;
    }
  }

  @action
  clearEndpoint(chainId: string): void {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    const i = this.endpoints.findIndex(
      (endpoint) =>
        ChainIdHelper.parse(endpoint.chainId).identifier === chainIdentifier
    );
    if (i >= 0) {
      const newEndpoints = this.endpoints.slice();
      newEndpoints.splice(i, 1);
      this.endpoints = newEndpoints;
    }
  }

  @action
  clearAllEndpoints(): void {
    this.endpoints = [];
  }

  getOriginalEndpoint = computedFn(
    (
      chainId: string
    ): {
      rpc: string;
      rest: string;
      evmRpc?: string;
    } => {
      const identifier = ChainIdHelper.parse(chainId).identifier;
      const originalChainInfos = this.embedChainInfos.concat(
        this.suggestedChainInfos
      );
      const chainInfo = originalChainInfos.find(
        (c) => ChainIdHelper.parse(c.chainId).identifier === identifier
      );
      if (chainInfo) {
        return {
          rpc: chainInfo.rpc,
          rest: chainInfo.rest,
          evmRpc: chainInfo.evm?.rpc,
        };
      }

      throw new Error(`Unknown chain: ${chainId}`);
    },
    {
      keepAlive: true,
    }
  );

  protected getEndpoint(chainId: string):
    | {
        chainId: string;
        rpc?: string;
        rest?: string;
        evmRpc?: string;
      }
    | undefined {
    return this.endpointMap.get(ChainIdHelper.parse(chainId).identifier);
  }

  @computed({
    keepAlive: true,
  })
  protected get endpointMap(): Map<
    string,
    {
      chainId: string;
      rpc?: string;
      rest?: string;
      evmRpc?: string;
    }
  > {
    const map: Map<
      string,
      {
        chainId: string;
        rpc?: string;
        rest?: string;
        evmRpc?: string;
      }
    > = new Map();
    for (const endpoint of this.endpoints) {
      map.set(ChainIdHelper.parse(endpoint.chainId).identifier, endpoint);
    }
    return map;
  }

  protected mergeChainInfosWithDynamics<C extends ChainInfo>(
    chainInfos: C[]
  ): C[] {
    return chainInfos.map((chainInfo) => {
      let newChainInfo = {
        ...chainInfo,
      };

      if (!(chainInfo as ChainInfoWithCoreTypes).updateFromRepoDisabled) {
        const repoChainInfo = this.getRepoChainInfo(chainInfo.chainId);
        if (repoChainInfo) {
          newChainInfo = {
            ...newChainInfo,
            ...repoChainInfo,
            // stakeCurrency는 nullable하며 repo로부터 업데이트 되었을때
            // repo에서 stakeCurrency가 없다면 명시적으로 지워져야한다.
            stakeCurrency: repoChainInfo.stakeCurrency
              ? repoChainInfo.stakeCurrency
              : undefined,
            walletUrlForStaking:
              repoChainInfo.walletUrlForStaking ||
              newChainInfo.walletUrlForStaking,
            features: [
              ...new Set([
                ...(repoChainInfo.features ?? []),
                ...(newChainInfo.features ?? []),
              ]),
            ],
            beta: newChainInfo.beta,
          };
        }
      }

      const updatedChainInfo = this.getUpdatedChainInfo(chainInfo.chainId);
      if (updatedChainInfo) {
        newChainInfo = {
          ...newChainInfo,
          chainId: updatedChainInfo.chainId,
          features: [
            ...new Set([
              ...(updatedChainInfo.features ?? []),
              ...(newChainInfo.features ?? []),
            ]),
          ],
        };
      }

      const endpoint = this.getEndpoint(chainInfo.chainId);
      if (endpoint) {
        newChainInfo = {
          ...newChainInfo,
          rpc: endpoint.rpc || newChainInfo.rpc,
          rest: endpoint.rest || newChainInfo.rest,
          ...(endpoint.evmRpc &&
            newChainInfo.evm && {
              evm: {
                ...newChainInfo.evm,
                rpc: endpoint.evmRpc,
              },
            }),
        };
      }

      // Reduce the confusion from different coin type on ecosystem.
      // Unite coin type for all chain to 118 with allowing alternatives.
      // (If coin type is 60, it is probably to be compatible with metamask. So, in this case, do nothing.)
      if (
        newChainInfo.bip44.coinType !== 118 &&
        newChainInfo.bip44.coinType !== 60
      ) {
        newChainInfo = {
          ...newChainInfo,
          alternativeBIP44s: (() => {
            let res = newChainInfo.alternativeBIP44s ?? [];

            if (res.find((c) => c.coinType === 118)) {
              return res;
            }

            res = [...res, { coinType: 118 }];

            return res;
          })(),
        };
      }

      return newChainInfo;
    });
  }

  @action
  onChainRemoved(chainInfo: ChainInfo): void {
    const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId).identifier;

    // 이 이후로 updated 정보를 다 지워버리기 때문에 먼저 chain info를 얻어놔야한다.
    const updated = this.mergeChainInfosWithDynamics([chainInfo])[0];

    {
      const newChainInfos = this.updatedChainInfos.slice();
      newChainInfos.filter(
        (chainInfo) =>
          ChainIdHelper.parse(chainInfo.chainId).identifier !== chainIdentifier
      );
      this.updatedChainInfos = newChainInfos;
    }

    {
      const newChainInfos = this.suggestedChainInfos.slice();
      newChainInfos.filter(
        (chainInfo) =>
          ChainIdHelper.parse(chainInfo.chainId).identifier !== chainIdentifier
      );
      this.suggestedChainInfos = newChainInfos;
    }

    {
      const newChainInfos = this.repoChainInfos.slice();
      newChainInfos.filter(
        (chainInfo) =>
          ChainIdHelper.parse(chainInfo.chainId).identifier !== chainIdentifier
      );
      this.repoChainInfos = newChainInfos;
    }

    {
      const newEndpoints = this.endpoints.slice();
      newEndpoints.filter(
        (endpoint) =>
          ChainIdHelper.parse(endpoint.chainId).identifier !== chainIdentifier
      );
      this.endpoints = newEndpoints;
    }

    for (const handler of this.onChainRemovedHandlers) {
      handler(updated);
    }
  }

  addChainRemovedHandler(handler: ChainRemovedHandler) {
    this.onChainRemovedHandlers.push(handler);
  }

  addChainSuggestedHandler(handler: ChainRemovedHandler) {
    this.onChainSuggestedHandlers.push(handler);
  }

  isEvmChain(chainId: string): boolean {
    const chainInfo = this.getChainInfoOrThrow(chainId);
    return chainInfo.evm !== undefined;
  }

  isEvmOnlyChain(chainId: string): boolean {
    return this.isEvmChain(chainId) && chainId.split(":")[0] === "eip155";
  }

  getEVMInfoOrThrow(chainId: string): EVMInfo {
    const chainInfo = this.getChainInfoOrThrow(chainId);
    if (chainInfo.evm === undefined) {
      throw new Error(`There is no EVM info for ${chainId}`);
    }

    return chainInfo.evm;
  }
}
