import { InteractionService } from "../interaction";
import { Env, KeplrError } from "@keplr-wallet/router";
import {
  getBasicAccessPermissionType,
  GlobalPermissionData,
  INTERACTION_TYPE_GLOBAL_PERMISSION,
  INTERACTION_TYPE_PERMISSION,
  PermissionData,
} from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ChainInfo } from "@keplr-wallet/types";

export class PermissionService {
  protected globalPermissionMap: {
    [type: string]:
      | {
          [origin: string]: true | undefined;
        }
      | undefined;
  } = {};

  protected permissionMap: {
    [chainIdentifier: string]:
      | {
          [type: string]:
            | {
                [origin: string]: true | undefined;
              }
            | undefined;
        }
      | undefined;
  } = {};

  protected privilegedOrigins: Map<string, boolean> = new Map();

  protected interactionService!: InteractionService;
  protected chainsService!: ChainsService;
  protected keyRingService!: KeyRingService;

  constructor(
    protected readonly kvStore: KVStore,
    privilegedOrigins: string[]
  ) {
    for (const origin of privilegedOrigins) {
      this.privilegedOrigins.set(origin, true);
    }

    this.restore();
  }

  init(
    interactionService: InteractionService,
    chainsService: ChainsService,
    keyRingService: KeyRingService
  ) {
    this.interactionService = interactionService;
    this.chainsService = chainsService;
    this.keyRingService = keyRingService;

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

  protected readonly onChainRemoved = (chainInfo: ChainInfo) => {
    this.removeAllPermissions(chainInfo.chainId);
  };

  async checkOrGrantBasicAccessPermission(
    env: Env,
    chainIds: string | string[],
    origin: string
  ) {
    // Try to unlock the key ring before checking or granting the basic permission.
    await this.keyRingService.enable(env);

    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    const ungrantedChainIds: string[] = [];
    for (const chainId of chainIds) {
      if (!this.hasPermisson(chainId, getBasicAccessPermissionType(), origin)) {
        ungrantedChainIds.push(chainId);
      }
    }

    if (ungrantedChainIds.length > 0) {
      await this.grantBasicAccessPermission(env, ungrantedChainIds, [origin]);
    }

    await this.checkBasicAccessPermission(env, chainIds, origin);
  }

  async disable(env: Env, chainIds: string | string[], origin: string) {
    // Delete permissions granted to origin.
    // If chain ids are specified, only the permissions granted to each chain id are deleted (In this case, permissions such as getChainInfosWithoutEndpoints() are not deleted).
    // Else, remove all permissions granted to origin (In this case, permissions that are not assigned to each chain, such as getChainInfosWithoutEndpoints(), are also deleted).

    await this.keyRingService.enable(env);

    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    if (chainIds.length > 0) {
      for (const chainId of chainIds) {
        await this.removeAllTypePermissionToChainId(chainId, [origin]);
      }
    } else {
      await this.removeAllTypePermission([origin]);
      await this.removeAllTypeGlobalPermission([origin]);
    }
  }

  async checkOrGrantPermission(
    env: Env,
    url: string,
    chainIds: string[],
    type: string,
    origin: string
  ) {
    // TODO: Merge with `checkOrGrantBasicAccessPermission` method

    // Try to unlock the key ring before checking or granting the basic permission.
    await this.keyRingService.enable(env);

    const ungrantedChainIds: string[] = [];
    for (const chainId of chainIds) {
      if (!this.hasPermisson(chainId, type, origin)) {
        ungrantedChainIds.push(chainId);
      }
    }

    if (ungrantedChainIds.length > 0) {
      await this.grantPermission(env, url, ungrantedChainIds, type, [origin]);
    }

    for (const chainId of chainIds) {
      this.checkPermission(env, chainId, type, origin);
    }
  }

  async checkOrGrantGlobalPermission(
    env: Env,
    url: string,
    type: string,
    origin: string
  ) {
    // Try to unlock the key ring before checking or granting the basic permission.
    await this.keyRingService.enable(env);

    if (!this.hasGlobalPermission(type, origin)) {
      await this.grantGlobalPermission(env, url, type, [origin]);
    }

    this.checkGlobalPermission(env, type, origin);
  }

  async grantPermission(
    env: Env,
    url: string,
    chainIds: string[],
    type: string,
    origins: string[]
  ) {
    if (env.isInternalMsg) {
      return;
    }

    const permissionData: PermissionData = {
      chainIds,
      type,
      origins,
    };

    await this.interactionService.waitApprove(
      env,
      url,
      INTERACTION_TYPE_PERMISSION,
      permissionData
    );

    await this.addPermission(chainIds, type, origins);
  }

  async grantBasicAccessPermission(
    env: Env,
    chainIds: string[],
    origins: string[]
  ) {
    for (const chainId of chainIds) {
      // Make sure that the chain info is registered.
      await this.chainsService.getChainInfo(chainId);
    }

    await this.grantPermission(
      env,
      "/access",
      chainIds,
      getBasicAccessPermissionType(),
      origins
    );
  }

  async grantGlobalPermission(
    env: Env,
    url: string,
    type: string,
    origins: string[]
  ) {
    if (env.isInternalMsg) {
      return;
    }

    const permissionData: GlobalPermissionData = {
      type,
      origins,
    };

    await this.interactionService.waitApprove(
      env,
      url,
      INTERACTION_TYPE_GLOBAL_PERMISSION,
      permissionData
    );

    await this.addGlobalPermission(type, origins);
  }

  checkPermission(env: Env, chainId: string, type: string, origin: string) {
    if (env.isInternalMsg) {
      return;
    }

    if (!this.hasPermisson(chainId, type, origin)) {
      throw new KeplrError("permission", 130, `${origin} is not permitted`);
    }
  }

  async checkBasicAccessPermission(
    env: Env,
    chainIds: string[],
    origin: string
  ) {
    for (const chainId of chainIds) {
      // Make sure that the chain info is registered.
      await this.chainsService.getChainInfo(chainId);

      this.checkPermission(
        env,
        chainId,
        getBasicAccessPermissionType(),
        origin
      );
    }
  }

  checkGlobalPermission(env: Env, type: string, origin: string) {
    if (env.isInternalMsg) {
      return;
    }

    if (!this.hasGlobalPermission(type, origin)) {
      throw new KeplrError("permission", 130, `${origin} is not permitted`);
    }
  }

  hasPermisson(chainId: string, type: string, origin: string): boolean {
    // Privileged origin can pass the any permission.
    if (this.privilegedOrigins.get(origin)) {
      return true;
    }

    const permissionsInChain = this.permissionMap[
      ChainIdHelper.parse(chainId).identifier
    ];
    if (!permissionsInChain) {
      return false;
    }

    const innerMap = permissionsInChain[type];
    return !(!innerMap || !innerMap[origin]);
  }

  hasGlobalPermission(type: string, origin: string): boolean {
    // Privileged origin can pass the any permission.
    if (this.privilegedOrigins.get(origin)) {
      return true;
    }

    const originMap = this.globalPermissionMap[type];
    if (!originMap) {
      return false;
    }

    return !!originMap[origin];
  }

  getPermissionOrigins(chainId: string, type: string): string[] {
    const origins = [];

    const permissionsInChain = this.permissionMap[
      ChainIdHelper.parse(chainId).identifier
    ];
    if (!permissionsInChain) {
      return [];
    }

    const innerMap = permissionsInChain[type];
    if (!innerMap) {
      return [];
    }

    for (const origin of Object.keys(innerMap)) {
      if (innerMap[origin]) {
        origins.push(origin);
      }
    }

    return origins;
  }

  getGlobalPermissionOrigins(type: string): string[] {
    const originMap = {
      ...this.globalPermissionMap[type],
    };

    return Object.keys(originMap).filter((origin) => {
      return originMap[origin];
    });
  }

  getOriginPermittedChains(origin: string, type: string): string[] {
    const chains: string[] = [];

    for (const chain of Object.keys(this.permissionMap)) {
      const permissionInChain = this.permissionMap[chain];

      const originMap =
        (permissionInChain ? permissionInChain[type] : undefined) ?? {};

      for (const _origin of Object.keys(originMap)) {
        if (_origin === origin && originMap[_origin]) {
          chains.push(chain);
        }
      }
    }

    return chains;
  }

  async addPermission(chainIds: string[], type: string, origins: string[]) {
    for (const chainId of chainIds) {
      let permissionsInChain = this.permissionMap[
        ChainIdHelper.parse(chainId).identifier
      ];
      if (!permissionsInChain) {
        permissionsInChain = {};
        this.permissionMap[
          ChainIdHelper.parse(chainId).identifier
        ] = permissionsInChain;
      }

      let innerMap = permissionsInChain[type];
      if (!innerMap) {
        innerMap = {};
        permissionsInChain[type] = innerMap;
      }

      for (const origin of origins) {
        innerMap[origin] = true;
      }
    }

    await this.save();
  }

  async addGlobalPermission(type: string, origins: string[]) {
    const originMap = {
      ...this.globalPermissionMap[type],
    };

    for (const origin of origins) {
      originMap[origin] = true;
    }

    this.globalPermissionMap[type] = originMap;

    await this.save();
  }

  async removePermission(chainId: string, type: string, origins: string[]) {
    const permissionsInChain = this.permissionMap[
      ChainIdHelper.parse(chainId).identifier
    ];
    if (!permissionsInChain) {
      return;
    }

    const innerMap = permissionsInChain[type];
    if (!innerMap) {
      return;
    }

    for (const origin of origins) {
      delete innerMap[origin];
    }

    await this.save();
  }

  async removeAllTypePermission(origins: string[]) {
    for (const identifier of Object.keys(this.permissionMap)) {
      const permissionsInChain = this.permissionMap[identifier];
      if (!permissionsInChain) {
        return;
      }

      for (const type of Object.keys(permissionsInChain)) {
        const innerMap = permissionsInChain[type];
        if (!innerMap) {
          return;
        }

        for (const origin of origins) {
          delete innerMap[origin];
        }
      }
    }

    await this.save();
  }

  async removeAllTypePermissionToChainId(chainId: string, origins: string[]) {
    const permissionsInChain = this.permissionMap[
      ChainIdHelper.parse(chainId).identifier
    ];
    if (!permissionsInChain) {
      return;
    }

    for (const type of Object.keys(permissionsInChain)) {
      const innerMap = permissionsInChain[type];
      if (!innerMap) {
        return;
      }

      for (const origin of origins) {
        delete innerMap[origin];
      }
    }

    await this.save();
  }

  async removeGlobalPermission(type: string, origins: string[]) {
    const originMap = {
      ...this.globalPermissionMap[type],
    };

    for (const origin of origins) {
      delete originMap[origin];
    }

    this.globalPermissionMap[type] = originMap;

    await this.save();
  }

  async removeAllTypeGlobalPermission(origins: string[]) {
    for (const type of Object.keys(this.globalPermissionMap)) {
      const originMap = {
        ...this.globalPermissionMap[type],
      };

      for (const origin of origins) {
        delete originMap[origin];
      }

      this.globalPermissionMap[type] = originMap;
    }

    await this.save();
  }

  async removeAllPermissions(chainId: string) {
    this.permissionMap[ChainIdHelper.parse(chainId).identifier] = undefined;

    await this.save();
  }

  protected async restore() {
    const map = await this.kvStore.get<any>("permissionMap");
    if (map) {
      this.permissionMap = map;
    }
    const globalMap = await this.kvStore.get<any>("globalPermissionMap");
    if (globalMap) {
      this.globalPermissionMap = globalMap;
    }
  }

  protected async save() {
    await this.kvStore.set("permissionMap", this.permissionMap);
    await this.kvStore.set("globalPermissionMap", this.globalPermissionMap);
  }
}
