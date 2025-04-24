import { InteractionService } from "../interaction";
import { Env, KeplrError, WEBPAGE_PORT } from "@keplr-wallet/router";
import {
  AllPermissionDataPerOrigin,
  getBasicAccessPermissionType,
  GlobalPermissionData,
  INTERACTION_TYPE_GLOBAL_PERMISSION,
  INTERACTION_TYPE_PERMISSION,
  PermissionData,
  PermissionOptions,
} from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainsService } from "../chains";
import {
  ChainInfo,
  GENESIS_HASH_TO_NETWORK,
  GenesisHash,
} from "@keplr-wallet/types";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { migrate } from "./migrate";
import { computedFn } from "mobx-utils";
import { PermissionKeyHelper } from "./helper";

export class PermissionService {
  @observable
  protected permissionMap: Map<string, true> = new Map();

  protected privilegedOrigins: Map<string, boolean> = new Map();

  @observable
  protected currentChainIdForEVMByOriginMap: Map<string, string> = new Map();

  @observable
  protected currentChainIdForStarknetByOriginMap: Map<string, string> =
    new Map();

  @observable
  protected currentBaseChainIdForBitcoinByOriginMap: Map<string, string> =
    new Map();

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

        const savedCurrentChainIdForEVMByOriginMap = await this.kvStore.get<
          Record<string, string>
        >("currentChainIdForEVMByOriginMap/v1");
        if (savedCurrentChainIdForEVMByOriginMap) {
          runInAction(() => {
            for (const key of Object.keys(
              savedCurrentChainIdForEVMByOriginMap
            )) {
              this.currentChainIdForEVMByOriginMap.set(
                key,
                savedCurrentChainIdForEVMByOriginMap[key]
              );
            }
          });
        }

        const savedCurrentChainIdForStarknetByOriginMap =
          await this.kvStore.get<Record<string, string>>(
            "currentChainIdForStarknetByOriginMap/v1"
          );
        if (savedCurrentChainIdForStarknetByOriginMap) {
          runInAction(() => {
            for (const key of Object.keys(
              savedCurrentChainIdForStarknetByOriginMap
            )) {
              this.currentChainIdForStarknetByOriginMap.set(
                key,
                savedCurrentChainIdForStarknetByOriginMap[key]
              );
            }
          });
        }

