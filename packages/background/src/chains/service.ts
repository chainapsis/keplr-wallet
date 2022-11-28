import {
  ChainInfoWithCoreTypes,
  ChainInfoWithRepoUpdateOptions,
} from "./types";
import { ChainInfo } from "@keplr-wallet/types";
import { KVStore, Debouncer, MemoryKVStore } from "@keplr-wallet/common";
import { ChainUpdaterService } from "../updater";
import { InteractionService } from "../interaction";
import { Env, KeplrError } from "@keplr-wallet/router";
import { SuggestChainInfoMsg } from "./messages";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { validateBasicChainInfoType } from "@keplr-wallet/chain-validator";
import { getBasicAccessPermissionType, PermissionService } from "../permission";

type ChainRemovedHandler = (chainId: string, identifier: string) => void;

export class ChainsService {
  protected onChainRemovedHandlers: ChainRemovedHandler[] = [];

  protected cachedChainInfos: ChainInfoWithCoreTypes[] | undefined;

  protected chainUpdaterService!: ChainUpdaterService;
  protected interactionService!: InteractionService;
  protected permissionService!: PermissionService;

  protected readonly kvStoreForSuggestChain: KVStore;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly embedChainInfos: ChainInfo[],
    protected readonly experimentalOptions: Partial<{
      useMemoryKVStoreForSuggestChain: boolean;
    }> = {}
  ) {
    if (experimentalOptions?.useMemoryKVStoreForSuggestChain) {
      this.kvStoreForSuggestChain = new MemoryKVStore("suggest-chain");
    } else {
      this.kvStoreForSuggestChain = kvStore;
    }
  }

  init(
    chainUpdaterService: ChainUpdaterService,
    interactionService: InteractionService,
    permissionService: PermissionService
  ) {
    this.chainUpdaterService = chainUpdaterService;
    this.interactionService = interactionService;
    this.permissionService = permissionService;
  }

  readonly getChainInfos: () => Promise<
    ChainInfoWithCoreTypes[]
  > = Debouncer.promise(async () => {
    if (this.cachedChainInfos) {
      return this.cachedChainInfos;
    }

    const chainInfos = this.embedChainInfos.map((chainInfo) => {
      return {
        ...chainInfo,
        embeded: true,
      };
    });
    const embedChainInfoIdentifierMap: Map<
      string,
      true | undefined
    > = new Map();
    for (const embedChainInfo of chainInfos) {
      embedChainInfoIdentifierMap.set(
        ChainIdHelper.parse(embedChainInfo.chainId).identifier,
        true
      );
    }

    const suggestedChainInfos: ChainInfoWithCoreTypes[] = (
      await this.getSuggestedChainInfos()
    )
      .filter((chainInfo) => {
        // Filter the overlaped chain info with the embeded chain infos.
        return !embedChainInfoIdentifierMap.get(
          ChainIdHelper.parse(chainInfo.chainId).identifier
        );
      })
      .map((chainInfo: ChainInfo) => {
        return {
          ...chainInfo,
          embeded: false,
        };
      });

    let result: ChainInfoWithCoreTypes[] = chainInfos.concat(
      suggestedChainInfos
    );

    // Set the updated property of the chain.
    result = await Promise.all(
      result.map(async (chainInfo) => {
        const updated: ChainInfo = await this.chainUpdaterService.replaceChainInfo(
          chainInfo
        );

        return {
          ...updated,
          embeded: chainInfo.embeded,
        };
      })
    );

    this.cachedChainInfos = result;

    return result;
  });

  clearCachedChainInfos() {
    this.cachedChainInfos = undefined;
  }

  async getChainInfo(chainId: string): Promise<ChainInfoWithCoreTypes> {
    const chainInfo = (await this.getChainInfos()).find((chainInfo) => {
      return (
        ChainIdHelper.parse(chainInfo.chainId).identifier ===
        ChainIdHelper.parse(chainId).identifier
      );
    });

    if (!chainInfo) {
      throw new KeplrError(
        "chains",
        411,
        `There is no chain info for ${chainId}`
      );
    }
    return chainInfo;
  }

  async getChainCoinType(chainId: string): Promise<number> {
    const chainInfo = await this.getChainInfo(chainId);

    if (!chainInfo) {
      throw new KeplrError(
        "chains",
        411,
        `There is no chain info for ${chainId}`
      );
    }

    return chainInfo.bip44.coinType;
  }

  async hasChainInfo(chainId: string): Promise<boolean> {
    return (
      (await this.getChainInfos()).find((chainInfo) => {
        return (
          ChainIdHelper.parse(chainInfo.chainId).identifier ===
          ChainIdHelper.parse(chainId).identifier
        );
      }) != null
    );
  }

  async suggestChainInfo(
    env: Env,
    chainInfo: ChainInfo,
    origin: string
  ): Promise<void> {
    chainInfo = await validateBasicChainInfoType(chainInfo);

    let receivedChainInfo = (await this.interactionService.waitApprove(
      env,
      "/suggest-chain",
      SuggestChainInfoMsg.type(),
      {
        chainInfo,
        origin,
      }
    )) as ChainInfoWithRepoUpdateOptions;

    receivedChainInfo = {
      ...(await validateBasicChainInfoType(receivedChainInfo)),
      // Beta should be from suggested chain info itself.
      beta: chainInfo.beta,
      updateFromRepoDisabled: receivedChainInfo.updateFromRepoDisabled,
    };

    if (receivedChainInfo.updateFromRepoDisabled) {
      console.log(
        `Chain ${receivedChainInfo.chainName}(${receivedChainInfo.chainId}) added with updateFromRepoDisabled`
      );
    } else {
      console.log(
        `Chain ${receivedChainInfo.chainName}(${receivedChainInfo.chainId}) added`
      );
    }

    await this.permissionService.addPermission(
      [chainInfo.chainId],
      getBasicAccessPermissionType(),
      [origin]
    );

    await this.addChainInfo(receivedChainInfo);
  }

  async getSuggestedChainInfos(): Promise<ChainInfoWithRepoUpdateOptions[]> {
    return (
      (await this.kvStoreForSuggestChain.get<ChainInfoWithRepoUpdateOptions[]>(
        "chain-infos"
      )) ?? []
    );
  }

  async addChainInfo(chainInfo: ChainInfoWithRepoUpdateOptions): Promise<void> {
    if (await this.hasChainInfo(chainInfo.chainId)) {
      throw new KeplrError("chains", 121, "Same chain is already registered");
    }

    const savedChainInfos =
      (await this.kvStoreForSuggestChain.get<ChainInfoWithRepoUpdateOptions[]>(
        "chain-infos"
      )) ?? [];

    savedChainInfos.push(chainInfo);

    await this.kvStoreForSuggestChain.set<ChainInfoWithRepoUpdateOptions[]>(
      "chain-infos",
      savedChainInfos
    );

    this.clearCachedChainInfos();
  }

  async removeChainInfo(chainId: string): Promise<void> {
    if (!(await this.hasChainInfo(chainId))) {
      throw new KeplrError("chains", 120, "Chain is not registered");
    }

    if ((await this.getChainInfo(chainId)).embeded) {
      throw new KeplrError("chains", 122, "Can't remove the embedded chain");
    }

    const savedChainInfos =
      (await this.kvStoreForSuggestChain.get<ChainInfoWithRepoUpdateOptions[]>(
        "chain-infos"
      )) ?? [];

    const resultChainInfo = savedChainInfos.filter((chainInfo) => {
      return (
        ChainIdHelper.parse(chainInfo.chainId).identifier !==
        ChainIdHelper.parse(chainId).identifier
      );
    });

    await this.kvStoreForSuggestChain.set<ChainInfoWithRepoUpdateOptions[]>(
      "chain-infos",
      resultChainInfo
    );

    // Clear the updated chain info.
    await this.chainUpdaterService.clearUpdatedProperty(chainId);

    for (const chainRemovedHandler of this.onChainRemovedHandlers) {
      chainRemovedHandler(chainId, ChainIdHelper.parse(chainId).identifier);
    }

    this.clearCachedChainInfos();
  }

  async getChainEthereumKeyFeatures(
    chainId: string
  ): Promise<{ address: boolean; signing: boolean }> {
    const chainInfo = await this.getChainInfo(chainId);
    return {
      address: chainInfo.features?.includes("eth-address-gen") ?? false,
      signing: chainInfo.features?.includes("eth-key-sign") ?? false,
    };
  }

  addChainRemovedHandler(handler: ChainRemovedHandler) {
    this.onChainRemovedHandlers.push(handler);
  }
}
