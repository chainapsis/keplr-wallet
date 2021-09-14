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
  getSecret20ViewingKeyPermissionType,
  AddPermissionOrigin,
  GetOriginPermittedChainsMsg,
} from "@keplr-wallet/background";
import { computed, flow, makeObservable, observable } from "mobx";
import { HasMapStore } from "../../common";
import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import { toGenerator } from "@keplr-wallet/common";

export class Secret20ViewingKeyPermissionInnerStore {
  @observable.ref
  protected _origins: string[] = [];

  constructor(
    protected readonly chainId: string,
    protected readonly contractAddress: string,
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
        getSecret20ViewingKeyPermissionType(this.contractAddress),
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
          getSecret20ViewingKeyPermissionType(this.contractAddress)
        )
      )
    );
  }
}

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
  *addOrigin(origin: string) {
    yield this.requester.sendMessage(
      BACKGROUND_PORT,
      new AddPermissionOrigin(
        this.chainId,
        getBasicAccessPermissionType(),
        origin
      )
    );
    yield this.refreshOrigins();
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

interface MapKeyData {
  type: "basicAccess" | "viewingKey";
  chainId: string;
  contractAddress: string;
}

export class PermissionStore extends HasMapStore<
  BasicAccessPermissionInnerStore | Secret20ViewingKeyPermissionInnerStore
> {
  @observable
  protected _isLoading: boolean = false;

  constructor(
    protected readonly interactionStore: InteractionStore,
    protected readonly requester: MessageRequester
  ) {
    super((key: string) => {
      const data = JSON.parse(key) as MapKeyData;
      if (data.type === "basicAccess") {
        return new BasicAccessPermissionInnerStore(
          data.chainId,
          this.requester
        );
      } else {
        return new Secret20ViewingKeyPermissionInnerStore(
          data.chainId,
          data.contractAddress,
          this.requester
        );
      }
    });
    makeObservable(this);
  }

  getBasicAccessInfo(chainId: string): BasicAccessPermissionInnerStore {
    const key = JSON.stringify({
      type: "basicAccess",
      chainId,
      contractAddress: "",
    });
    return this.get(key) as BasicAccessPermissionInnerStore;
  }

  async getOriginPermittedChains(
    origin: string,
    type: string
  ): Promise<string[]> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new GetOriginPermittedChainsMsg(origin, type)
    );
  }

  getSecret20ViewingKeyAccessInfo(
    chainId: string,
    contractAddress: string
  ): Secret20ViewingKeyPermissionInnerStore {
    const key = JSON.stringify({
      type: "viewingKey",
      chainId,
      contractAddress,
    });
    return this.get(key) as Secret20ViewingKeyPermissionInnerStore;
  }

  @computed
  get waitingBasicAccessPermissions(): {
    id: string;
    data: {
      chainIds: string[];
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
            chainIds: data.data.chainIds,
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
      chainIds: string[];
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
            chainIds: data.data.chainIds,
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
