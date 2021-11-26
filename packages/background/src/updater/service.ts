import { inject, singleton, delay } from "tsyringe";
import { TYPES } from "../types";

import { ChainInfo } from "@keplr-wallet/types";
import Axios from "axios";
import { KVStore } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ChainsService } from "../chains";

@singleton()
export class ChainUpdaterService {
  constructor(
    @inject(TYPES.UpdaterStore) protected readonly kvStore: KVStore,
    @inject(delay(() => ChainsService))
    protected readonly chainsService: ChainsService
  ) {}

  async putUpdatedPropertyToChainInfo(
    chainInfo: ChainInfo
  ): Promise<ChainInfo> {
    const updatedProperty = await this.getUpdatedChainProperty(
      chainInfo.chainId
    );

    const chainId = ChainIdHelper.parse(chainInfo.chainId);
    const updatedChainId = ChainIdHelper.parse(
      updatedProperty.chainId || chainInfo.chainId
    );

    // If the saved property is lesser than the current chain id, just ignore.
    if (updatedChainId.version < chainId.version) {
      return chainInfo;
    }

    const features = chainInfo.features ?? [];
    for (const updatedFeature of updatedProperty.features ?? []) {
      if (!features.includes(updatedFeature)) {
        features.push(updatedFeature);
      }
    }

    return {
      ...chainInfo,
      ...{
        chainId: updatedProperty.chainId || chainInfo.chainId,
        features,
      },
    };
  }

  async clearUpdatedProperty(chainId: string) {
    await this.kvStore.set(ChainIdHelper.parse(chainId).identifier, null);

    this.chainsService.clearCachedChainInfos();
  }

  async tryUpdateChain(chainId: string) {
    const chainInfo = await this.chainsService.getChainInfo(chainId);

    // If chain id is not fomatted as {chainID}-{version},
    // there is no way to deal with the updated chain id.
    if (!ChainIdHelper.hasChainVersion(chainInfo.chainId)) {
      return;
    }

    const updates = await ChainUpdaterService.checkChainUpdate(chainInfo);

    if (updates.explicit || updates.slient) {
      const currentVersion = ChainIdHelper.parse(chainInfo.chainId);

      if (updates.chainId) {
        const fetchedChainId = updates.chainId;
        const fetchedVersion = ChainIdHelper.parse(fetchedChainId);

        if (
          currentVersion.identifier === fetchedVersion.identifier &&
          currentVersion.version < fetchedVersion.version
        ) {
          await this.saveChainProperty(currentVersion.identifier, {
            chainId: fetchedChainId,
          });
        }
      }

      if (updates.features && updates.features.length > 0) {
        const savedChainProperty = await this.getUpdatedChainProperty(
          chainInfo.chainId
        );

        const updateFeatures = savedChainProperty.features ?? [];

        for (const feature of updates.features) {
          if (!updateFeatures.includes(feature)) {
            updateFeatures.push(feature);
          }
        }

        await this.saveChainProperty(currentVersion.identifier, {
          features: updateFeatures,
        });
      }
    }
  }

  private async getUpdatedChainProperty(
    chainId: string
  ): Promise<Partial<ChainInfo>> {
    const version = ChainIdHelper.parse(chainId);

    return await this.loadChainProperty(version.identifier);
  }

  private async saveChainProperty(
    identifier: string,
    chainInfo: Partial<ChainInfo>
  ) {
    const saved = await this.loadChainProperty(identifier);

    await this.kvStore.set(identifier, {
      ...saved,
      ...chainInfo,
    });

    this.chainsService.clearCachedChainInfos();
  }

  private async loadChainProperty(
    identifier: string
  ): Promise<Partial<ChainInfo>> {
    const chainInfo = await this.kvStore.get<Partial<ChainInfo>>(identifier);
    if (!chainInfo) return {};
    return chainInfo;
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
          network: "osmosis-1";
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

    const restInstance = Axios.create({
      baseURL: chainInfo.rest,
    });

    let staragteUpdate = false;
    try {
      if (!chainInfo.features || !chainInfo.features.includes("stargate")) {
        // If the chain doesn't have the stargate feature,
        // but it can use the GRPC HTTP Gateway,
        // assume that it can support the stargate and try to update the features.
        await restInstance.get("/cosmos/base/tendermint/v1beta1/node_info");
        staragteUpdate = true;
      }
    } catch {}

    let ibcGoUpdates = false;
    try {
      if (
        (!chainInfo.features || !chainInfo.features.includes("ibc-go")) &&
        (staragteUpdate ||
          (chainInfo.features && chainInfo.features.includes("stargate")))
      ) {
        // If the chain uses the ibc-go module separated from the cosmos-sdk,
        // we need to check it because the REST API is different.
        const result = await restInstance.get<{
          params: {
            receive_enabled: boolean;
            send_enabled: boolean;
          };
        }>("/ibc/apps/transfer/v1/params");

        if (result.status === 200) {
          ibcGoUpdates = true;
        }
      }
    } catch {}

    let ibcTransferUpdate = false;
    try {
      if (
        (!chainInfo.features || !chainInfo.features.includes("ibc-transfer")) &&
        (staragteUpdate ||
          (chainInfo.features && chainInfo.features.includes("stargate")))
      ) {
        const isIBCGo =
          ibcGoUpdates ||
          (chainInfo.features && chainInfo.features.includes("ibc-go"));

        // If the chain doesn't have the ibc transfer feature,
        // try to fetch the params of ibc transfer module.
        // assume that it can support the ibc transfer if the params return true, and try to update the features.
        const result = await restInstance.get<{
          params: {
            receive_enabled: boolean;
            send_enabled: boolean;
          };
        }>(
          isIBCGo
            ? "/ibc/apps/transfer/v1/params"
            : "/ibc/applications/transfer/v1beta1/params"
        );
        if (
          result.data.params.receive_enabled &&
          result.data.params.send_enabled
        ) {
          ibcTransferUpdate = true;
        }
      }
    } catch {}

    let noLegacyStdTxUpdate = false;
    try {
      if (
        (!chainInfo.features ||
          !chainInfo.features.includes("no-legacy-stdTx")) &&
        (staragteUpdate ||
          (chainInfo.features && chainInfo.features.includes("stargate")))
      ) {
        // The chain with above cosmos-sdk@v0.44.0 can't send the legacy stdTx,
        // Assume that it can't send the legacy stdTx if the POST /txs responses "not implemented".
        const result = await restInstance.post<
          | {
              code: 12;
              message: "Not Implemented";
              details: [];
            }
          | any
        >("/txs", undefined, {
          validateStatus: (status) => {
            return (status >= 200 && status < 300) || status === 501;
          },
        });
        if (
          result.status === 501 &&
          result.data.code === 12 &&
          result.data.message === "Not Implemented"
        ) {
          noLegacyStdTxUpdate = true;
        }
      }
    } catch {}

    const features: string[] = [];
    if (staragteUpdate) {
      features.push("stargate");
    }
    if (ibcGoUpdates) {
      features.push("ibc-go");
    }
    if (ibcTransferUpdate) {
      features.push("ibc-transfer");
    }
    if (noLegacyStdTxUpdate) {
      features.push("no-legacy-stdTx");
    }

    return {
      explicit: version.version < fetchedVersion.version,
      slient:
        staragteUpdate ||
        ibcGoUpdates ||
        ibcTransferUpdate ||
        noLegacyStdTxUpdate,

      chainId: resultChainId,
      features,
    };
  }
}
