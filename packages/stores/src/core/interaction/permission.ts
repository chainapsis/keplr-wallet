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
    return this.interactionStore.getAllData<PermissionData>(
      INTERACTION_TYPE_PERMISSION
    );
  }

  get waitingGlobalPermissionData() {
    if (this.waitingGlobalPermissionDatas.length > 0) {
      return this.waitingGlobalPermissionDatas[0];
    }
  }

  get waitingGlobalPermissionDatas() {
    return this.interactionStore.getAllData<GlobalPermissionData>(
      INTERACTION_TYPE_GLOBAL_PERMISSION
    );
  }

  async approvePermissionWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.approveWithProceedNext(id, {}, afterFn);
  }

  async rejectPermissionWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.rejectWithProceedNext(id, afterFn);
  }

  async rejectPermissionAll() {
    await this.interactionStore.rejectAll(INTERACTION_TYPE_PERMISSION);
  }

  async approveGlobalPermissionWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.approveWithProceedNext(id, {}, afterFn);
  }

  async rejectGlobalPermissionWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.rejectWithProceedNext(id, afterFn);
  }

  async rejectGlobalPermissionAll() {
    await this.interactionStore.rejectAll(INTERACTION_TYPE_GLOBAL_PERMISSION);
  }
}
