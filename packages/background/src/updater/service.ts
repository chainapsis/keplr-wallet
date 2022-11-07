import { ChainInfo } from "@keplr-wallet/types";
import { KVStore } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ChainInfoWithEmbed, ChainsService } from "../chains";
import {
  checkChainFeatures,
  SupportedChainFeatures,
  validateBasicChainInfoType,
} from "@keplr-wallet/chain-validator";
import Axios from "axios";

export class ChainUpdaterService {
  protected chainsService!: ChainsService;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly communityChainInfoUrl: string
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

    // There is a possibility that app has legacy updated chain info.
    const legacy = await this.kvStore.get<Partial<ChainInfo>>(chainIdentifier);
    if (legacy) {
      chainInfo = {
        ...chainInfo,
        ...{
          chainId: legacy.chainId || chainInfo.chainId,
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

    const endpoints = await this.getChainEndpoints(origin.chainId);

    return {
      ...chainInfo,
      rpc: endpoints.rpc || chainInfo.rpc,
      rest: endpoints.rest || chainInfo.rest,
    };
  }

  async checkChainId(rpcUrl: string): Promise<string> {
    const statusResponse = await Axios.get<{
      result: {
        node_info: {
          network: string;
        };
      };
    }>(`${rpcUrl}/status`);

    return statusResponse.data.result.node_info.network;
  }

  async tryUpdateChainInfo(chainId: string): Promise<void> {
    try {
      const chainIdentifier = ChainIdHelper.parse(chainId).identifier;

      const res = await Axios.get<ChainInfo>(
        `${this.communityChainInfoUrl}/cosmos/${chainIdentifier}.json`
      );
      let chainInfo: ChainInfo = res.data;

      const rpcChainId = await this.checkChainId(chainInfo.rpc);
      const rpcChainIdentifier = ChainIdHelper.parse(rpcChainId).identifier;

      if (chainIdentifier !== rpcChainIdentifier) {
        console.log(`The chainId is not valid.(${chainId} -> ${rpcChainId})`);
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

      const updatedChainInfo = await this.chainsService.getChainInfo(chainId);
      const toUpdateFeatures = await checkChainFeatures(updatedChainInfo);

      if (toUpdateFeatures.length !== 0) {
        const legacy = await this.kvStore.get<Partial<ChainInfo>>(
          chainIdentifier
        );

        await this.kvStore.set<Partial<ChainInfo>>(chainIdentifier, {
          ...legacy,
          features: [
            ...new Set([...toUpdateFeatures, ...(legacy?.features ?? [])]),
          ],
        });
      }

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

  /**
   * Returns wether the chain has been changed.
   * Currently, only check the chain id has been changed.
   * @param chainInfo Chain information.
   */
  public static async checkChainUpdate(
    chainInfo: Readonly<ChainInfo>
  ): Promise<{
    explicit: boolean;
    slient: boolean;

    chainId?: string;
    features?: string[];
  }> {
    const chainId = chainInfo.chainId;

    // If chain id is not fomatted as {chainID}-{version},
    // there is no way to deal with the updated chain id.
    if (!ChainIdHelper.hasChainVersion(chainId)) {
      return {
        explicit: false,
        slient: false,
      };
    }

    const instance = Axios.create({
      baseURL: chainInfo.rpc,
    });

    // Get the status to get the chain id.
    const result = await instance.get<{
      result: {
        node_info: {
          network: string;
        };
      };
    }>("/status");

    const resultChainId = result.data.result.node_info.network;

    const version = ChainIdHelper.parse(chainId);
    const fetchedVersion = ChainIdHelper.parse(resultChainId);

    // TODO: Should throw an error?
    if (version.identifier !== fetchedVersion.identifier) {
      return {
        explicit: false,
        slient: false,
      };
    }

    const features = await checkChainFeatures(chainInfo);

    return {
      explicit: version.version < fetchedVersion.version,
      slient: features.length > 0,

      chainId: resultChainId,
      features,
    };
  }
}
