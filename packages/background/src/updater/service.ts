import { ChainInfo } from "@keplr-wallet/types";
import { KVStore } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ChainInfoWithEmbed, ChainsService } from "../chains";
import {
  SupportedChainFeatures,
  validateBasicChainInfoType,
} from "@keplr-wallet/chain-validator";
import Axios from "axios";

export class ChainUpdaterService {
  protected chainsService!: ChainsService;

  constructor(protected readonly kvStore: KVStore) {}

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
    } else {
      // There is a possibility that app has legacy updated chain info.
      const legacy = await this.kvStore.get<Partial<ChainInfo>>(
        chainIdentifier
      );
      if (legacy) {
        chainInfo = {
          ...chainInfo,
          ...{
            chainId: legacy.chainId || chainInfo.chainId,
            rpc: legacy.rpc || chainInfo.rpc,
            rest: legacy.rest || chainInfo.rest,
            features: (() => {
              if (!legacy.features) {
                return chainInfo.features;
              }

              const features = chainInfo.features ?? [];
              for (const add of legacy.features) {
                if (!features.find((f) => f !== add)) {
                  features.push(add);
                }
              }

              return features;
            })(),
          },
        };
      }
    }

    const endpoints = await this.getChainEndpoints(origin.chainId);

    return {
      ...chainInfo,
      rpc: endpoints.rpc || chainInfo.rpc,
      rest: endpoints.rest || chainInfo.rest,
    };
  }

  async tryUpdateChainInfo(chainId: string): Promise<void> {
    try {
      const chainIdentifier = ChainIdHelper.parse(chainId).identifier;

      const res = await Axios.get<ChainInfo>(
        `https://raw.githubusercontent.com/danielkim89/cicd-test/main/cosmos/${chainIdentifier}.json`
      );

      let chainInfo: ChainInfo = res.data;

      // At this time, the chain info is managed on github repo.
      // So, we can delete a legacy updated chain info.
      await this.kvStore.set(ChainIdHelper.parse(chainId).identifier, null);

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
            bip44: {
              coinType: 118,
            },
            alternativeBIP44s: (() => {
              let res = chainInfo.alternativeBIP44s ?? [];

              if (chainInfo.bip44.coinType !== 118) {
                res = [{ coinType: chainInfo.bip44.coinType }, ...res];
              }

              return res;
            })(),
          };
        })(),
        // Pick supported features for current app version.
        // Because the chain info to be updated is fetched from the outside, the actual version can be different.
        // In this case, only pick supported features rather than rejecting.
        features: chainInfo.features?.filter(
          (f) => SupportedChainFeatures.indexOf(f) >= 0
        ),
      };

      chainInfo = await validateBasicChainInfoType(chainInfo);

      await this.kvStore.set<ChainInfo>(
        "updated-chain-info/" + chainIdentifier,
        chainInfo
      );

      this.chainsService.clearCachedChainInfos();
    } catch (e) {
      console.log(`Failed to try to update chain info for ${chainId}`, e);
    }
  }

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
  ): Promise<ChainInfoWithEmbed[]> {
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
  ): Promise<ChainInfoWithEmbed[]> {
    await this.kvStore.set(
      "chain-info-endpoints/" + ChainIdHelper.parse(chainId).identifier,
      null
    );

    this.chainsService.clearCachedChainInfos();

    return await this.chainsService.getChainInfos();
  }
}
