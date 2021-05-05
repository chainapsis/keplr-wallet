import { delay, inject, singleton } from "tsyringe";
import { TYPES } from "../types";

import { ChainInfoSchema, ChainInfoWithEmbed } from "./types";
import { ChainInfo } from "@keplr-wallet/types";
import { KVStore, Debouncer } from "@keplr-wallet/common";
import { ChainUpdaterService } from "../updater";
import { InteractionService } from "../interaction";
import { Env } from "@keplr-wallet/router";
import { SuggestChainInfoMsg } from "./messages";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

type ChainRemovedHandler = (chainId: string, identifier: string) => void;

@singleton()
export class ChainsService {
  protected onChainRemovedHandlers: ChainRemovedHandler[] = [];

  protected cachedChainInfos: ChainInfoWithEmbed[] | undefined;

  constructor(
    @inject(TYPES.ChainsStore)
    protected readonly kvStore: KVStore,
    @inject(TYPES.ChainsEmbedChainInfos)
    protected readonly embedChainInfos: ChainInfo[],
    @inject(delay(() => ChainUpdaterService))
    protected readonly chainUpdaterKeeper: ChainUpdaterService,
    @inject(delay(() => InteractionService))
    protected readonly interactionKeeper: InteractionService
  ) {}

  readonly getChainInfos: () => Promise<
    ChainInfoWithEmbed[]
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

    const savedChainInfos: ChainInfoWithEmbed[] = (
      (await this.kvStore.get<ChainInfo[]>("chain-infos")) ?? []
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

    let result: ChainInfoWithEmbed[] = chainInfos.concat(savedChainInfos);

    // Set the updated property of the chain.
    result = await Promise.all(
      result.map(async (chainInfo) => {
        const updated: ChainInfo = await this.chainUpdaterKeeper.putUpdatedPropertyToChainInfo(
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

  async getChainInfo(chainId: string): Promise<ChainInfoWithEmbed> {
    const chainInfo = (await this.getChainInfos()).find((chainInfo) => {
      return (
        ChainIdHelper.parse(chainInfo.chainId).identifier ===
        ChainIdHelper.parse(chainId).identifier
      );
    });

    if (!chainInfo) {
      throw new Error(`There is no chain info for ${chainId}`);
    }
    return chainInfo;
  }

  async getChainCoinType(chainId: string): Promise<number> {
    const chainInfo = await this.getChainInfo(chainId);

    if (!chainInfo) {
      throw new Error(`There is no chain info for ${chainId}`);
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
    chainInfo = await ChainInfoSchema.validateAsync(chainInfo, {
      stripUnknown: true,
    });

    await this.interactionKeeper.waitApprove(
      env,
      "/suggest-chain",
      SuggestChainInfoMsg.type(),
      {
        ...chainInfo,
        origin,
      }
    );

    await this.addChainInfo(chainInfo);
  }

  async addChainInfo(chainInfo: ChainInfo): Promise<void> {
    if (await this.hasChainInfo(chainInfo.chainId)) {
      throw new Error("Same chain is already registered");
    }

    const savedChainInfos =
      (await this.kvStore.get<ChainInfo[]>("chain-infos")) ?? [];

    savedChainInfos.push(chainInfo);

    await this.kvStore.set<ChainInfo[]>("chain-infos", savedChainInfos);

    this.clearCachedChainInfos();
  }

  async removeChainInfo(chainId: string): Promise<void> {
    if (!(await this.hasChainInfo(chainId))) {
      throw new Error("Chain is not registered");
    }

    if ((await this.getChainInfo(chainId)).embeded) {
      throw new Error("Can't remove the embedded chain");
    }

    const savedChainInfos =
      (await this.kvStore.get<ChainInfo[]>("chain-infos")) ?? [];

    const resultChainInfo = savedChainInfos.filter((chainInfo) => {
      return (
        ChainIdHelper.parse(chainInfo.chainId).identifier !==
        ChainIdHelper.parse(chainId).identifier
      );
    });

    await this.kvStore.set<ChainInfo[]>("chain-infos", resultChainInfo);

    // Clear the updated chain info.
    await this.chainUpdaterKeeper.clearUpdatedProperty(chainId);

    for (const chainRemovedHandler of this.onChainRemovedHandlers) {
      chainRemovedHandler(chainId, ChainIdHelper.parse(chainId).identifier);
    }

    this.clearCachedChainInfos();
  }

  addChainRemovedHandler(handler: ChainRemovedHandler) {
    this.onChainRemovedHandlers.push(handler);
  }
}
