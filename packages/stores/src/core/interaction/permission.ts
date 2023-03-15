import { InteractionStore } from "./interaction";
import {
  GlobalPermissionData,
  INTERACTION_TYPE_GLOBAL_PERMISSION,
  INTERACTION_TYPE_PERMISSION,
  PermissionData,
} from "@keplr-wallet/background";
import { MessageRequester } from "@keplr-wallet/router";

export class PermissionStore {
  constructor(
    protected readonly interactionStore: InteractionStore,
    protected readonly requester: MessageRequester
  ) {}

  get waitingPermissionData() {
    if (this.waitingPermissionDatas.length > 0) {
      return this.waitingPermissionDatas[0];
    }
  }

  get waitingPermissionDatas() {
    return this.interactionStore.getDatas<PermissionData>(
      INTERACTION_TYPE_PERMISSION
    );
  }

  get waitingGlobalPermissionData() {
    if (this.waitingGlobalPermissionDatas.length > 0) {
      return this.waitingGlobalPermissionDatas[0];
    }
  }

  get waitingGlobalPermissionDatas() {
    return this.interactionStore.getDatas<GlobalPermissionData>(
      INTERACTION_TYPE_GLOBAL_PERMISSION
    );
  }

  async approvePermission(id: string) {
    await this.interactionStore.approve(INTERACTION_TYPE_PERMISSION, id, {});
  }

  async rejectPermission(id: string) {
    await this.interactionStore.reject(INTERACTION_TYPE_PERMISSION, id);
  }

  async rejectPermissionAll() {
    await this.interactionStore.rejectAll(INTERACTION_TYPE_PERMISSION);
  }

  async approveGlobalPermission(id: string) {
    await this.interactionStore.approve(
      INTERACTION_TYPE_GLOBAL_PERMISSION,
      id,
      {}
    );
  }

  async rejectGlobalPermission(id: string) {
    await this.interactionStore.reject(INTERACTION_TYPE_GLOBAL_PERMISSION, id);
  }

  async rejectGlobalPermissionAll() {
    await this.interactionStore.rejectAll(INTERACTION_TYPE_GLOBAL_PERMISSION);
  }
}
