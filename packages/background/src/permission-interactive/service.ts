import { KeyRingService } from "../keyring";
import { Env } from "@keplr-wallet/router";
import { PermissionService } from "../permission";
import { ChainsService } from "../chains";

export class PermissionInteractiveService {
  constructor(
    protected readonly permissionService: PermissionService,
    protected readonly keyRingService: KeyRingService,
    protected readonly chainsService: ChainsService
  ) {}

  async init(): Promise<void> {
    // noop
  }

  async ensureEnabled(
    env: Env,
    chainIds: string[],
    origin: string
  ): Promise<void> {
    await this.keyRingService.ensureUnlockInteractive(env);

    return await this.permissionService.checkOrGrantBasicAccessPermission(
      env,
      chainIds,
      origin
    );
  }

  async ensureEnabledForEVM(env: Env, origin: string): Promise<void> {
    await this.keyRingService.ensureUnlockInteractive(env);

    const currentChainIdForEVM =
      this.permissionService.getCurrentChainIdForEVM(origin) ??
      (() => {
        const chainInfos = this.chainsService.getChainInfos();
        // If currentChainId is not saved, Make Ethereum current chain.
        const ethereumChainId = chainInfos.find(
          (chainInfo) =>
            chainInfo.evm !== undefined && chainInfo.chainId === "eip155:1"
        )?.chainId;

        if (!ethereumChainId) {
          throw new Error("The Ethereum chain info is not found");
        }

        return ethereumChainId;
      })();

    await this.permissionService.checkOrGrantBasicAccessPermission(
      env,
      [currentChainIdForEVM],
      origin,
      {
        isForEVM: true,
      }
    );
  }

  disable(chainIds: string[], origin: string) {
    // Delete permissions granted to origin.
    // If chain ids are specified, only the permissions granted to each chain id are deleted (In this case, permissions such as getChainInfosWithoutEndpoints() are not deleted).
    // Else, remove all permissions granted to origin (In this case, permissions that are not assigned to each chain, such as getChainInfosWithoutEndpoints(), are also deleted).
    if (chainIds.length > 0) {
      for (const chainId of chainIds) {
        this.permissionService.removeAllTypePermissionToChainId(chainId, [
          origin,
        ]);
      }
    } else {
      this.permissionService.removeAllTypePermission([origin]);
      this.permissionService.removeAllTypeGlobalPermission([origin]);
    }
  }

  isEnabled(env: Env, chainIds: string[], origin: string): boolean {
    return this.permissionService.hasBasicAccessPermission(
      env,
      chainIds,
      origin
    );
  }

  async checkOrGrantGetChainInfosWithoutEndpointsPermission(
    env: Env,
    origin: string
  ): Promise<void> {
    await this.keyRingService.ensureUnlockInteractive(env);

    return await this.permissionService.checkOrGrantGlobalPermission(
      env,
      "get-chain-infos",
      origin
    );
  }
}
