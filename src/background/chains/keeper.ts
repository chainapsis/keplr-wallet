import { AccessOrigin, ChainInfo } from "./types";
import { ExtensionAccessOrigins, NativeChainInfos } from "../../config";
import { KVStore } from "../../common/kvstore";
import { AsyncApprover } from "../../common/async-approver";
import { openWindow } from "../../common/window";

export class ChainsKeeper {
  private readonly accessRequestApprover = new AsyncApprover<AccessOrigin>({
    defaultTimeout: 3 * 60 * 1000
  });

  constructor(private kvStore: KVStore) {}

  async getChainInfos(): Promise<ChainInfo[]> {
    const chainInfos = NativeChainInfos.slice();
    const savedChainInfos = await this.kvStore.get<ChainInfo[]>("chain-infos");
    if (savedChainInfos) {
      return chainInfos.concat(savedChainInfos);
    } else {
      return chainInfos;
    }
  }

  async getChainInfo(chainId: string): Promise<ChainInfo> {
    const chainInfo = (await this.getChainInfos()).find(chainInfo => {
      return chainInfo.chainId === chainId;
    });

    if (!chainInfo) {
      throw new Error(`There is no chain info for ${chainId}`);
    }
    return chainInfo;
  }

  async requestAccess(
    id: string,
    chainId: string,
    origins: string[]
  ): Promise<void> {
    if (origins.length === 0) {
      throw new Error("Empty origin");
    }

    const accessOrigin = await this.getAccessOrigin(chainId);
    if (
      origins.every(origin => {
        return accessOrigin.origins.includes(origin);
      })
    ) {
      return;
    }

    openWindow(browser.runtime.getURL(`popup.html#/access?id=${id}`));

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

  async checkAccessOrigin(chainId: string, origin: string) {
    // If origin is from extension, just approve it.
    if (origin === new URL(browser.runtime.getURL("/")).origin) {
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
    for (const access of ExtensionAccessOrigins) {
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

  async getAccessOriginWithoutEmbeded(chainId: string): Promise<AccessOrigin> {
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
