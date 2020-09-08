import {
  AccessOrigin,
  ChainInfo,
  ChainInfoWithEmbed,
  SuggestedChainInfo
} from "./types";
import { KVStore } from "../../common/kvstore";
import { AsyncApprover } from "../../common/async-approver";
import { BIP44 } from "@chainapsis/cosmosjs/core/bip44";

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
        suggestApproverTimeout != null ? suggestApproverTimeout : 3 * 60 * 1000
    });
  }

  async getChainInfos(): Promise<ChainInfoWithEmbed[]> {
    const chainInfos = this.embedChainInfos.map(chainInfo => {
      return {
        ...chainInfo,
        embeded: true
      };
    });
    let savedChainInfos = await this.kvStore.get<ChainInfo[]>("chain-infos");
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

      return chainInfos.concat(
        savedChainInfos.map(chainInfo => {
          return {
            ...chainInfo,
            embeded: false
          };
        })
      );
    } else {
      return chainInfos;
    }
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

    const savedChainInfos =
      (await this.kvStore.get<ChainInfo[]>("chain-infos")) ?? [];

    const resultChainInfo = savedChainInfos.filter(chainInfo => {
      return chainInfo.chainId !== chainId;
    });

    await this.kvStore.set<ChainInfo[]>("chain-infos", resultChainInfo);
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

  async getAccessOrigin(chainId: string): Promise<AccessOrigin> {
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

  private static getAccessOriginKey(chainId: string): string {
    return `access-origin-${chainId}`;
  }
}
