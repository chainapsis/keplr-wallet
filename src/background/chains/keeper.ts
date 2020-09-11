import {
  AccessOrigin,
  ChainInfo,
  ChainInfoWithEmbed,
  SuggestedChainInfo
} from "./types";
import { KVStore } from "../../common/kvstore";
import { AsyncApprover } from "../../common/async-approver";
import { BIP44 } from "@chainapsis/cosmosjs/core/bip44";
import Axios from "axios";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export class ChainsKeeper {
  private readonly accessRequestApprover: AsyncApprover<AccessOrigin>;
  private readonly suggestApprover: AsyncApprover<SuggestedChainInfo>;

  constructor(
    private kvStore: KVStore,
    private readonly embedChainInfos: ChainInfo[],
    private readonly embedAccessOrigins: AccessOrigin[],
    private readonly windowOpener: (url: string) => void,
    signApproverTimeout: number | undefined = undefined,
    suggestApproverTimeout: number | undefined = undefined
  ) {
    this.accessRequestApprover = new AsyncApprover<AccessOrigin>({
      defaultTimeout:
        signApproverTimeout != null ? signApproverTimeout : 3 * 60 * 1000
    });

    this.suggestApprover = new AsyncApprover<SuggestedChainInfo>({
      defaultTimeout:
        suggestApproverTimeout != null ? suggestApproverTimeout : 3 * 60 * 1000,
      validateId: id => {
        if (id.length >= 30) {
          throw new Error("Too long id");
        }
      }
    });

    // TODO: Handle the case that the embeded chains and dynamically added chain has overlaps.
  }

  async getChainInfos(
    applyUpdatedProperty: boolean = true
  ): Promise<ChainInfoWithEmbed[]> {
    const chainInfos = this.embedChainInfos.map(chainInfo => {
      return {
        ...chainInfo,
        embeded: true
      };
    });
    let savedChainInfos = await this.kvStore.get<ChainInfo[]>("chain-infos");

    let result: ChainInfoWithEmbed[] = chainInfos;

    if (savedChainInfos) {
      // Should restore the prototype because BIP44 is the class.
      savedChainInfos = savedChainInfos.map(
        (chainInfo: Writeable<ChainInfo>) => {
          chainInfo.bip44 = Object.setPrototypeOf(
            chainInfo.bip44,
            BIP44.prototype
          );
          return chainInfo;
        }
      );

      result = result.concat(
        savedChainInfos.map(chainInfo => {
          return {
            ...chainInfo,
            embeded: false
          };
        })
      );
    }

    if (applyUpdatedProperty) {
      // Set the updated property of the chain.
      result = await Promise.all(
        result.map(async chainInfo => {
          const updatedChainInfo = await this.getUpdatedChainProperty(
            chainInfo.chainId
          );
          if (updatedChainInfo) {
            return {
              ...chainInfo,
              ...updatedChainInfo
            };
          }
          return chainInfo;
        })
      );
    }

    return result;
  }

  async getChainInfo(chainId: string): Promise<ChainInfoWithEmbed> {
    const chainInfo = (await this.getChainInfos()).find(chainInfo => {
      return chainInfo.chainId === chainId;
    });

    if (!chainInfo) {
      throw new Error(`There is no chain info for ${chainId}`);
    }
    return chainInfo;
  }

  async hasChainInfo(chainId: string): Promise<boolean> {
    return (
      (await this.getChainInfos()).find(chainInfo => {
        return chainInfo.chainId === chainId;
      }) != null
    );
  }

  async suggestChainInfo(
    chainInfo: ChainInfo,
    extensionBaseURL: string,
    openPopup: boolean,
    origin: string
  ): Promise<void> {
    // TODO: Validate the chain info's fields.

    if (openPopup) {
      this.windowOpener(
        `${extensionBaseURL}popup.html#/suggest-chain/${chainInfo.chainId}`
      );
    }

    await this.suggestApprover.request(chainInfo.chainId, {
      ...chainInfo,
      origin
    });

    await this.addChainInfo(chainInfo);
  }

  getSuggestedChainInfo(chainId: string): SuggestedChainInfo {
    const chainInfo = this.suggestApprover.getData(chainId);
    if (!chainInfo) {
      throw new Error("Unknown suggested chain");
    }

    return chainInfo;
  }

  approveSuggestChain(chainId: string) {
    this.suggestApprover.approve(chainId);
  }

  rejectSuggestChain(chainId: string) {
    this.suggestApprover.reject(chainId);
  }

  async addChainInfo(chainInfo: ChainInfo): Promise<void> {
    if (await this.hasChainInfo(chainInfo.chainId)) {
      throw new Error("Same chain is already registered");
    }

    const savedChainInfos =
      (await this.kvStore.get<ChainInfo[]>("chain-infos")) ?? [];
    savedChainInfos.push(chainInfo);

    await this.kvStore.set<ChainInfo[]>("chain-infos", savedChainInfos);
  }

  async removeChainInfo(chainId: string): Promise<void> {
    if (!(await this.hasChainInfo(chainId))) {
      throw new Error("Chain is not registered");
    }

    if ((await this.getChainInfo(chainId)).embeded) {
      throw new Error("Can't remove the embedded chain");
    }

    // If chain id is updated, get the original chain id.
    const originChainId = await this.getReverseUpdatedChainId(chainId);

    const savedChainInfos =
      (await this.kvStore.get<ChainInfo[]>("chain-infos")) ?? [];

    const resultChainInfo = savedChainInfos.filter(chainInfo => {
      return chainInfo.chainId !== (originChainId ?? chainId);
    });

    await this.kvStore.set<ChainInfo[]>("chain-infos", resultChainInfo);

    // Clear the updated chain info.
    await this.removeUpdatedChainProperty(chainId);

    // Clear the access origin.
    await this.clearAccessOrigins(chainId);
  }

  async requestAccess(
    extensionBaseURL: string,
    id: string,
    chainId: string,
    origins: string[]
  ): Promise<void> {
    if (origins.length === 0) {
      throw new Error("Empty origin");
    }

    // Will throw an error if chain is unknown.
    await this.getChainInfo(chainId);

    const accessOrigin = await this.getAccessOrigin(chainId);
    if (
      origins.every(origin => {
        return accessOrigin.origins.includes(origin);
      })
    ) {
      return;
    }

    this.windowOpener(`${extensionBaseURL}popup.html#/access?id=${id}`);

    await this.accessRequestApprover.request(id, {
      chainId,
      origins
    });

    for (const origin of origins) {
      this.addAccessOrigin(chainId, origin);
    }
  }

  getRequestAccessData(id: string): AccessOrigin {
    const data = this.accessRequestApprover.getData(id);
    if (!data) {
      throw new Error("Empty data");
    }
    return data;
  }

  approveAccess(id: string) {
    this.accessRequestApprover.approve(id);
  }

  rejectAccess(id: string) {
    this.accessRequestApprover.reject(id);
  }

  async checkAccessOrigin(
    extensionBaseURL: string,
    chainId: string,
    origin: string
  ) {
    // If origin is from extension, just approve it.
    if (origin === new URL(extensionBaseURL).origin) {
      return;
    }

    const accessOrigin = await this.getAccessOrigin(chainId);
    if (accessOrigin.origins.indexOf(origin) <= -1) {
      throw new Error("This origin is not approved");
    }
  }

  async addAccessOrigin(chainId: string, origin: string): Promise<void> {
    // If chain id is updated, get the original chain id.
    const originChainId = await this.getReverseUpdatedChainId(chainId);
    // Override the chain id if the chain was updated.
    chainId = originChainId ?? chainId;

    let accessOrigin = await this.kvStore.get<AccessOrigin>(
      ChainsKeeper.getAccessOriginKey(chainId)
    );
    if (!accessOrigin) {
      accessOrigin = {
        chainId,
        origins: []
      };
    }

    accessOrigin.origins.push(origin);

    await this.kvStore.set<AccessOrigin>(
      ChainsKeeper.getAccessOriginKey(chainId),
      accessOrigin
    );
  }

  async removeAccessOrigin(chainId: string, origin: string): Promise<void> {
    // If chain id is updated, get the original chain id.
    const originChainId = await this.getReverseUpdatedChainId(chainId);
    // Override the chain id if the chain was updated.
    chainId = originChainId ?? chainId;

    const accessOrigin = await this.kvStore.get<AccessOrigin>(
      ChainsKeeper.getAccessOriginKey(chainId)
    );
    if (!accessOrigin) {
      throw new Error("There is no matched origin");
    }

    const i = accessOrigin.origins.indexOf(origin);
    if (i < 0) {
      throw new Error("There is no matched origin");
    }

    accessOrigin.origins = accessOrigin.origins
      .slice(0, i)
      .concat(accessOrigin.origins.slice(i + 1));

    await this.kvStore.set<AccessOrigin>(
      ChainsKeeper.getAccessOriginKey(chainId),
      accessOrigin
    );
  }

  async clearAccessOrigins(chainId: string): Promise<void> {
    // If chain id is updated, get the original chain id.
    const originChainId = await this.getReverseUpdatedChainId(chainId);
    // Override the chain id if the chain was updated.
    chainId = originChainId ?? chainId;

    await this.kvStore.set<AccessOrigin>(
      ChainsKeeper.getAccessOriginKey(chainId),
      null
    );
  }

  async getAccessOrigin(chainId: string): Promise<AccessOrigin> {
    // If chain id is updated, get the original chain id.
    const originChainId = await this.getReverseUpdatedChainId(chainId);
    // Override the chain id if the chain was updated.
    chainId = originChainId ?? chainId;

    let nativeAccessOrigins: string[] = [];
    for (const access of this.embedAccessOrigins) {
      if (access.chainId === chainId) {
        nativeAccessOrigins = access.origins.slice();
        break;
      }
    }

    const accessOrigin = await this.kvStore.get<AccessOrigin>(
      ChainsKeeper.getAccessOriginKey(chainId)
    );
    if (accessOrigin) {
      return {
        chainId: accessOrigin.chainId,
        origins: nativeAccessOrigins.concat(accessOrigin.origins)
      };
    } else {
      return {
        chainId,
        origins: nativeAccessOrigins
      };
    }
  }

  async getAccessOriginWithoutEmbed(chainId: string): Promise<AccessOrigin> {
    // If chain id is updated, get the original chain id.
    const originChainId = await this.getReverseUpdatedChainId(chainId);
    // Override the chain id if the chain was updated.
    chainId = originChainId ?? chainId;

    const accessOrigin = await this.kvStore.get<AccessOrigin>(
      ChainsKeeper.getAccessOriginKey(chainId)
    );
    if (accessOrigin) {
      return {
        chainId: accessOrigin.chainId,
        origins: accessOrigin.origins
      };
    } else {
      return {
        chainId,
        origins: []
      };
    }
  }

  async tryUpdateChain(chainId: string): Promise<string> {
    const chainInfo = await this.getChainInfo(chainId);

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

    if (chainInfo.chainId !== resultChainId) {
      // If the same chain is already registered, just remove it.
      if (
        (await this.getChainInfos()).find(
          chainInfo => chainInfo.chainId === resultChainId
        )
      ) {
        await this.removeChainInfo(chainId);
        return resultChainId;
      }

      const updatedChainInfo: Partial<ChainInfo> = {
        chainId: resultChainId
      };

      await this.setUpdatedChainProperty(chainInfo.chainId, updatedChainInfo);
      return resultChainId;
    }

    return chainInfo.chainId;
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

  private async setUpdatedChainProperty(
    chainId: string,
    updatedChainInfo: Partial<ChainInfo>
  ): Promise<void> {
    await this.kvStore.set(
      ChainsKeeper.getUpdatedChainPropertyKey(chainId),
      updatedChainInfo
    );

    await this.kvStore.set(
      ChainsKeeper.getUpdatedChainPropertyReverseKey(
        updatedChainInfo.chainId ?? chainId
      ),
      chainId
    );
  }

  private async getUpdatedChainProperty(
    chainId: string
  ): Promise<Partial<ChainInfo> | undefined> {
    return await this.kvStore.get(
      ChainsKeeper.getUpdatedChainPropertyKey(chainId)
    );
  }

  private async getReverseUpdatedChainId(
    chainId: string
  ): Promise<string | undefined> {
    let prevOriginChainId: string | undefined;
    // Get the original chain id before being updated.
    while (true) {
      const originChainId = await this.kvStore.get<string>(
        ChainsKeeper.getUpdatedChainPropertyReverseKey(
          prevOriginChainId ?? chainId
        )
      );
      if (!originChainId) {
        return prevOriginChainId;
      }

      prevOriginChainId = originChainId;
    }
  }

  private async removeUpdatedChainProperty(chainId: string): Promise<void> {
    let prevChainId = chainId;
    while (true) {
      const updatedChainInfo = await this.getUpdatedChainProperty(prevChainId);
      if (updatedChainInfo) {
        await this.kvStore.set(
          ChainsKeeper.getUpdatedChainPropertyKey(prevChainId),
          null
        );
        await this.kvStore.set(
          ChainsKeeper.getUpdatedChainPropertyReverseKey(
            updatedChainInfo.chainId ?? prevChainId
          ),
          null
        );

        prevChainId = updatedChainInfo.chainId ?? prevChainId;
      } else {
        break;
      }
    }
  }

  private static getAccessOriginKey(chainId: string): string {
    return `access-origin-${chainId}`;
  }

  private static getUpdatedChainPropertyKey(chainId: string): string {
    return `updated-chain-property-${chainId}`;
  }

  private static getUpdatedChainPropertyReverseKey(chainId: string): string {
    return `updated-chain-property-reverse-${chainId}`;
  }
}
