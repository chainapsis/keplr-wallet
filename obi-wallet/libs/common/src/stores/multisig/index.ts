import {
  createMultisigThresholdPubkey,
  MultisigThresholdPubkey,
  pubkeyToAddress,
  SinglePubkey,
} from "@cosmjs/amino";
import { KVStore, toGenerator } from "@keplr-wallet/common";
import { action, computed, flow, makeObservable, observable, toJS } from "mobx";

import { chains } from "../../chains";
import { ChainStore } from "../chain";
import {
  migrateSerializedData,
  SerializedBiometricsPayload,
  SerializedCloudPayload,
  SerializedData,
  SerializedDataAnyVersion,
  SerializedMultisigPayload,
  SerializedPhoneNumberPayload,
  SerializedProxyAddress,
  SerializedProxyAddressPerChain,
  SerializedSocialPayload,
} from "./serialized-data";

export type MultisigThresholdPublicKey = MultisigThresholdPubkey;

const emptyMultisig: SerializedMultisigPayload = {
  biometrics: null,
  phoneNumber: null,
  cloud: null,
  social: null,
};

export type WithAddress<T> = T & { address: string };

export interface Multisig {
  multisig: WithAddress<{
    publicKey: MultisigThresholdPublicKey;
  }> | null;
  biometrics: WithAddress<SerializedBiometricsPayload> | null;
  phoneNumber: WithAddress<SerializedPhoneNumberPayload> | null;
  social: WithAddress<SerializedSocialPayload> | null;
  cloud: WithAddress<SerializedCloudPayload> | null;
  email: null;
}

export type MultisigKey = keyof Omit<Multisig, "multisig">;

export enum MultisigState {
  LOADING = "Loading",
  EMPTY = "Empty",
  READY = "Ready",
  OUTDATED = "Outdated",
  INITIALIZED = "Initialized",
}

export * from "./serialized-data";

export class MultisigStore {
  protected readonly chainStore: ChainStore;
  protected readonly kvStore: KVStore;

  @observable
  protected keyInRecovery: MultisigKey | null = null;

  @observable
  protected updateProposed = false;

  @observable
  protected serializedNextAdmin: SerializedMultisigPayload = emptyMultisig;

  @observable
  protected serializedCurrentAdmin: SerializedMultisigPayload | null = null;

  @observable
  protected proxyAddresses: SerializedProxyAddressPerChain = {};

  @observable
  protected loading = true;

  constructor({
    chainStore,
    kvStore,
  }: {
    chainStore: ChainStore;
    kvStore: KVStore;
  }) {
    this.chainStore = chainStore;
    this.kvStore = kvStore;
    makeObservable(this);
    this.init();
  }

  @flow
  protected *init() {
    const data = yield* toGenerator(
      this.kvStore.get<unknown | undefined>("multisig")
    );

    // Only load data from KV if it is in the right format
    // Here we'd want to have some kind of migration logic in the future if we save more data
    if (SerializedDataAnyVersion.is(data)) {
      const { nextAdmin, currentAdmin, proxyAddresses } =
        migrateSerializedData(data);
      this.serializedNextAdmin = nextAdmin;
      this.serializedCurrentAdmin = currentAdmin;
      this.proxyAddresses = proxyAddresses;
      void this.save();
      void this.kvStore.set("create-multisig-backup", null);
    } else {
      const backupData = yield* toGenerator(
        this.kvStore.get<unknown | undefined>("create-multisig-backup")
      );

      if (backupData) {
        console.log(
          "Could not import data. You might need to manually migrate it"
        );
      } else {
        // Backup invalid data so that we can recover it if necessary
        yield* toGenerator(this.kvStore.set("create-multisig-backup", data));
      }
    }

    this.loading = false;
  }

  @computed
  public get currentChainInformation() {
    return chains[this.chainStore.currentChain];
  }

  @computed
  public get getKeyInRecovery() {
    return this.keyInRecovery;
  }

  @computed
  public get getUpdateProposed() {
    return this.updateProposed;
  }

  @computed
  public get proxyAddress(): SerializedProxyAddress | null {
    return this.proxyAddresses[this.chainStore.currentChain] ?? null;
  }

  @computed
  public get state(): MultisigState {
    if (this.loading) return MultisigState.LOADING;
    if (this.serializedCurrentAdmin === null) return MultisigState.EMPTY;
    if (this.proxyAddress === null) return MultisigState.READY;
    if (
      this.proxyAddress.codeId <
      this.chainStore.currentChainInformation.currentCodeId
    ) {
      return MultisigState.INITIALIZED;
    }
    return MultisigState.INITIALIZED;
  }

