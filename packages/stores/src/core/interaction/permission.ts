import { InteractionStore } from "./interaction";
import {
  getBasicAccessPermissionType,
  GetPermissionOriginsMsg,
  INTERACTION_TYPE_PERMISSION,
  isBasicAccessPermissionType,
  PermissionData,
  RemovePermissionOrigin,
  isSecret20ViewingKeyPermissionType,
  splitSecret20ViewingKeyPermissionType,
} from "@keplr/background";
import { computed, flow, makeObservable, observable } from "mobx";
import { HasMapStore } from "../../common";
import { BACKGROUND_PORT, MessageRequester } from "@keplr/router";
import { toGenerator } from "@keplr/common";

export class BasicAccessPermissionInnerStore {
  @observable.ref
  protected _origins: string[] = [];

  constructor(
    protected readonly chainId: string,
    protected readonly requester: MessageRequester
  ) {
    makeObservable(this);

    this.refreshOrigins();
  }

  get origins(): string[] {
    return this._origins;
  }

  @flow
  *removeOrigin(origin: string) {
    yield this.requester.sendMessage(
      BACKGROUND_PORT,
      new RemovePermissionOrigin(
        this.chainId,
        getBasicAccessPermissionType(),
        origin
      )
    );
    yield this.refreshOrigins();
  }

  @flow
  protected *refreshOrigins() {
    this._origins = yield* toGenerator(
      this.requester.sendMessage(
        BACKGROUND_PORT,
        new GetPermissionOriginsMsg(
          this.chainId,
          getBasicAccessPermissionType()
        )
      )
    );
  }
}

export class PermissionStore extends HasMapStore<any> {
  @observable
  protected _isLoading: boolean = false;

  constructor(
    protected readonly interactionStore: InteractionStore,
    protected readonly requester: MessageRequester
  ) {
    super((chainId: string) => {
      return new BasicAccessPermissionInnerStore(chainId, this.requester);
    });
    makeObservable(this);
  }

  getBasicAccessInfo(chainId: string): BasicAccessPermissionInnerStore {
    return this.get(chainId);
  }

  @computed
  get waitingBasicAccessPermissions(): {
    id: string;
    data: {
      chainId: string;
      origins: string[];
    };
  }[] {
    const datas = this.waitingDatas;

    const result = [];
    for (const data of datas) {
      if (isBasicAccessPermissionType(data.data.type)) {
        result.push({
          id: data.id,
          data: {
            chainId: data.data.chainId,
            origins: data.data.origins,
          },
        });
      }
    }

    return result;
  }

  @computed
  get waitingSecret20ViewingKeyAccessPermissions(): {
    id: string;
    data: {
      chainId: string;
      contractAddress: string;
      origins: string[];
    };
  }[] {
    const datas = this.waitingDatas;

    const result = [];
    for (const data of datas) {
      if (isSecret20ViewingKeyPermissionType(data.data.type)) {
        result.push({
          id: data.id,
          data: {
            chainId: data.data.chainId,
            contractAddress: splitSecret20ViewingKeyPermissionType(
              data.data.type
            ),
            origins: data.data.origins,
          },
        });
      }
    }

    return result;
  }

  get waitingDatas() {
    return this.interactionStore.getDatas<PermissionData>(
      INTERACTION_TYPE_PERMISSION
    );
  }

  @flow
  *approve(id: string) {
    this._isLoading = true;
    try {
      yield this.interactionStore.approve(INTERACTION_TYPE_PERMISSION, id, {});
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *reject(id: string) {
    this._isLoading = true;
    try {
      yield this.interactionStore.reject(INTERACTION_TYPE_PERMISSION, id);
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *rejectAll() {
    this._isLoading = true;
    try {
      yield this.interactionStore.rejectAll(INTERACTION_TYPE_PERMISSION);
    } finally {
      this._isLoading = false;
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
