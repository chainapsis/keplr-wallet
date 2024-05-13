import { InteractionService } from "../interaction";
import { Env, KeplrError } from "@keplr-wallet/router";
import {
  AllPermissionDataPerOrigin,
  EVMPermissionData,
  getBasicAccessPermissionType,
  getEVMAccessPermissionType,
  GlobalPermissionData,
  INTERACTION_TYPE_GLOBAL_PERMISSION,
  INTERACTION_TYPE_PERMISSION,
  INTERACTION_TYPE_EVM_PERMISSION,
  PermissionData,
} from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainsService } from "../chains";
import { ChainInfo } from "@keplr-wallet/types";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { migrate } from "./migrate";
import { computedFn } from "mobx-utils";
import { PermissionKeyHelper } from "./helper";

export class PermissionService {
  @observable
  protected permissionMap: Map<string, true> = new Map();

  protected privilegedOrigins: Map<string, boolean> = new Map();

  @observable
  protected defaultChainIdPermittedOriginMap: Map<string, string> = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    privilegedOrigins: string[],
    protected readonly interactionService: InteractionService,
    protected readonly chainsService: ChainsService
  ) {
    makeObservable(this);

    for (const origin of privilegedOrigins) {
      this.privilegedOrigins.set(origin, true);
    }

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

  async init() {
    const migration = await migrate(this.kvStore);
    if (migration) {
      runInAction(() => {
        for (const key of Object.keys(migration)) {
          const granted = migration[key];
          if (granted) {
            this.permissionMap.set(key, true);
          }
        }
      });
    } else {
      const savedPermissionMap = await this.kvStore.get<
        Record<string, true | undefined>
      >("permissionMap/v1");
      if (savedPermissionMap) {
        runInAction(() => {
          for (const key of Object.keys(savedPermissionMap)) {
            const granted = savedPermissionMap[key];
            if (granted) {
              this.permissionMap.set(key, true);
            }
          }
        });

        const savedDefaultChainIdPermittedOriginMap = await this.kvStore.get<
          Record<string, string>
        >("defaultChainIdPermittedOriginMap/v1");
        if (savedDefaultChainIdPermittedOriginMap) {
          runInAction(() => {
            for (const key of Object.keys(
              savedDefaultChainIdPermittedOriginMap
            )) {
              this.defaultChainIdPermittedOriginMap.set(
                key,
                savedDefaultChainIdPermittedOriginMap[key]
              );
            }
          });
        }
      }
    }

    autorun(() => {
      this.kvStore.set(
        "permissionMap/v1",
        Object.fromEntries(this.permissionMap)
      );
      this.kvStore.set(
        "defaultChainIdPermittedOriginMap/v1",
        Object.fromEntries(this.defaultChainIdPermittedOriginMap)
      );
    });
  }

  protected readonly onChainRemoved = (chainInfo: ChainInfo) => {
    this.removeAllPermissions(chainInfo.chainId);
  };

  getAllPermissionDataPerOrigin(): AllPermissionDataPerOrigin {
    const data: AllPermissionDataPerOrigin = {};

    for (const key of this.permissionMap.keys()) {
      const split = PermissionKeyHelper.splitPermissionKey(key);

      const origin = split.origin;
      if (!data[origin]) {
        data[origin] = {
          permissions: [],
          globalPermissions: [],
          evmPermissions: [],
        };
      }

      switch (split.type) {
        case getBasicAccessPermissionType():
          data[origin]!.permissions.push({
            chainIdentifier: split.chainIdentifier!,
            type: split.type,
          });
          break;
        case getEVMAccessPermissionType():
          data[origin]!.evmPermissions.push({
            type: split.type,
          });
          break;
        default:
          data[origin]!.globalPermissions.push({
            type: split.type,
          });
          break;
      }
    }

    return data;
  }

  @action
  clearAllPermissions() {
    this.permissionMap.clear();
    this.defaultChainIdPermittedOriginMap.clear();
  }

  async checkOrGrantBasicAccessPermission(
    env: Env,
    chainIds: string | string[],
    origin: string
  ) {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    const ungrantedChainIds: string[] = [];
    for (const chainId of chainIds) {
      if (
        !this.hasPermission(chainId, getBasicAccessPermissionType(), origin)
      ) {
        ungrantedChainIds.push(chainId);
      }
    }

    if (ungrantedChainIds.length > 0) {
      await this.grantBasicAccessPermission(env, ungrantedChainIds, [origin]);
    }

    this.checkBasicAccessPermission(env, chainIds, origin);
  }

  async checkOrGrantPermission(
    env: Env,
    chainIds: string[],
    type: string,
    origin: string
  ) {
    // TODO: Merge with `checkOrGrantBasicAccessPermission` method

    const ungrantedChainIds: string[] = [];
    for (const chainId of chainIds) {
      if (!this.hasPermission(chainId, type, origin)) {
        ungrantedChainIds.push(chainId);
      }
    }

    if (ungrantedChainIds.length > 0) {
      await this.grantPermission(env, ungrantedChainIds, type, [origin]);
    }

    for (const chainId of chainIds) {
      this.checkPermission(env, chainId, type, origin);
    }
  }

  async checkOrGrantGlobalPermission(env: Env, type: string, origin: string) {
    if (!this.hasGlobalPermission(type, origin)) {
      await this.grantGlobalPermission(env, type, [origin]);
    }

    this.checkGlobalPermission(env, type, origin);
  }

  async checkOrGrantEVMPermission(
    env: Env,
    origin: string,
    defaultChainId?: string
  ) {
    if (!this.hasEVMPermission(origin)) {
      await this.grantEVMPermission(env, [origin], defaultChainId);
    }

    this.checkEVMPermission(env, origin);
  }

  async grantPermission(
    env: Env,
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

    await this.interactionService.waitApproveV2(
      env,
      "/permission",
      INTERACTION_TYPE_PERMISSION,
      permissionData,
      () => {
        this.addPermission(chainIds, type, origins);
      }
    );
  }

  async grantBasicAccessPermission(
    env: Env,
    chainIds: string[],
    origins: string[]
  ) {
    for (const chainId of chainIds) {
      // Make sure that the chain info is registered.
      this.chainsService.getChainInfoOrThrow(chainId);
    }

    await this.grantPermission(
      env,
      chainIds,
      getBasicAccessPermissionType(),
      origins
    );
  }

  async grantGlobalPermission(env: Env, type: string, origins: string[]) {
    if (env.isInternalMsg) {
      return;
    }

    const permissionData: GlobalPermissionData = {
      type,
      origins,
    };

    await this.interactionService.waitApproveV2(
      env,
      "/permission",
      INTERACTION_TYPE_GLOBAL_PERMISSION,
      permissionData,
      () => {
        this.addGlobalPermission(type, origins);
      }
    );
  }

  async grantEVMPermission(
    env: Env,
    origins: string[],
    defaultChainId?: string
  ) {
    if (env.isInternalMsg) {
      return;
    }

    const chainInfos = this.chainsService.getChainInfos();
    // If the defaultChainId is not provided, find the first chain info that has EVM info.
    // TODO: Provide from interaction data or UI
    defaultChainId =
      defaultChainId ??
      chainInfos.find((chainInfo) => chainInfo.evm !== undefined)?.chainId;

    if (!defaultChainId) {
      throw new Error("No EVM chain info provided");
    }

    const evmPermissionData: EVMPermissionData = {
      type: getEVMAccessPermissionType(),
      origins,
    };

    await this.interactionService.waitApproveV2(
      env,
      "/permission",
      INTERACTION_TYPE_EVM_PERMISSION,
      { ...evmPermissionData, defaultChainId },
      (
        (defaultChainId: string) => () =>
          this.addEVMPermission(origins, defaultChainId)
      )(defaultChainId)
    );
  }

  checkPermission(env: Env, chainId: string, type: string, origin: string) {
    if (env.isInternalMsg) {
      return;
    }

    if (!this.hasPermission(chainId, type, origin)) {
      throw new KeplrError("permission", 130, `${origin} is not permitted`);
    }
  }

  checkBasicAccessPermission(env: Env, chainIds: string[], origin: string) {
    if (chainIds.length === 0) {
      throw new Error("Chain ids are empty");
    }

    for (const chainId of chainIds) {
      // Make sure that the chain info is registered.
      this.chainsService.getChainInfoOrThrow(chainId);

      this.checkPermission(
        env,
        chainId,
        getBasicAccessPermissionType(),
        origin
      );
    }
  }

  hasBasicAccessPermission(
    env: Env,
    chainIds: string[],
    origin: string
  ): boolean {
    if (chainIds.length === 0) {
      throw new Error("Chain ids are empty");
    }

    if (env.isInternalMsg) {
      return true;
    }

    for (const chainId of chainIds) {
      // Make sure that the chain info is registered.
      this.chainsService.getChainInfoOrThrow(chainId);

      if (
        !this.hasPermission(chainId, getBasicAccessPermissionType(), origin)
      ) {
        return false;
      }
    }
    return true;
  }

  checkGlobalPermission(env: Env, type: string, origin: string) {
    if (env.isInternalMsg) {
      return;
    }

    if (!this.hasGlobalPermission(type, origin)) {
      throw new KeplrError("permission", 130, `${origin} is not permitted`);
    }
  }

  checkEVMPermission(env: Env, origin: string) {
    if (env.isInternalMsg) {
      return;
    }

    if (!this.hasEVMPermission(origin)) {
      throw new KeplrError("permission", 130, `${origin} is not permitted`);
    }
  }

  hasPermission(chainId: string, type: string, origin: string): boolean {
    // Privileged origin can pass the any permission.
    if (this.privilegedOrigins.get(origin)) {
      return true;
    }

    return (
      this.permissionMap.get(
        PermissionKeyHelper.getPermissionKey(chainId, type, origin)
      ) ?? false
    );
  }

  hasGlobalPermission(type: string, origin: string): boolean {
    // Privileged origin can pass the any permission.
    if (this.privilegedOrigins.get(origin)) {
      return true;
    }

    return (
      this.permissionMap.get(
        PermissionKeyHelper.getGlobalPermissionKey(type, origin)
      ) ?? false
    );
  }

  hasEVMPermission(origin: string): boolean {
    // Privileged origin can pass the any permission.
    if (this.privilegedOrigins.get(origin)) {
      return true;
    }

    return (
      (this.permissionMap.get(
        PermissionKeyHelper.getEVMPermissionKey(
          getEVMAccessPermissionType(),
          origin
        )
      ) &&
        !!this.defaultChainIdPermittedOriginMap.get(origin)) ??
      false
    );
  }

  getPermissionOrigins = computedFn(
    (chainId: string, type: string): string[] => {
      const origins = [];

      for (const key of this.permissionMap.keys()) {
        const origin = PermissionKeyHelper.getOriginFromPermissionKey(
          chainId,
          type,
          key
        );
        if (origin) {
          origins.push(origin);
        }
      }

      return origins;
    },
    {
      keepAlive: true,
    }
  );

  getGlobalPermissionOrigins = computedFn(
    (type: string): string[] => {
      const origins = [];

      for (const key of this.permissionMap.keys()) {
        const origin = PermissionKeyHelper.getOriginFromGlobalPermissionKey(
          type,
          key
        );
        if (origin) {
          origins.push(origin);
        }
      }

      return origins;
    },
    {
      keepAlive: true,
    }
  );

  getOriginPermittedChains = computedFn(
    (origin: string, type: string): string[] => {
      const chains: string[] = [];

      for (const key of this.permissionMap.keys()) {
        const chain = PermissionKeyHelper.getChainIdentifierFromPermissionKey(
          type,
          origin,
          key
        );
        if (chain) {
          chains.push(chain);
        }
      }

      return chains;
    },
    {
      keepAlive: true,
    }
  );

  @action
  addPermission(chainIds: string[], type: string, origins: string[]) {
    for (const chainId of chainIds) {
      for (const origin of origins) {
        this.permissionMap.set(
          PermissionKeyHelper.getPermissionKey(chainId, type, origin),
          true
        );
      }
    }
  }

  @action
  addGlobalPermission(type: string, origins: string[]) {
    for (const origin of origins) {
      this.permissionMap.set(
        PermissionKeyHelper.getGlobalPermissionKey(type, origin),
        true
      );
    }
  }

  @action
  addEVMPermission(origins: string[], defaultChainId: string) {
    for (const origin of origins) {
      this.permissionMap.set(
        PermissionKeyHelper.getEVMPermissionKey(
          getEVMAccessPermissionType(),
          origin
        ),
        true
      );
      this.defaultChainIdPermittedOriginMap.set(origin, defaultChainId);
    }
  }

  @action
  removePermission(chainId: string, type: string, origins: string[]) {
    for (const origin of origins) {
      this.permissionMap.delete(
        PermissionKeyHelper.getPermissionKey(chainId, type, origin)
      );
    }
  }

  @action
  removeAllTypePermission(origins: string[]) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      for (const origin of origins) {
        const typeAndOrigin =
          PermissionKeyHelper.getChainAndTypeFromPermissionKey(origin, key);
        if (typeAndOrigin) {
          deletes.push(key);
        }
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }
  }

  @action
  removeAllTypePermissionToChainId(chainId: string, origins: string[]) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      const typeAndOrigin =
        PermissionKeyHelper.getTypeAndOriginFromPermissionKey(chainId, key);
      if (typeAndOrigin && origins.includes(typeAndOrigin.origin)) {
        deletes.push(key);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }
  }

  @action
  removeGlobalPermission(type: string, origins: string[]) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      const typeAndOrigin =
        PermissionKeyHelper.getTypeAndOriginFromGlobalPermissionKey(key);
      if (
        typeAndOrigin &&
        typeAndOrigin.type === type &&
        origins.includes(typeAndOrigin.origin)
      ) {
        deletes.push(key);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }
  }

  @action
  removeAllTypeGlobalPermission(origins: string[]) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      const typeAndOrigin =
        PermissionKeyHelper.getTypeAndOriginFromGlobalPermissionKey(key);
      if (typeAndOrigin && origins.includes(typeAndOrigin.origin)) {
        deletes.push(key);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }
  }

  @action
  removeEVMPermission(type: string, origins: string[]) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      const typeAndOrigin =
        PermissionKeyHelper.getTypeAndOriginFromEVMPermissionKey(key);
      if (
        typeAndOrigin &&
        typeAndOrigin.type === type &&
        origins.includes(typeAndOrigin.origin)
      ) {
        deletes.push(key);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }
  }

  @action
  removeAllTypeEVMPermission(origins: string[]) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      const typeAndOrigin =
        PermissionKeyHelper.getTypeAndOriginFromEVMPermissionKey(key);
      if (typeAndOrigin && origins.includes(typeAndOrigin.origin)) {
        deletes.push(key);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }
  }

  @action
  removeAllPermissions(chainId: string) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      if (PermissionKeyHelper.getTypeAndOriginFromPermissionKey(chainId, key)) {
        deletes.push(key);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }
  }

  getDefaultChainIdPermittedOrigin(origin: string): string {
    const defaultChainId = this.defaultChainIdPermittedOriginMap.get(origin);

    if (!defaultChainId) {
      throw new Error("The origin has never been granted permission");
    }

    return defaultChainId;
  }

  @action
  updateDefaultChainIdPermittedOrigin(
    env: Env,
    origin: string,
    newDefaultChainId: string
  ): void {
    this.checkEVMPermission(env, origin);
    this.checkPermission(
      env,
      newDefaultChainId,
      getBasicAccessPermissionType(),
      origin
    );

    this.defaultChainIdPermittedOriginMap.set(origin, newDefaultChainId);
  }
}