        const savedCurrentBaseChainIdForBitcoinByOriginMap =
          await this.kvStore.get<Record<string, string>>(
            "currentBaseChainIdForBitcoinByOriginMap/v1"
          );
        if (savedCurrentBaseChainIdForBitcoinByOriginMap) {
          runInAction(() => {
            for (const key of Object.keys(
              savedCurrentBaseChainIdForBitcoinByOriginMap
            )) {
              this.currentBaseChainIdForBitcoinByOriginMap.set(
                key,
                savedCurrentBaseChainIdForBitcoinByOriginMap[key]
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
        "currentChainIdForEVMByOriginMap/v1",
        Object.fromEntries(this.currentChainIdForEVMByOriginMap)
      );
      this.kvStore.set(
        "currentChainIdForStarknetByOriginMap/v1",
        Object.fromEntries(this.currentChainIdForStarknetByOriginMap)
      );
      this.kvStore.set(
        "currentBaseChainIdForBitcoinByOriginMap/v1",
        Object.fromEntries(this.currentBaseChainIdForBitcoinByOriginMap)
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
        };
      }

      switch (split.type) {
        case getBasicAccessPermissionType():
          data[origin]!.permissions.push({
            chainIdentifier: split.chainIdentifier!,
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
    this.currentChainIdForEVMByOriginMap.clear();
    this.currentChainIdForStarknetByOriginMap.clear();
    this.currentBaseChainIdForBitcoinByOriginMap.clear();
  }

  async checkOrGrantBasicAccessPermission(
    env: Env,
    chainIds: string | string[],
    origin: string,
    options?: PermissionOptions
  ) {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    const ungrantedChainIds: string[] = [];
    for (const chainId of chainIds) {
      const baseChainId = this.chainsService.getBaseChainIdOrThrow(chainId);
      if (
        !this.hasPermission(baseChainId, getBasicAccessPermissionType(), origin)
      ) {
        ungrantedChainIds.push(baseChainId);
      }
    }

    if (ungrantedChainIds.length > 0) {
      await this.grantBasicAccessPermission(
        env,
        ungrantedChainIds,
        [origin],
        options
      );
    }

    // Skip the permission check `chainIds` if the permission is for EVM, Starknet, or Bitcoin.
    // Because the chain id for this permission can be changed, so it may not be the same as `chainIds`.
    if (
      !options?.isForEVM &&
      !options?.isForStarknet &&
      !options?.isForBitcoin
    ) {
      this.checkBasicAccessPermission(env, chainIds, origin);
    }
  }

  async checkOrGrantPermission(
    env: Env,
    chainIds: string[],
    type: string,
    origin: string,
    options?: PermissionOptions
  ) {
    // TODO: Merge with `checkOrGrantBasicAccessPermission` method

    const ungrantedChainIds: string[] = [];
    for (const chainId of chainIds) {
      if (!this.hasPermission(chainId, type, origin)) {
        ungrantedChainIds.push(chainId);
      }
    }

    if (ungrantedChainIds.length > 0) {
      await this.grantPermission(
        env,
        ungrantedChainIds,
        type,
        [origin],
        options
      );
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

  async grantPermission(
    env: Env,
    chainIds: string[],
    type: string,
    origins: string[],
    options?: PermissionOptions
  ) {
    if (env.isInternalMsg) {
      return;
    }

    const permissionData: PermissionData = {
      chainIds,
      type,
      origins,
      options,
    };

    await this.interactionService.waitApproveV2(
      env,
      "/permission",
      INTERACTION_TYPE_PERMISSION,
      permissionData,
      (newChainId?: string) => {
        if (options?.isForEVM) {
          const chainId = newChainId ?? chainIds[0];
          this.addPermission([chainId], type, origins);
          this.setCurrentChainIdForEVM(origins, chainId);
        } else if (options?.isForStarknet) {
          const chainId = newChainId ?? chainIds[0];
          this.addPermission([chainId], type, origins);
          this.setCurrentChainIdForStarknet(origins, chainId);
        } else if (options?.isForBitcoin) {
          const chainId = newChainId ?? chainIds[0];
          this.addPermission([chainId], type, origins);
          this.setCurrentBaseChainIdForBitcoin(origins, chainId);
        } else {
          this.addPermission(chainIds, type, origins);
        }
      }
    );
  }

  async grantBasicAccessPermission(
    env: Env,
    chainIds: string[],
    origins: string[],
    options?: PermissionOptions
  ) {
    for (const chainId of chainIds) {
      // Make sure that the chain info is registered.
      this.chainsService.getBaseChainIdOrThrow(chainId);
    }

    await this.grantPermission(
      env,
      chainIds,
      getBasicAccessPermissionType(),
      origins,
      options
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
      this.chainsService.getBaseChainIdOrThrow(chainId);

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
      this.chainsService.getBaseChainIdOrThrow(chainId);

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

  isPrivilegedOrigins(origin: string): boolean {
    if (this.privilegedOrigins.get(origin)) {
      return true;
    }
    return false;
  }

  hasPermission(chainId: string, type: string, origin: string): boolean {
    // Privileged origin can pass the any permission.
    if (this.privilegedOrigins.get(origin)) {
      return true;
    }

    const baseChainId = this.chainsService.getBaseChainId(chainId);
    if (!baseChainId) {
      return false;
    }

    return (
      this.permissionMap.get(
        PermissionKeyHelper.getPermissionKey(baseChainId, type, origin)
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

  getPermissionOrigins = computedFn(
    (chainId: string, type: string): string[] => {
      const baseChainId = this.chainsService.getBaseChainId(chainId);
      if (!baseChainId) {
        return [];
      }
      const origins = [];

      for (const key of this.permissionMap.keys()) {
        const origin = PermissionKeyHelper.getOriginFromPermissionKey(
          baseChainId,
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
          PermissionKeyHelper.getPermissionKey(
            this.chainsService.getBaseChainIdOrThrow(chainId),
            type,
            origin
          ),
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
  removePermission(chainId: string, type: string, origins: string[]) {
    for (const origin of origins) {
      this.permissionMap.delete(
        PermissionKeyHelper.getPermissionKey(
          this.chainsService.getBaseChainIdOrThrow(chainId),
          type,
          origin
        )
      );

      const currentChainIdForEVM = this.getCurrentChainIdForEVM(origin);
      if (chainId === currentChainIdForEVM) {
        this.currentChainIdForEVMByOriginMap.delete(origin);
      }
    }
  }

  @action
  removeAllSpecificTypePermission(origins: string[], type: string) {
    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      for (const origin of origins) {
        const typeAndOrigin =
          PermissionKeyHelper.getChainAndTypeFromPermissionKey(origin, key);
        if (typeAndOrigin && typeAndOrigin.type === type) {
          deletes.push(key);
        }

        this.currentChainIdForEVMByOriginMap.delete(origin);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
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

        this.currentChainIdForEVMByOriginMap.delete(origin);
        this.currentChainIdForStarknetByOriginMap.delete(origin);
        this.currentBaseChainIdForBitcoinByOriginMap.delete(origin);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }
  }

  @action
  removeAllTypePermissionToChainId(chainId: string, origins: string[]) {
    const baseChainId = this.chainsService.getBaseChainId(chainId);
    if (!baseChainId) {
      return;
    }

    const deletes: string[] = [];

    for (const key of this.permissionMap.keys()) {
      const typeAndOrigin =
        PermissionKeyHelper.getTypeAndOriginFromPermissionKey(baseChainId, key);
      if (typeAndOrigin && origins.includes(typeAndOrigin.origin)) {
        deletes.push(key);
      }
    }

    for (const key of deletes) {
      this.permissionMap.delete(key);
    }

    for (const origin of origins) {
      const currentChainIdForEVM = this.getCurrentChainIdForEVM(origin);
      if (baseChainId === currentChainIdForEVM) {
        this.currentChainIdForEVMByOriginMap.delete(origin);
      }

      const currentChainIdForStarknet =
        this.getCurrentChainIdForStarknet(origin);
      if (baseChainId === currentChainIdForStarknet) {
        this.currentChainIdForStarknetByOriginMap.delete(origin);
      }

      const currentBaseChainIdForBitcoin =
        this.getCurrentBaseChainIdForBitcoin(origin);
      if (baseChainId === currentBaseChainIdForBitcoin) {
        this.currentBaseChainIdForBitcoinByOriginMap.delete(origin);
      }
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

    this.currentChainIdForEVMByOriginMap.clear();
    this.currentChainIdForStarknetByOriginMap.clear();
    this.currentBaseChainIdForBitcoinByOriginMap.clear();
  }

  getCurrentChainIdForEVM(origin: string): string | undefined {
    const currentChainId = this.currentChainIdForEVMByOriginMap.get(origin);
    if (
      currentChainId &&
      !this.hasPermission(
        currentChainId,
        getBasicAccessPermissionType(),
        origin
      )
    ) {
      runInAction(() => {
        this.currentChainIdForEVMByOriginMap.delete(origin);
      });
      return;
    }

    return currentChainId;
  }

  @action
  setCurrentChainIdForEVM(origins: string[], chainId: string) {
    for (const origin of origins) {
      this.currentChainIdForEVMByOriginMap.set(origin, chainId);

      const evmInfo = this.chainsService.getEVMInfoOrThrow(chainId);

      this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "keplr_chainChanged",
        {
          origin,
          evmChainId: evmInfo.chainId,
        }
      );
    }
  }

  @action
  async updateCurrentChainIdForEVM(env: Env, origin: string, chainId: string) {
    const type = getBasicAccessPermissionType();
    const chainIds = [chainId];
    const origins = [origin];

    if (!this.hasPermission(chainId, type, origin)) {
      if (env.isInternalMsg) {
        this.addPermission(chainIds, type, origins);
        this.setCurrentChainIdForEVM(origins, chainId);
      } else {
        await this.grantPermission(env, chainIds, type, origins, {
          isForEVM: true,
          isUnableToChangeChainInUI: true,
        });
      }
    } else {
      this.setCurrentChainIdForEVM(origins, chainId);
    }
  }

  getCurrentChainIdForStarknet(origin: string): string | undefined {
    const currentChainId =
      this.currentChainIdForStarknetByOriginMap.get(origin);
    if (
      currentChainId &&
      !this.hasPermission(
        currentChainId,
        getBasicAccessPermissionType(),
        origin
      )
    ) {
      runInAction(() => {
        this.currentChainIdForStarknetByOriginMap.delete(origin);
      });
      return;
    }

    return currentChainId;
  }

  @action
  setCurrentChainIdForStarknet(origins: string[], chainId: string) {
    for (const origin of origins) {
      this.currentChainIdForStarknetByOriginMap.set(origin, chainId);

      const starknetChainId =
        "0x" + Buffer.from(chainId.replace("starknet:", "")).toString("hex");

      this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "keplr_starknetChainChanged",
        {
          origin,
          starknetChainId,
        }
      );
    }
  }

  @action
  async updateCurrentChainIdForStarknet(
    env: Env,
    origin: string,
    chainId: string
  ) {
    const type = getBasicAccessPermissionType();
    const chainIds = [chainId];
    const origins = [origin];

    if (!this.hasPermission(chainId, type, origin)) {
      if (env.isInternalMsg) {
        this.addPermission(chainIds, type, origins);
        this.setCurrentChainIdForStarknet(origins, chainId);
      } else {
        await this.grantPermission(env, chainIds, type, origins, {
          isForStarknet: true,
          isUnableToChangeChainInUI: true,
        });
      }
    } else {
      this.setCurrentChainIdForStarknet(origins, chainId);
    }
  }

  getCurrentBaseChainIdForBitcoin(origin: string): string | undefined {
    const currentBaseChainId =
      this.currentBaseChainIdForBitcoinByOriginMap.get(origin);
    if (
      currentBaseChainId &&
      !this.hasPermission(
        currentBaseChainId,
        getBasicAccessPermissionType(),
        origin
      )
    ) {
      runInAction(() => {
        this.currentBaseChainIdForBitcoinByOriginMap.delete(origin);
      });
      return;
    }

    return currentBaseChainId;
  }

  @action
  setCurrentBaseChainIdForBitcoin(origins: string[], chainId: string) {
    const baseChainId = this.chainsService.getBaseChainIdOrThrow(chainId);

    // {bip122}:{genesis_hash} -> 0x{genesis_hash}
    const genesisHash = baseChainId.replace("bip122:", "");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];

    for (const origin of origins) {
      this.currentBaseChainIdForBitcoinByOriginMap.set(origin, baseChainId);

      this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "keplr_bitcoinChainChanged",
        {
          origin,
          bitcoinChainId: `bip122:${genesisHash}`,
          network,
        }
      );
    }
  }

  @action
  async updateCurrentBaseChainIdForBitcoin(
    env: Env,
    origin: string,
    chainId: string
  ) {
    const type = getBasicAccessPermissionType();
    const chainIds = [chainId];
    const origins = [origin];

    if (!this.hasPermission(chainId, type, origin)) {
      if (env.isInternalMsg) {
        // addPermission 및 setCurrentBaseChainIdForBitcoin 내부에서
        // 체인 정보를 확인하기 때문에 여기서는 따로 확인하지 않는다.
        this.addPermission(chainIds, type, origins);
        this.setCurrentBaseChainIdForBitcoin(origins, chainId);
      } else {
        await this.grantPermission(env, chainIds, type, origins, {
          isForBitcoin: true,
          isUnableToChangeChainInUI: true,
        });
      }
    } else {
      this.setCurrentBaseChainIdForBitcoin(origins, chainId);
    }
  }
}
