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
import { AbstractWallet, WalletType } from "./abstract-wallet";
import {
  SerializedMultisigDemoWallet,
  SerializedMultisigWallet,
} from "./serialized-data";

export class MultisigWallet extends AbstractWallet {
  protected readonly chainStore: ChainStore;

  protected readonly _id: string;

  @observable
  protected serializedWallet:
    | SerializedMultisigWallet
    | SerializedMultisigDemoWallet;
  protected onChange: (
    serializedWallet: SerializedMultisigWallet | SerializedMultisigDemoWallet
  ) => Promise<void>;

  @observable
  public keyInRecovery: MultisigKey | null = null;
  @observable
  protected _walletInRecovery: ProxyWallet | null = null;
  @observable
  protected _updateProposed = false;

  constructor({
    chainStore,
    id,
    serializedWallet,
    onChange,
  }: {
    chainStore: ChainStore;
    id: string;
    serializedWallet: SerializedMultisigWallet | SerializedMultisigDemoWallet;
    onChange: (
      serializedWallet: SerializedMultisigWallet | SerializedMultisigDemoWallet
    ) => Promise<void>;
  }) {
    super();
    this.chainStore = chainStore;
    this._id = id;
    this.serializedWallet = serializedWallet;
    this.onChange = onChange;
    makeObservable(this);
  }

  public get id() {
    return this._id;
  }

  public get address() {
    return this.proxyAddress?.address ?? null;
  }

  public get type() {
    return WalletType.Multisig;
  }

  public get isReady() {
    return (
      this.currentAdmin !== null &&
      this.keyInRecovery === null &&
      this.walletInRecovery === null
    );
  }

  public get proxyAddress(): SerializedProxyAddress | null {
    return this.proxyAddresses[this.chainStore.currentChain] ?? null;
  }

  public get walletInRecovery() {
    return this._walletInRecovery;
  }

  @action
  public setWalletInRecovery(wallet: ProxyWallet) {
    this._walletInRecovery = wallet;
  }

  public get updateProposed() {
    return this._updateProposed;
  }

  @action
  public setUpdateProposed(updateProposed: boolean) {
    this._updateProposed = updateProposed;
  }

  @computed
  public get isDemo() {
    return this.serializedWallet.type === "multisig-demo";
  }

  @computed
  public get nextAdmin(): Multisig {
    return this.hydrateMultisig(
      this.serializedNextAdmin,
      this.chainStore.currentChainInformation.prefix
    );
  }

  @action
  public async setNextAdmin(payload: SerializedMultisigPayload) {
    this.serializedWallet.data.nextAdmin = payload;
    await this.onChange(this.serializedWallet);
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
  public async setCurrentAdmin(payload: SerializedMultisigPayload | null) {
    this.serializedWallet.data.currentAdmin = payload;
    await this.onChange(this.serializedWallet);
  }

  @action
  public async setPhoneNumberKey(payload: SerializedPhoneNumberPayload) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      phoneNumber: payload,
    });
  }

  @action
  public async setBiometricsPublicKey(payload: SerializedBiometricsPayload) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      biometrics: payload,
    });
  }

  @action
  public async setSocialPublicKey(payload: SerializedSocialPayload) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      social: payload,
    });
  }

  @action
  public async finishProxySetup(address: SerializedProxyAddress) {
    this.keyInRecovery = null;
    this._walletInRecovery = null;
    this._updateProposed = false;
    this.proxyAddresses[this.chainStore.currentChain] = address;
    await this.setCurrentAdmin(this.serializedNextAdmin);
  }

  @action
  public recover(keyId: MultisigKey) {
    this.keyInRecovery = keyId;
    this._updateProposed = false;
  }

  @action
  public async cancelRecovery() {
    if (this.serializedCurrentAdmin) {
      await this.setNextAdmin(this.serializedCurrentAdmin);
    }
    this.keyInRecovery = null;
    this._walletInRecovery = null;
    this._updateProposed = false;
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
    return this.serializedWallet.data.proxyAddresses;
  }

  protected get serializedCurrentAdmin() {
    return this.serializedWallet.data.currentAdmin;
  }

  protected get serializedNextAdmin() {
    return this.serializedWallet.data.nextAdmin;
  }
}
