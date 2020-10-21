import { ChainInfo } from "../chains";
import Axios from "axios";
import { KVStore } from "../../common/kvstore";

// IsVersionFormat checks if a chainID is in the format required for parsing versions
// The chainID must be in the form: `{identifier}-{version}`
const VersionFormatRegExp = /(.+)-([\d]+)/;

export class ChainUpdaterKeeper {
  constructor(private readonly kvStore: KVStore) {}

  async putUpdatedPropertyToChainInfo(
    chainInfo: ChainInfo
  ): Promise<ChainInfo> {
    const updatedProperty = await this.getUpdatedChainProperty(
      chainInfo.chainId
    );

    return {
      ...chainInfo,
      ...updatedProperty
    };
  }

  async clearUpdatedProperty(chainId: string) {
    await this.kvStore.set(
      ChainUpdaterKeeper.getChainVersion(chainId).identifier,
      null
    );
  }

  async tryUpdateChainId(chainInfo: ChainInfo): Promise<string> {
    // If chain id is not fomatted as {chainID}-{version},
    // there is no way to deal with the updated chain id.
    if (!ChainUpdaterKeeper.hasChainVersion(chainInfo.chainId)) {
      return chainInfo.chainId;
    }

    const instance = Axios.create({
      baseURL: chainInfo.rpc
    });

    // Get the latest block.
    const result = await instance.get<{
      result: {
        block: {
          header: {
            chain_id: string;
          };
        };
      };
    }>("/block");

    let resultChainId = chainInfo.chainId;
    const version = ChainUpdaterKeeper.getChainVersion(chainInfo.chainId);
    const fetchedChainId = result.data.result.block.header.chain_id;

    if (chainInfo.chainId !== fetchedChainId) {
      const fetchedVersion = ChainUpdaterKeeper.getChainVersion(fetchedChainId);

      // TODO: Should throw an error?
      if (version.identifier !== fetchedVersion.identifier) {
        return chainInfo.chainId;
      }

      if (fetchedVersion.version > version.version) {
        resultChainId = fetchedChainId;
      }
    }

    if (resultChainId !== chainInfo.chainId) {
      await this.saveChainProperty(version.identifier, {
        chainId: resultChainId
      });
    }

    return resultChainId;
  }

  private async getUpdatedChainProperty(
    chainId: string
  ): Promise<Partial<ChainInfo>> {
    let resultChainId = chainId;

    const version = ChainUpdaterKeeper.getChainVersion(chainId);

    // Handle the chain id if it was updated.
    const chainInfo = await this.loadChainProperty(version.identifier);
    if (chainInfo.chainId) {
      const updatedVersion = ChainUpdaterKeeper.getChainVersion(
        chainInfo.chainId
      );
      if (updatedVersion.version > version.version) {
        resultChainId = chainInfo.chainId;
      }
    }

    return {
      chainId: resultChainId
    };
  }

  private async saveChainProperty(
    identifier: string,
    chainInfo: Partial<ChainInfo>
  ) {
    const saved = await this.loadChainProperty(identifier);

    await this.kvStore.set(identifier, {
      ...saved,
      ...chainInfo
    });
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
  ): Promise<boolean> {
    const chainId = chainInfo.chainId;

    // If chain id is not fomatted as {chainID}-{version},
    // there is no way to deal with the updated chain id.
    if (!ChainUpdaterKeeper.hasChainVersion(chainId)) {
      return false;
    }

    const instance = Axios.create({
      baseURL: chainInfo.rpc
    });

    // Get the latest block.
    const result = await instance.get<{
      result: {
        block: {
          header: {
            chain_id: string;
          };
        };
      };
    }>("/block");

    const resultChainId = result.data.result.block.header.chain_id;

    return chainId !== resultChainId;
  }

  static getChainVersion(
    chainId: string
  ): { identifier: string; version: number } {
    const split = chainId.split(VersionFormatRegExp).filter(Boolean);
    if (split.length !== 2) {
      return {
        identifier: chainId,
        version: 0
      };
    } else {
      return { identifier: split[0], version: parseInt(split[1]) };
    }
  }

  static hasChainVersion(chainId: string) {
    const version = ChainUpdaterKeeper.getChainVersion(chainId);
    return version.identifier !== chainId;
  }
}
