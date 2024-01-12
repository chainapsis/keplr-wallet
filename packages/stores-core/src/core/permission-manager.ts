import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import { computed, makeObservable, observable, runInAction } from "mobx";
import {
  AllPermissionDataPerOrigin,
  ClearAllPermissionsMsg,
  ClearOriginPermissionMsg,
  GetAllPermissionDataPerOriginMsg,
  RemoveGlobalPermissionOriginMsg,
  RemovePermissionOrigin,
} from "@keplr-wallet/background";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class PermissionManagerStore {
  @observable
  protected _isInitialized: boolean = false;

  @observable
  protected _permissionData: AllPermissionDataPerOrigin = {};

  constructor(protected readonly requester: MessageRequester) {
    makeObservable(this);

    this.init();
  }

  protected async init() {
    const msg = new GetAllPermissionDataPerOriginMsg();
    const result = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    runInAction(() => {
      this._permissionData = result;
    });

    runInAction(() => {
      this._isInitialized = true;
    });
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  @computed
  get permissionData(): AllPermissionDataPerOrigin {
    // Background has origin with empty permissions.
    // However, it is not needed to show in the UI.
    // So, trim the empty origins.
    const trimmed: AllPermissionDataPerOrigin = {};
    for (const [origin, perms] of Object.entries(this._permissionData)) {
      if (
        perms &&
        (perms.permissions.length > 0 || perms.globalPermissions.length > 0)
      ) {
        trimmed[origin] = perms;
      }
    }

    return trimmed;
  }

  async clearAllPermissions() {
    runInAction(() => {
      this._permissionData = {};
    });

    const msg = new ClearAllPermissionsMsg();
    await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async clearOrigin(origin: string) {
    const perms = this._permissionData[origin];
    if (perms) {
      runInAction(() => {
        delete this._permissionData[origin];
      });

      const msg = new ClearOriginPermissionMsg(origin);
      await this.requester.sendMessage(BACKGROUND_PORT, msg);
    }
  }

  async removePermission(origin: string, chainId: string, type: string) {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    const perms = this._permissionData[origin];
    const i = perms
      ? perms.permissions.findIndex(
          (perm) =>
            perm.chainIdentifier === chainIdentifier && perm.type === type
        )
      : -1;
    if (i >= 0 && perms) {
      runInAction(() => {
        perms.permissions.splice(i, 1);
      });

      const msg = new RemovePermissionOrigin(chainId, type, origin);
      await this.requester.sendMessage(BACKGROUND_PORT, msg);
    }
  }

  async removeGlobalPermission(origin: string, type: string) {
    const perms = this._permissionData[origin];
    const i = perms
      ? perms.globalPermissions.findIndex((perm) => perm.type === type)
      : -1;
    if (i >= 0 && perms) {
      runInAction(() => {
        perms.globalPermissions.splice(i, 1);
      });

      const msg = new RemoveGlobalPermissionOriginMsg(type, origin);
      await this.requester.sendMessage(BACKGROUND_PORT, msg);
    }
  }
}
