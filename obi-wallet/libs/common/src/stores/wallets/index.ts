import { KVStore } from "@keplr-wallet/common";
import { action, computed, makeObservable, observable, toJS } from "mobx";
import { nanoid } from "nanoid/non-secure";
import invariant from "tiny-invariant";

import { ChainStore } from "../chain";
import { MultisigWallet } from "./multisig-wallet";
import {
  migrateSerializedData,
  SerializedData,
  SerializedDataAnyVersion,
  SerializedMultisigWallet,
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

export { MultisigWallet, SinglesigWallet };

export function isSinglesigWallet(
  wallet: MultisigWallet | SinglesigWallet | null
): wallet is SinglesigWallet {
  return wallet?.type === "singlesig";
}

export function isMultisigWallet(
  wallet: MultisigWallet | SinglesigWallet | null
): wallet is MultisigWallet {
  return wallet?.type === "multisig";
}

export class WalletsStore {
  protected readonly chainStore: ChainStore;
  protected readonly kvStore: KVStore;
  protected readonly legacyKVStores: {
    multisig: KVStore;
    singlesig: KVStore;
  };

  @observable
  protected _wallets: {
    ids: string[];
    entities: Record<
      string,
      {
        wallet: SinglesigWallet | MultisigWallet;
        serializedWallet: SerializedWallet;
      }
    >;
  } = {
    ids: [],
    entities: {},
  };
  @observable
  public currentWalletId: string | null = null;
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
    if (this.currentWalletId === null) return null;
    return this._wallets.entities[this.currentWalletId].wallet;
  }

  public get type(): "multisig" | "singlesig" | null {
    return this.currentWallet?.type ?? null;
  }

  public get address(): string | null {
    return this.currentWallet?.address ?? null;
  }

  @computed
  public get currentWalletIndex() {
    if (!this.currentWalletId) return null;
    const index = this._wallets.ids.indexOf(this.currentWalletId);
    return index === -1 ? null : index;
  }

  @computed
  public get wallets() {
    return this._wallets.ids.map((id) => this._wallets.entities[id].wallet);
  }

  @computed
  public get readyWallets() {
    return this.wallets.filter((wallet) => wallet.isReady);
  }

  @computed
  protected get serializedWallets() {
    return this._wallets.ids.map(
      (id) => this._wallets.entities[id].serializedWallet
    );
  }

  @action
  public async addWallet(serializedWallet: SerializedWallet) {
    const wallet = this.addWalletWithoutSave(serializedWallet);
    await this.save();
    return wallet;
  }

  @action
  protected addWalletWithoutSave = (serializedWallet: SerializedWallet) => {
    const id = nanoid();
    const wallet = this.createWallet({ id, serializedWallet });
    this._wallets.ids.push(id);
    this._wallets.entities[id] = {
      wallet,
      serializedWallet,
    };
    this.currentWalletId = id;
    return wallet;
  };

  @action
  public async addMultisigWallet() {
    const wallet: SerializedMultisigWallet = {
      type: "multisig",
      data: {
        currentAdmin: null,
        nextAdmin: {
          biometrics: null,
          phoneNumber: null,
          social: null,
          cloud: null,
        },
        proxyAddresses: {},
      },
    };
    return (await this.addWallet(wallet)) as MultisigWallet;
  }

  @action
  public async removeWallet(walletIndex: number) {
    const [id] = this._wallets.ids.splice(walletIndex, 1);
    delete this._wallets.entities[id];
    if (this.currentWalletId === id) {
      this.currentWalletId = null;
    }
    await this.save();
  }

  @action
  public async setCurrentWallet(index: number) {
    this.currentWalletId = this._wallets.ids[index];
    await this.save();
  }

  @action
  public async logout() {
    this.currentWalletId = null;
    await this.save();
  }

  protected async init() {
    try {
      const [serializedData, ...legacyWallets] = await Promise.all([
        this.getSerializedData(),
        this.getSerializedLegacyMultisigData(),
        this.getSerializedLegacySinglesigData(),
      ]);

      let addedLegacyWallets = false;
      legacyWallets.forEach((legacyData) => {
        if (legacyData) {
          serializedData.wallets.push(legacyData);
          addedLegacyWallets = true;
        }
      });

      const { currentWalletIndex, wallets } =
        migrateSerializedData(serializedData);

      wallets.forEach(this.addWalletWithoutSave);

      // If legacy wallets were added, fall back to first wallet
      let walletIndexToUse = currentWalletIndex;
      if (addedLegacyWallets) walletIndexToUse ??= 0;

      this.currentWalletId =
        typeof walletIndexToUse === "number"
          ? this._wallets.ids[walletIndexToUse]
          : null;

      this.state = WalletState.READY;

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

  protected createWallet = ({
    id,
    serializedWallet,
  }: {
    id: string;
    serializedWallet: SerializedWallet;
  }) => {
    const onChange = async (serializedWallet: SerializedWallet) => {
      this._wallets.entities[id].serializedWallet = serializedWallet;
      await this.save();
    };

    switch (serializedWallet.type) {
      case "multisig":
        return new MultisigWallet({
          chainStore: this.chainStore,
          serializedWallet,
          onChange,
        });
      case "singlesig":
        return new SinglesigWallet({
          chainStore: this.chainStore,
          serializedWallet,
          onChange,
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
