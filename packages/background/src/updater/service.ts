import { ChainInfo } from "@keplr-wallet/types";
import { KVStore } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ChainInfoWithCoreTypes, ChainsService } from "../chains";
import {
  checkChainFeatures,
  validateBasicChainInfoType,
} from "@keplr-wallet/chain-validator";
import Axios from "axios";

export class ChainUpdaterService {
  protected chainsService!: ChainsService;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly communityChainInfoRepo: {
      readonly organizationName: string;
      readonly repoName: string;
    }
  ) {}

  init(chainsService: ChainsService) {
    this.chainsService = chainsService;
  }

  async replaceChainInfo(origin: ChainInfo): Promise<ChainInfo> {
    const chainIdentifier = ChainIdHelper.parse(origin.chainId).identifier;

    let chainInfo: ChainInfo = origin;

    const updatedChainInfo = await this.kvStore.get<ChainInfo>(
      "updated-chain-info/" + chainIdentifier
    );

    if (updatedChainInfo) {
      chainInfo = updatedChainInfo;
    }

    const local = await this.kvStore.get<Partial<ChainInfo>>(chainIdentifier);
    if (local) {
      chainInfo = {
        ...chainInfo,
        ...{
          chainId: local.chainId || chainInfo.chainId,
          features: (() => {
            if (!local.features) {
              return chainInfo.features;
            }

            const features = chainInfo.features ?? [];
            for (const add of local.features) {
              if (!features.find((f) => f !== add)) {
                features.push(add);
              }
            }

            return features;
          })(),
        },
      };
    }

    const endpoints = await this.getChainEndpoints(origin.chainId);

    return {
      ...chainInfo,
      rpc: endpoints.rpc || chainInfo.rpc,
      rest: endpoints.rest || chainInfo.rest,
    };
  }

  async tryUpdateChainInfo(chainId: string): Promise<void> {
    if (
      (await this.chainsService.getChainInfo(chainId)).updateFromRepoDisabled
    ) {
      return;
    }

    try {
      const chainIdentifier = ChainIdHelper.parse(chainId).identifier;

      const res = await Axios.get<ChainInfo>(
        `/cosmos/${chainIdentifier}.json`,
        {
          baseURL: `https://raw.githubusercontent.com/${this.communityChainInfoRepo.organizationName}/${this.communityChainInfoRepo.repoName}/main`,
        }
      );

      let chainInfo: ChainInfo = res.data;

      const fetchedChainIdentifier = ChainIdHelper.parse(chainInfo.chainId)
        .identifier;
      if (chainIdentifier !== fetchedChainIdentifier) {
        console.log(
          `The chainId is not valid.(${chainId} -> ${fetchedChainIdentifier})`
        );
        return;
      }

      chainInfo = {
        ...chainInfo,
        ...(() => {
          // If coin type is 60, it is probably to be compatible with metamask.
          // So, in this case, do nothing.
          if (chainInfo.bip44.coinType === 60) {
            return;
          }

          // Reduce the confusion from different coin type on ecosystem.
          // Unite coin type for all chain with allowing alternatives.
          return {
            alternativeBIP44s: (() => {
              let res = chainInfo.alternativeBIP44s ?? [];

              if (chainInfo.bip44.coinType === 118) {
                return res;
              }

              if (res.find((c) => c.coinType === 118)) {
                return res;
              }

              res = [...res, { coinType: 118 }];

              return res;
            })(),
          };
        })(),
      };

      chainInfo = await validateBasicChainInfoType(chainInfo);

      await this.kvStore.set<ChainInfo>(
        "updated-chain-info/" + chainIdentifier,
        chainInfo
      );

      this.chainsService.clearCachedChainInfos();

      const updatedChainInfo = await this.chainsService.getChainInfo(chainId);
      const toUpdateFeatures = await checkChainFeatures(updatedChainInfo);

      if (toUpdateFeatures.length !== 0) {
        const local = await this.kvStore.get<Partial<ChainInfo>>(
          chainIdentifier
        );

        await this.kvStore.set<Partial<ChainInfo>>(chainIdentifier, {
          ...local,
          features: [
            ...new Set([...toUpdateFeatures, ...(local?.features ?? [])]),
          ],
        });
      }

      this.chainsService.clearCachedChainInfos();
    } catch (e) {
      console.log(`Failed to try to update chain info for ${chainId}`, e);
    }
  }

  // This method is called on `ChainsService`.
  // TODO: Refactor
  async clearUpdatedProperty(chainId: string) {
    await this.kvStore.set(ChainIdHelper.parse(chainId).identifier, null);
    await this.kvStore.set<ChainInfo>(
      "updated-chain-info/" + ChainIdHelper.parse(chainId).identifier,
      null
    );

    this.chainsService.clearCachedChainInfos();
  }

  // XXX: It is not conceptually valid that the function to set the rpc/rest endpoint of the chain exists in this service.
  //      However, in order to focus on adding feature rather than making a big change, the refactor is postponed later and the configuration of the rpc/rest endpoint is handled here.

  public async setChainEndpoints(
    chainId: string,
    rpc: string | undefined,
    rest: string | undefined
  ): Promise<ChainInfoWithCoreTypes[]> {
    await this.kvStore.set(
      "chain-info-endpoints/" + ChainIdHelper.parse(chainId).identifier,
      {
        rpc,
        rest,
      }
    );

    this.chainsService.clearCachedChainInfos();

    return await this.chainsService.getChainInfos();
  }

  public async getChainEndpoints(
    chainId: string
  ): Promise<{
    rpc: string | undefined;
    rest: string | undefined;
  }> {
    const saved = await this.kvStore.get<{
      rpc: string | undefined;
      rest: string | undefined;
    }>("chain-info-endpoints/" + ChainIdHelper.parse(chainId).identifier);

    if (!saved) {
      return {
        rpc: undefined,
        rest: undefined,
      };
    }

    return saved;
  }

  public async resetChainEndpoints(
    chainId: string
  ): Promise<ChainInfoWithCoreTypes[]> {
    await this.kvStore.set(
      "chain-info-endpoints/" + ChainIdHelper.parse(chainId).identifier,
      null
    );

    this.chainsService.clearCachedChainInfos();

    return await this.chainsService.getChainInfos();
  }
}
