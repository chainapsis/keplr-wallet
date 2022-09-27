import { pubkeyToAddress, SinglePubkey } from "@cosmjs/amino";
import { toGenerator } from "@keplr-wallet/common";
import { Mnemonic } from "@keplr-wallet/crypto";
import { action, computed, flow, makeObservable, observable } from "mobx";
import secp256k1 from "secp256k1";

import { KVStore } from "../../kv-store";
import { ChainStore } from "../chain";

export enum SinglesigState {
  LOADING = "Loading",
  EMPTY = "Empty",
  INITIALIZED = "Initialized",
}

export class SinglesigStore {
  protected readonly chainStore: ChainStore;
  protected readonly kvStore: KVStore;

  @observable
  protected loading = false;

  @observable
  protected mnemonic: string | null = null;

  @observable
  public privateKey: Uint8Array | null = null;

  @observable
  public publicKey: SinglePubkey | null = null;

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
      this.kvStore.get<unknown | undefined>("singlesig")
    );

    if (typeof data === "string") {
      this.setMnemonic(data);
    }

    this.loading = false;
  }

  @computed
  public get state(): SinglesigState {
    if (this.loading) return SinglesigState.LOADING;
    if (this.mnemonic === null) return SinglesigState.EMPTY;
    return SinglesigState.INITIALIZED;
  }

  @computed
  public get address(): string | null {
    if (!this.publicKey) return null;
    return pubkeyToAddress(
      this.publicKey,
      this.chainStore.currentChainInformation.prefix
    );
  }

  @action
  public setMnemonic(mnemonic: string) {
    this.mnemonic = mnemonic;
    this.loading = false;

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

  public getMnemonic(): string | null {
    return this.mnemonic;
  }

  @action
  public logout() {
    this.mnemonic = null;
    this.publicKey = null;
    this.privateKey = null;
    void this.save();
  }

  protected async save() {
    await this.kvStore.set("singlesig", this.mnemonic);
  }
}
