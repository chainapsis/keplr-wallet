import {
  createMultisigThresholdPubkey,
  MultisigThresholdPubkey,
  Pubkey,
  pubkeyToAddress,
  SinglePubkey,
} from "@cosmjs/amino";
import { KVStore } from "@keplr-wallet/common";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";

import { Chain, chains } from "../../chains";
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
  LOADING = 0,
  EMPTY,
  READY,
  OUTDATED,
  INITIALIZED,
}

export * from "./serialized-data";

export class MultisigStore {
  @observable
  public currentChain: keyof SerializedProxyAddressPerChain;

  @observable
  protected nextAdmin: SerializedMultisigPayload = emptyMultisig;

  @observable
  protected currentAdmin: SerializedMultisigPayload | null = null;

  @observable
  protected proxyAddresses: SerializedProxyAddressPerChain = {};

  @observable
  protected loading = true;

  constructor(defaultChain: Chain, protected readonly kvStore: KVStore) {
    this.currentChain = defaultChain;
    makeObservable(this);
    void this.init();
  }

  @action
  protected async init() {
    const data = await this.kvStore.get<unknown | undefined>("multisig");

    // Only load data from KV if it is in the right format
    // Here we'd want to have some kind of migration logic in the future if we save more data
    if (SerializedDataAnyVersion.is(data)) {
      runInAction(() => {
        const { nextAdmin, currentAdmin, proxyAddresses } =
          migrateSerializedData(data);
        this.nextAdmin = nextAdmin;
        this.currentAdmin = currentAdmin;
        this.proxyAddresses = proxyAddresses;
        this.loading = false;
      });
      void this.save();
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
    }
  }

  @action
  public setCurrentChain(currentChain: Chain) {
    this.currentChain = currentChain;
  }

  @computed
  public get currentChainInformation() {
    return chains[this.currentChain];
  }

  @computed
  public get proxyAddress(): SerializedProxyAddress | null {
    return this.proxyAddresses[this.currentChain] ?? null;
  }

  public set proxyAddress(address: SerializedProxyAddress | null) {
    this.proxyAddresses[this.currentChain] = address;
    this.loading = address === null;
  }

  @computed
  public get state(): MultisigState {
    if (this.loading) return MultisigState.LOADING;
    if (this.currentAdmin === null) return MultisigState.EMPTY;
    if (this.proxyAddress === null) return MultisigState.READY;
    if (this.proxyAddress.codeId < this.currentChainInformation.currentCodeId) {
      // TODO: Should be Outdated in the future
      // return MultisigState.OUTDATED;
      return MultisigState.READY;
    }
    return MultisigState.INITIALIZED;
  }

  protected async save() {
    const serializedData: SerializedData = {
      nextAdmin: this.nextAdmin,
      currentAdmin: this.currentAdmin,
      proxyAddresses: this.proxyAddresses,
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
  public setSocialPublicKey(payload: SerializedSocialPayload) {
    this.nextAdmin.social = payload;
    void this.save();
  }

  @action
  public finishProxySetup(address: SerializedProxyAddress) {
    this.currentAdmin = this.nextAdmin;
    this.proxyAddresses[this.currentChain] = address;
    this.loading = false;
    void this.save();
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

  protected hydrateMultisig(
    multisig: SerializedMultisigPayload,
    prefix: string
  ): Multisig {
    const { biometrics, phoneNumber, social } = multisig;
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
      social: social && {
        address: this.getAddressOfPublicKey(social.publicKey, prefix),
        ...social,
      },
      cloud: null,
      email: null,
    };
  }

  protected getAddressOfPublicKey(publicKey: Pubkey, prefix: string) {
    return pubkeyToAddress(publicKey, prefix);
  }
}
