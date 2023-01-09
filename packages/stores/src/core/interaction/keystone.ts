import { computed, flow, makeObservable } from "mobx";
import { InteractionStore } from "./interaction";
import {
  BIP44HDPath,
  TYPE_KEYSTONE_GET_PUBKEY,
  TYPE_KEYSTONE_SIGN,
} from "@keplr-wallet/background";

export interface UR {
  type: string;
  cbor: string;
}

export interface SignData {
  bip44HDPath: BIP44HDPath;
  coinType: number;
  message: Uint8Array;
  ur: UR;
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
    if (datas.length !== 0) {
      yield this.interactionStore.approve(
        TYPE_KEYSTONE_GET_PUBKEY,
        datas[0].id,
        data
      );
    }
  }

  @flow
  *rejectSign() {
    yield this.interactionStore.rejectAll(TYPE_KEYSTONE_SIGN);
  }

  @flow
  *resolveSign(data: unknown) {
    const datas = this.interactionStore.getDatas(TYPE_KEYSTONE_SIGN);
    if (datas.length !== 0) {
      yield this.interactionStore.approve(
        TYPE_KEYSTONE_SIGN,
        datas[0].id,
        data
      );
    }
  }

  @computed
  get signData() {
    const datas = this.interactionStore.getDatas<SignData>(TYPE_KEYSTONE_SIGN);
    if (datas.length === 0) {
      return undefined;
    }
    return datas[0];
  }
}
