import { pubkeyToAddress, SinglePubkey } from "@cosmjs/amino";
import { Mnemonic } from "@keplr-wallet/crypto";
import { computed, makeObservable, observable } from "mobx";
import secp256k1 from "secp256k1";

import { ChainStore } from "../chain";
import { AbstractWallet, WalletType } from "./abstract-wallet";
import { SerializedSinglesigWallet } from "./serialized-data";

export class SinglesigWallet extends AbstractWallet {
  protected readonly chainStore: ChainStore;

  public readonly _id: string;

  @observable
  protected serializedWallet: SerializedSinglesigWallet;

  @observable
  public privateKey: Uint8Array | null = null;

  @observable
  public publicKey: SinglePubkey | null = null;

  constructor({
    chainStore,
    id,
    serializedWallet,
  }: {
    chainStore: ChainStore;
    id: string;
    serializedWallet: SerializedSinglesigWallet;
    onChange: (serializedWallet: SerializedSinglesigWallet) => Promise<void>;
  }) {
    super();
    this.chainStore = chainStore;
    this._id = id;
    this.serializedWallet = serializedWallet;
    makeObservable(this);

    const { coinType } = this.chainStore.currentChainInformation.bip44;
    const bip44HDPath = {
      account: 0,
      change: 0,
      addressIndex: 0,
    };
    const path = `m/44'/${coinType}'/${bip44HDPath.account}'/${bip44HDPath.change}/${bip44HDPath.addressIndex}`;
    const masterSeed = Mnemonic.generateMasterSeedFromMnemonic(this.mnemonic);
    this.privateKey = Mnemonic.generatePrivateKeyFromMasterSeed(
      masterSeed,
      path
    );

    const publicKey = secp256k1.publicKeyCreate(this.privateKey);
    this.publicKey = {
      type: "tendermint/PubKeySecp256k1",
      value: Buffer.from(publicKey).toString("base64"),
    };
  }

  @computed
  public get address() {
    if (!this.publicKey) return null;
    return pubkeyToAddress(
      this.publicKey,
      this.chainStore.currentChainInformation.prefix
    );
  }

  public get id() {
    return this._id;
  }

  public get type() {
    return WalletType.Singlesig;
  }

  public get mnemonic() {
    return this.serializedWallet.data;
  }

  public get isReady() {
    return true;
  }
}
