import { flow, makeObservable } from "mobx";
import { InteractionStore } from "./interaction";
import { TYPE_KEYSTONE_GET_PUBKEY } from "@keplr-wallet/background";

export interface UR {
  type: string;
  cbor: string;
}

export class KeystoneStore {
  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  @flow
  *rejectGetPubkey() {
    yield this.interactionStore.rejectAll(TYPE_KEYSTONE_GET_PUBKEY);
  }

  @flow
  *resolveGetPubkey(data: unknown) {
    const datas = this.interactionStore.getDatas(TYPE_KEYSTONE_GET_PUBKEY);
    for (const d of datas) {
      yield this.interactionStore.approve(TYPE_KEYSTONE_GET_PUBKEY, d.id, data);
    }
  }
}
