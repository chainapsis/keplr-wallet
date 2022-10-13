import { KVStore } from "@keplr-wallet/common";
import { makeObservable, observable, toJS } from "mobx";
import invariant from "tiny-invariant";

import {
  migrateSerializedData,
  SerializedData,
  SerializedDataAnyVersion,
  SerializedMultisigWalletAnyVersion,
  SerializedSinglesigWalletAnyVersion,
  SerializedWallet,
  SerializedWalletAnyVersion,
} from "./serialized-data";

export enum WalletState {
  LOADING = "LOADING",
  INVALID = "INVALID",
  EMPTY = "EMPTY",
  INITIALIZED = "INITIALIZED",
}

export class WalletsStore {
  protected readonly kvStore: KVStore;
  protected readonly legacyKVStores: {
    multisig: KVStore;
    singlesig: KVStore;
  };

  @observable
  protected wallets: SerializedWallet[] = [];

  @observable
  public state: WalletState = WalletState.LOADING;

  public __initPromise: Promise<void>;

  constructor({
    kvStore,
    legacyKVStores,
  }: {
    kvStore: KVStore;
    legacyKVStores: { multisig: KVStore; singlesig: KVStore };
  }) {
    this.kvStore = kvStore;
    this.legacyKVStores = legacyKVStores;
    makeObservable(this);
    this.__initPromise = this.init();
  }

  protected async init() {
    try {
      const [serializedData, ...legacyWallets] = await Promise.all([
        this.getSerializedData(),
        this.getSerializedLegacyMultisigData(),
        this.getSerializedLegacySinglesigData(),
      ]);

      legacyWallets.forEach((legacyData) => {
        if (legacyData) serializedData.wallets.push(legacyData);
      });

      this.wallets = migrateSerializedData(serializedData).wallets;
      this.state =
        this.wallets.length === 0 ? WalletState.EMPTY : WalletState.INITIALIZED;
      await this.save();
    } catch (e) {
      const error = e as Error;
      this.state = WalletState.INVALID;
      console.error(error.message);
    }
  }

  protected async getSerializedData(): Promise<SerializedDataAnyVersion> {
    const data = await this.kvStore.get("wallets");
    if (!data) {
      return {
        wallets: [],
      };
    }

    invariant(
      SerializedDataAnyVersion.is(data),
      "Expected key `wallets` to be of type `SerializedDataAnyVersion`."
    );
    return data;
  }

  protected async getSerializedLegacyMultisigData(): Promise<SerializedWalletAnyVersion | null> {
    const data = await this.legacyKVStores.multisig.get("multisig");
    if (!data) return null;

    const wallet = {
      type: "multisig",
      data,
    };
    invariant(
      SerializedMultisigWalletAnyVersion.is(wallet),
      "Expected key `multisig` to be of type `SerializedMultisigWalletAnyVersion`."
    );
    await this.legacyKVStores.multisig.set("multisig", null);
    return wallet;
  }

  protected async getSerializedLegacySinglesigData(): Promise<SerializedWalletAnyVersion | null> {
    const data = await this.legacyKVStores.singlesig.get("singlesig");
    if (!data) return null;

    const wallet = {
      type: "singlesig",
      data,
    };
    invariant(
      SerializedSinglesigWalletAnyVersion.is(wallet),
      "Expected key `singlesig` to be of type `SerializedSinglesigWalletAnyVersion`."
    );
    await this.legacyKVStores.singlesig.set("singlesig", null);
    return wallet;
  }

  protected async save() {
    const serializedData: SerializedData = {
      wallets: this.wallets,
    };
    const data = toJS(serializedData);
    await this.kvStore.set("wallets", data);
  }
}
