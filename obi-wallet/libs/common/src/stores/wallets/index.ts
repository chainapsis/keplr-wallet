import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable, observable, toJS } from "mobx";
import invariant from "tiny-invariant";

import { ChainStore } from "../chain";
import { MultisigWallet } from "./multisig-wallet";
import {
  migrateSerializedData,
  SerializedData,
  SerializedDataAnyVersion,
  SerializedMultisigWalletAnyVersion,
  SerializedSinglesigWalletAnyVersion,
  SerializedWallet,
  SerializedWalletAnyVersion,
} from "./serialized-data";
import { SinglesigWallet } from "./singlesig-wallet";

export enum WalletState {
  /** We are still loading the data from the KV stores. */
  LOADING = "LOADING",
  /** The data in the KV store was invalid. */
  INVALID = "INVALID",
  /** We successfully loaded the data from the KV stores. */
  READY = "READY",
}

export class WalletsStore {
  protected readonly chainStore: ChainStore;
  protected readonly kvStore: KVStore;
  protected readonly legacyKVStores: {
    multisig: KVStore;
    singlesig: KVStore;
  };

  @observable
  protected wallets: (SinglesigWallet | MultisigWallet)[] = [];
  @observable
  protected serializedWallets: SerializedWallet[] = [];
  @observable
  protected currentWalletIndex: number | null = null;

  @observable
  public state: WalletState = WalletState.LOADING;

  public __initPromise: Promise<void>;

  constructor({
    chainStore,
    kvStore,
    legacyKVStores,
  }: {
    chainStore: ChainStore;
    kvStore: KVStore;
    legacyKVStores: { multisig: KVStore; singlesig: KVStore };
  }) {
    this.chainStore = chainStore;
    this.kvStore = kvStore;
    this.legacyKVStores = legacyKVStores;
    makeObservable(this);
    this.__initPromise = this.init();
  }

  @computed
  public get currentWallet() {
    if (this.currentWalletIndex === null) return null;
    return this.wallets[this.currentWalletIndex];
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

      const { currentWalletIndex, wallets } =
        migrateSerializedData(serializedData);

      this.serializedWallets = wallets;
      this.wallets = wallets.map(this.createWallet);
      this.state = WalletState.READY;
      if (wallets.length === 0) {
        this.currentWalletIndex = null;
      } else {
        this.currentWalletIndex = currentWalletIndex ?? 0;
      }

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
        currentWalletIndex: null,
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

  protected createWallet = (serializedData: SerializedWallet) => {
    switch (serializedData.type) {
      case "multisig":
        return new MultisigWallet({ serializedData });
      case "singlesig":
        return new SinglesigWallet({
          chainStore: this.chainStore,
          serializedData,
        });
    }
  };

  protected async save() {
    const serializedData: SerializedData = {
      currentWalletIndex: this.currentWalletIndex,
      wallets: this.serializedWallets,
    };
    const data = toJS(serializedData);
    await this.kvStore.set("wallets", data);
  }
}
