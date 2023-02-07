import {
  KVStore,
  PrefixKVStore,
  sortedJsonByKeyStringify,
} from "@keplr-wallet/common";
import { ChainInfo } from "@keplr-wallet/types";
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ChainInfoWithCoreTypes } from "./types";
import { computedFn } from "mobx-utils";
import Axios from "axios";
import {
  checkChainFeatures,
  validateBasicChainInfoType,
} from "@keplr-wallet/chain-validator";

type ChainRemovedHandler = (chainInfo: ChainInfo) => void;
type UpdatedChainInfo = Pick<ChainInfo, "chainId" | "features">;

export class ChainsService {
  @observable.ref
  protected updatedChainInfos: UpdatedChainInfo[] = [];
  protected updatedChainInfoKVStore: KVStore;

  @observable.ref
  protected suggestedChainInfos: ChainInfo[] = [];
  protected suggestedChainInfoKVStore: KVStore;

  @observable.ref
  protected repoChainInfos: ChainInfo[] = [];
  protected repoChainInfoKVStore: KVStore;

  @observable.ref
  protected endpoints: {
    chainId: string;
    rpc?: string;
    rest?: string;
  }[] = [];
  protected endpointsKVStore: KVStore;

  protected onChainRemovedHandlers: ChainRemovedHandler[] = [];

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly embedChainInfos: ChainInfo[],
    protected readonly communityChainInfoRepo: {
      readonly organizationName: string;
      readonly repoName: string;
      readonly branchName: string;
    }
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
          this.suggestedChainInfos = chainInfos;
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
      throw new Error(`There in no chain info for ${chainId}`);
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

    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;

    const res = await Axios.get<ChainInfo>(`/cosmos/${chainIdentifier}.json`, {
      baseURL: `https://raw.githubusercontent.com/${this.communityChainInfoRepo.organizationName}/${this.communityChainInfoRepo.repoName}/${this.communityChainInfoRepo.branchName}`,
    });

    let chainInfo: ChainInfo = res.data;

    const fetchedChainIdentifier = ChainIdHelper.parse(chainInfo.chainId)
      .identifier;
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
    const statusResponse = await Axios.get<{
      result: {
        node_info: {
          network: string;
        };
      };
    }>("/status", {
      baseURL: chainInfo.rpc,
    });

    const chainIdFromRPC = statusResponse.data.result.node_info.network;
    if (ChainIdHelper.parse(chainIdFromRPC).identifier !== chainIdentifier) {
      throw new Error(
        `Chain id is different from rpc: (expected: ${chainId}, actual: ${chainIdFromRPC})`
      );
    }
    if (chainInfo.chainId !== chainIdFromRPC) {
      chainIdUpdated = true;

      this.setUpdatedChainInfo(chainId, {
        chainId: chainIdFromRPC,
      });
    }

    const toUpdateFeatures = await checkChainFeatures(chainInfo);

    const featuresUpdated = toUpdateFeatures.length !== 0;
    if (featuresUpdated) {
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
    chainInfo: Partial<UpdatedChainInfo>
  ): void {
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
      throw new Error(`There is no updated chain info for ${chainId}`);
    }
  }

  @action
  addSuggestedChainInfo(chainInfo: ChainInfo): void {
    const i = this.suggestedChainInfos.findIndex(
      (c) =>
        ChainIdHelper.parse(c.chainId).identifier ===
        ChainIdHelper.parse(chainInfo.chainId).identifier
    );
    if (i >= 0) {
      const newChainInfos = this.suggestedChainInfos.slice();
      newChainInfos[i] = chainInfo;
      this.suggestedChainInfos = newChainInfos;
    } else {
      const newChainInfos = this.suggestedChainInfos.slice();
      newChainInfos.push(chainInfo);
      this.suggestedChainInfos = newChainInfos;
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

  protected getEndpoint(
    chainId: string
  ):
    | {
        chainId: string;
        rpc?: string;
        rest?: string;
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
    }
  > {
    const map: Map<
      string,
      {
        chainId: string;
        rpc?: string;
        rest?: string;
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

      const repoChainInfo = this.getRepoChainInfo(chainInfo.chainId);
      if (repoChainInfo) {
        newChainInfo = {
          ...newChainInfo,
          ...repoChainInfo,
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
        };
      }

      return newChainInfo;
    });
  }

  @action
  onChainRemoved(chainInfo: ChainInfo): void {
    const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId).identifier;

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
      handler(chainInfo);
    }
  }

  addChainRemovedHandler(handler: ChainRemovedHandler) {
    this.onChainRemovedHandlers.push(handler);
  }
}
