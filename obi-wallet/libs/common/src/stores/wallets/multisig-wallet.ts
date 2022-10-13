import {
  createMultisigThresholdPubkey,
  pubkeyToAddress,
  SinglePubkey,
} from "@cosmjs/amino";
import { action, computed, makeObservable, observable } from "mobx";

import { ChainStore } from "../chain";
import {
  Multisig,
  MultisigKey,
  MultisigThresholdPublicKey,
  ProxyWallet,
  SerializedBiometricsPayload,
  SerializedPhoneNumberPayload,
  SerializedSocialPayload,
} from "../multisig";
import {
  SerializedMultisigPayload,
  SerializedProxyAddress,
} from "../multisig/serialized-data";
import { AbstractWallet } from "./abstract-wallet";
import { SerializedMultisigWallet } from "./serialized-data";

export class MultisigWallet extends AbstractWallet {
  protected readonly chainStore: ChainStore;

  @observable
  protected serializedData: SerializedMultisigWallet;

  @observable
  public keyInRecovery: MultisigKey | null = null;
  @observable
  public walletInRecovery: ProxyWallet | null = null;
  @observable
  public updateProposed = false;

  constructor({
    chainStore,
    serializedData,
  }: {
    chainStore: ChainStore;
    serializedData: SerializedMultisigWallet;
  }) {
    super();
    this.chainStore = chainStore;
    this.serializedData = serializedData;
    makeObservable(this);
  }

  public get address() {
    return null;
  }

  public get type() {
    return "multisig" as const;
  }

  public get proxyAddress(): SerializedProxyAddress | null {
    return this.proxyAddresses[this.chainStore.currentChain] ?? null;
  }

  @computed
  public get nextAdmin(): Multisig {
    return this.hydrateMultisig(
      this.serializedNextAdmin,
      this.chainStore.currentChainInformation.prefix
    );
  }

  @action
  public setNextAdmin(payload: SerializedMultisigPayload) {
    // TODO: save to WalletsStore
    this.serializedData.data.nextAdmin = payload;
  }

  @computed
  public get currentAdmin(): Multisig | null {
    return (
      this.serializedCurrentAdmin &&
      this.hydrateMultisig(
        this.serializedCurrentAdmin,
        this.chainStore.currentChainInformation.prefix
      )
    );
  }

  @action
  public setCurrentAdmin(payload: SerializedMultisigPayload | null) {
    // TODO: save to WalletsStore
    this.serializedData.data.currentAdmin = payload;
  }

  @action
  public setPhoneNumberKey(payload: SerializedPhoneNumberPayload) {
    this.setNextAdmin({
      ...this.nextAdmin,
      phoneNumber: payload,
    });
  }

  @action
  public setBiometricsPublicKey(payload: SerializedBiometricsPayload) {
    this.setNextAdmin({
      ...this.nextAdmin,
      biometrics: payload,
    });
  }

  @action
  public setSocialPublicKey(payload: SerializedSocialPayload) {
    this.setNextAdmin({
      ...this.nextAdmin,
      social: payload,
    });
  }

  @action
  public finishProxySetup(address: SerializedProxyAddress) {
    this.keyInRecovery = null;
    this.updateProposed = false;
    this.proxyAddresses[this.chainStore.currentChain] = address;
    this.setCurrentAdmin(this.serializedNextAdmin);
  }

  @action
  public recover(keyId: MultisigKey) {
    this.keyInRecovery = keyId;
    this.updateProposed = false;
  }

  @action
  public cancelRecovery() {
    if (this.serializedCurrentAdmin) {
      this.setNextAdmin(this.serializedCurrentAdmin);
    }
    this.keyInRecovery = null;
    this.walletInRecovery = null;
    this.updateProposed = false;
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

  protected get proxyAddresses() {
    return this.serializedData.data.proxyAddresses;
  }

  protected get serializedCurrentAdmin() {
    return this.serializedData.data.currentAdmin;
  }

  protected get serializedNextAdmin() {
    return this.serializedData.data.nextAdmin;
  }
}
