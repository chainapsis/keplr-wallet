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

  constructor(protected readonly kvStore: KVStore) {
    makeObservable(this);
    void this.init();
  }

  @action
  protected async init() {
    const multisig = await this.kvStore.get<MultisigPayload | undefined>(
      "multisig"
    );
    runInAction(() => {
      this.multisig = multisig ?? emptyMultisig;
    });
  }

  protected async save() {
    const data = toJS(this.multisig);
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
}
