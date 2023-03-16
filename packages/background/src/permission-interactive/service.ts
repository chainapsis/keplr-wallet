import { KeyRingService } from "../keyring-v2";
import { Env } from "@keplr-wallet/router";
import { PermissionService } from "../permission";

export class PermissionInteractiveService {
  constructor(
    protected readonly permissionService: PermissionService,
    protected readonly keyRingService: KeyRingService
  ) {}

  async init(): Promise<void> {
    // noop
  }

  async ensureEnabled(
    env: Env,
    chainIds: string[],
    origin: string
  ): Promise<void> {
    const isPermisionSatisfied =
      this.permissionService.hasBasicAccessPermission(env, chainIds, origin);

    await this.keyRingService.ensureUnlockInteractive(
      env,
      !isPermisionSatisfied
    );

    return await this.permissionService.checkOrGrantBasicAccessPermission(
      env,
      chainIds,
      origin
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
}
