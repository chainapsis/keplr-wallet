import {
  createMultisigThresholdPubkey,
  MultisigThresholdPubkey,
  pubkeyType,
  SinglePubkey,
} from "@cosmjs/amino";
import { KVStore } from "@keplr-wallet/common";
import { action, makeObservable, observable, runInAction, toJS } from "mobx";

export interface MultisigPayload {
  biometrics: string | null;
  phoneNumber: {
    publicKey: string;
    phoneNumber: string;
    securityQuestion: string;
  } | null;
  cloud: null;
}

const emptyMultisig: MultisigPayload = {
  biometrics: null,
  phoneNumber: null,
  cloud: null,
};

export class MultisigStore {
  @observable
  protected multisig: MultisigPayload = emptyMultisig;

  @observable
  protected multisigThresholdPublicKey: MultisigThresholdPubkey | null = null;

  constructor(protected readonly kvStore: KVStore) {
    makeObservable(this);
    void this.init();
  }

  @action
  protected async init() {
    const data = await this.kvStore.get<
      | {
          multisig: MultisigPayload;
          multisigThresholdPublicKey: MultisigThresholdPubkey | null;
        }
      | undefined
    >("multisig");

    runInAction(() => {
      // Only load data from KV if it has the right format
      // Here we'd want to have some kind of migration logic in the future if we save more data
      if (isValidKvStoreData(data)) {
        this.multisig = data?.multisig ?? emptyMultisig;
        this.multisigThresholdPublicKey = data?.multisigThresholdPublicKey;
      }
    });
  }

  protected async save() {
    const data = toJS({
      multisig: this.multisig,
      multisigThresholdPublicKey: this.multisigThresholdPublicKey,
    });
    await this.kvStore.set("multisig", data);
  }

  public getMultisig() {
    return this.multisig;
  }

  @action
  public setPhoneNumberKey(payload: MultisigPayload["phoneNumber"]) {
    this.multisig.phoneNumber = payload;
    void this.save();
  }

  @action
  public setBiometricsPublicKey(payload: MultisigPayload["biometrics"]) {
    this.multisig.biometrics = payload;
    void this.save();
  }

  public getMultisigThresholdPublicKey() {
    return this.multisigThresholdPublicKey;
  }

  @action
  public generateMultisigThresholdPublicKey() {
    const publicKeys: SinglePubkey[] = [];

    if (this.multisig.biometrics) {
      publicKeys.push({
        type: pubkeyType.secp256k1,
        value: this.multisig.biometrics,
      });
    }

    if (this.multisig.phoneNumber) {
      publicKeys.push({
        type: pubkeyType.secp256k1,
        value: this.multisig.phoneNumber.publicKey,
      });
    }

    if (publicKeys.length > 0) {
      const threshold = publicKeys.length >= 3 ? 2 : 1;
      this.multisigThresholdPublicKey = createMultisigThresholdPubkey(
        publicKeys,
        threshold
      );
      void this.save();
    }
  }
}

function isValidKvStoreData(data: unknown): data is {
  multisig: MultisigPayload;
  multisigThresholdPublicKey: MultisigThresholdPubkey | null;
} {
  if (typeof data !== "object" || data === null) return false;

  const { multisig, multisigThresholdPublicKey } = data as {
    multisig: unknown;
    multisigThresholdPublicKey: unknown;
  };

  return (
    isMultisigPayload(multisig) && multisigThresholdPublicKey !== undefined
  );
}

function isMultisigPayload(data: unknown): data is MultisigPayload {
  if (typeof data !== "object" || data === null) return false;

  const d = data as {
    biometrics: unknown;
    phoneNumber: unknown;
    cloud: unknown;
  };

  if (typeof d.biometrics !== "string" && d.biometrics !== null) return false;
  if (typeof d.phoneNumber !== "object" && d.phoneNumber !== null) return false;

  const p = d.phoneNumber as {
    publicKey: unknown;
    phoneNumber: unknown;
    securityQuestion: unknown;
  } | null;

  if (p && typeof p.publicKey !== "string") return false;
  if (p && typeof p.phoneNumber !== "string") return false;
  if (p && typeof p.securityQuestion !== "string") return false;

  if (d.cloud !== null) return false;

  return true;
}