  protected async save() {
    const serializedData: SerializedData = {
      nextAdmin: this.serializedNextAdmin,
      currentAdmin: this.serializedCurrentAdmin,
      proxyAddresses: this.proxyAddresses,
    };
    const data = toJS(serializedData);
    await this.kvStore.set("multisig", data);
  }

  @action
  public async replace(newMultisigStore: MultisigStore) {
    const serializedData: SerializedData = {
      nextAdmin: newMultisigStore.serializedNextAdmin,
      currentAdmin: newMultisigStore.serializedCurrentAdmin,
      proxyAddresses: this.proxyAddresses,
    };
    const data = toJS(serializedData);
    this.loading = false;
    await this.kvStore.set("multisig", data);
  }

  @computed
  public get nextAdmin() {
    return this.hydrateMultisig(
      this.serializedNextAdmin,
      this.chainStore.currentChainInformation.prefix
    );
  }

  @computed
  public get currentAdmin() {
    return (
      this.serializedCurrentAdmin &&
      this.hydrateMultisig(
        this.serializedCurrentAdmin,
        this.chainStore.currentChainInformation.prefix
      )
    );
  }

  @action
  public setPhoneNumberKey(payload: SerializedPhoneNumberPayload) {
    this.serializedNextAdmin.phoneNumber = payload;
    void this.save();
  }

  @action
  public setBiometricsPublicKey(payload: SerializedBiometricsPayload) {
    this.serializedNextAdmin.biometrics = payload;
    void this.save();
  }

  @action
  public setSocialPublicKey(payload: SerializedSocialPayload) {
    this.serializedNextAdmin.social = payload;
    void this.save();
  }

  @action
  public finishProxySetup(address: SerializedProxyAddress) {
    this.serializedCurrentAdmin = this.nextAdmin;
    this.proxyAddresses[this.chainStore.currentChain] = address;
    this.loading = false;
    void this.save();
  }

  @action
  public cancelRecovery() {
    this.serializedCurrentAdmin = this.nextAdmin;
    this.keyInRecovery = null;
    this.updateProposed = false;
    this.loading = false;
    void this.save();
  }

  protected hydrateMultisig(
    multisig: SerializedMultisigPayload,
    prefix: string
  ): Multisig {
    const { biometrics, phoneNumber, social } = multisig;
    const multisigThresholdPublicKey =
      this.createMultisigThresholdPublicKey(multisig);

    return {
      multisig: multisigThresholdPublicKey && {
        address: pubkeyToAddress(multisigThresholdPublicKey, prefix),
        publicKey: multisigThresholdPublicKey,
      },
      biometrics: biometrics && {
        address: pubkeyToAddress(biometrics.publicKey, prefix),
        ...biometrics,
      },
      phoneNumber: phoneNumber && {
        address: pubkeyToAddress(phoneNumber.publicKey, prefix),
        ...phoneNumber,
      },
      social: social && {
        address: pubkeyToAddress(social.publicKey, prefix),
        ...social,
      },
      cloud: null,
      email: null,
    };
  }

  protected createMultisigThresholdPublicKey(
    multisig: SerializedMultisigPayload
  ): MultisigThresholdPublicKey | null {
    const publicKeys: SinglePubkey[] = [];

    if (multisig.biometrics) {
      publicKeys.push(multisig.biometrics.publicKey);
    }

    if (multisig.phoneNumber) {
      publicKeys.push(multisig.phoneNumber.publicKey);
    }

    if (multisig.social) {
      publicKeys.push(multisig.social.publicKey);
    }

    if (publicKeys.length === 0) {
      return null;
    }

    const threshold = publicKeys.length >= 4 ? 2 : 1;
    return createMultisigThresholdPubkey(publicKeys, threshold);
  }

  @action
  public logout() {
    this.serializedCurrentAdmin = null;
  }

  @action
  public recover(keyId: MultisigKey) {
    this.keyInRecovery = keyId;
    this.serializedCurrentAdmin = null;
  }

  @action
  public setUpdateProposed(proposed: boolean) {
    this.updateProposed = proposed;
  }

  @action
  public copyGoodKeys(sourceMultisig: Multisig, bad_key_id: string) {
    if (sourceMultisig.biometrics) {
      this.setBiometricsPublicKey({
        publicKey: sourceMultisig.biometrics.publicKey,
      });
    }
    switch (bad_key_id) {
      case "phoneNumber":
        if (sourceMultisig.social) {
          this.setSocialPublicKey({
            publicKey: sourceMultisig.social.publicKey,
          });
        }
        break;
      case "social":
        if (sourceMultisig.phoneNumber) {
          this.setPhoneNumberKey({
            publicKey: sourceMultisig.phoneNumber.publicKey,
            phoneNumber: sourceMultisig.phoneNumber.phoneNumber,
            securityQuestion: sourceMultisig.phoneNumber.securityQuestion,
          });
        }
        break;
    }
  }
}
