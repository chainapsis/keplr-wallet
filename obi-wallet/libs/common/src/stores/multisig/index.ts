import {
  createMultisigThresholdPubkey,
  MultisigThresholdPubkey,
  Pubkey,
  pubkeyToAddress,
  pubkeyType,
  SinglePubkey,
} from "@cosmjs/amino";
import { KVStore } from "@keplr-wallet/common";
import { action, makeObservable, observable, runInAction, toJS } from "mobx";

import {
  migrateSerializedProxyAddress,
  SerializedBiometricsPayload,
  SerializedCloudPayload,
  SerializedData,
  SerializedMultisigPayload,
  SerializedPhoneNumberPayload,
  SerializedProxyAddress,
  SerializedSocialKeyPayload,
} from "./serialized-data";

export type MultisigThresholdPublicKey = MultisigThresholdPubkey;

const emptyMultisig: SerializedMultisigPayload = {
  biometrics: null,
  phoneNumber: null,
  cloud: null,
  socialKey: null,
};

export type WithAddress<T> = T & { address: string };

export interface Multisig {
  multisig: WithAddress<{
    publicKey: MultisigThresholdPublicKey;
  }> | null;
  biometrics: WithAddress<SerializedBiometricsPayload> | null;
  phoneNumber: WithAddress<SerializedPhoneNumberPayload> | null;
  socialKey: WithAddress<SerializedSocialKeyPayload> | null;
  // cloud: WithAddress<SerializedCloudPayload> | null;
  cloud: null;
  email: null;
}

export type MultisigKey = keyof Omit<Multisig, "multisig">;

export enum MultisigState {
  LOADING = 0,
  EMPTY,
  OUTDATED,
  INITIALIZED,
}

export const CURRENT_CODE_ID = 2855;

export * from "./serialized-data";

export class MultisigStore {
  @observable
  protected nextAdmin: SerializedMultisigPayload = emptyMultisig;

  @observable
  protected currentAdmin: SerializedMultisigPayload | null = null;

  @observable
  protected proxyAddress: SerializedProxyAddress | null = null;

  @observable
  protected state: MultisigState = MultisigState.LOADING;

  constructor(protected readonly kvStore: KVStore) {
    makeObservable(this);
    void this.init();
  }

  @action
  protected async init() {
    const data = await this.kvStore.get<unknown | undefined>("multisig");

    // Only load data from KV if it is in the right format
    // Here we'd want to have some kind of migration logic in the future if we save more data
    if (SerializedData.is(data)) {
      runInAction(() => {
        this.nextAdmin = data.nextAdmin;
        this.currentAdmin = data.currentAdmin;
        this.setProxyAddress(migrateSerializedProxyAddress(data.proxyAddress));
      });
      void this.kvStore.set("multisig-backup", null);
    } else {
      const backupData = await this.kvStore.get<unknown | undefined>(
        "multisig-backup"
      );

      if (backupData) {
        console.log(
          "Could not import data. You might need to manually migrate it"
        );
      } else {
        // Backup invalid data so that we can recover it if necessary
        await this.kvStore.set("multisig-backup", data);
      }
      runInAction(() => {
        this.state = MultisigState.EMPTY;
      });
    }
  }

  protected async save() {
    const serializedData: SerializedData = {
      nextAdmin: this.nextAdmin,
      currentAdmin: this.currentAdmin,
      proxyAddress: this.proxyAddress,
    };
    const data = toJS(serializedData);
    await this.kvStore.set("multisig", data);
  }

  public getState() {
    return this.state;
  }

  public getNextAdmin(prefix: string) {
    return this.hydrateMultisig(this.nextAdmin, prefix);
  }

  public getCurrentAdmin(prefix: string) {
    return this.currentAdmin && this.hydrateMultisig(this.currentAdmin, prefix);
  }

  public isProxyInitialized() {
    return this.proxyAddress !== null;
  }

  public getProxyAddress() {
    return this.proxyAddress?.address;
  }

  @action
  public setPhoneNumberKey(payload: SerializedPhoneNumberPayload) {
    this.nextAdmin.phoneNumber = payload;
    void this.save();
  }

  @action
  public setBiometricsPublicKey(payload: SerializedBiometricsPayload) {
    this.nextAdmin.biometrics = payload;
    void this.save();
  }
  @action
  public setSocialKeyPublicKey(payload: SerializedSocialKeyPayload) {
    this.nextAdmin.socialKey = payload;
    void this.save();
  }

  @action
  public finishProxySetup(address: SerializedProxyAddress) {
    this.currentAdmin = this.nextAdmin;
    this.setProxyAddress(address);
    void this.save();
  }

  @action
  protected setProxyAddress(address: SerializedProxyAddress | null) {
    this.proxyAddress = address;

    if (address) {
      this.state =
        address.codeId === CURRENT_CODE_ID
          ? MultisigState.INITIALIZED
          : MultisigState.OUTDATED;
    } else {
      this.state = MultisigState.EMPTY;
    }
  }

  protected createMultisigThresholdPublicKey(
    multisig: SerializedMultisigPayload
  ): MultisigThresholdPublicKey | null {
    const publicKeys: SinglePubkey[] = [];

    if (multisig.biometrics) {
      publicKeys.push({
        type: pubkeyType.secp256k1,
        value: multisig.biometrics.publicKey,
      });
    }

    if (multisig.phoneNumber) {
      publicKeys.push({
        type: pubkeyType.secp256k1,
        value: multisig.phoneNumber.publicKey,
      });
    }
    if (multisig.socialKey) {
      publicKeys.push({
        type: pubkeyType.secp256k1,
        value: multisig.socialKey.publicKey,
      });
    }

    if (publicKeys.length === 0) {
      return null;
    }

    const threshold = publicKeys.length >= 3 ? 2 : 1;
    return createMultisigThresholdPubkey(publicKeys, threshold);
  }

  protected hydrateMultisig(
    multisig: SerializedMultisigPayload,
    prefix: string
  ): Multisig {
    const { biometrics, phoneNumber, socialKey } = multisig;
    const multisigThresholdPublicKey =
      this.createMultisigThresholdPublicKey(multisig);

    return {
      multisig: multisigThresholdPublicKey && {
        address: this.getAddressOfPublicKey(multisigThresholdPublicKey, prefix),
        publicKey: multisigThresholdPublicKey,
      },
      biometrics: biometrics && {
        address: this.getAddressOfPublicKey(biometrics.publicKey, prefix),
        ...biometrics,
      },
      phoneNumber: phoneNumber && {
        address: this.getAddressOfPublicKey(phoneNumber.publicKey, prefix),
        ...phoneNumber,
      },
      socialKey: socialKey && {
        address: this.getAddressOfPublicKey(socialKey.publicKey, prefix),
        ...socialKey,
      },
      cloud: null,
      email: null,
    };
  }

  protected getAddressOfPublicKey(publicKey: Pubkey | string, prefix: string) {
    return pubkeyToAddress(
      typeof publicKey === "string"
        ? {
            type: pubkeyType.secp256k1,
            value: publicKey,
          }
        : publicKey,
      prefix
    );
  }
}
