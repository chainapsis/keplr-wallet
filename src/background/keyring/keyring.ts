import { Crypto, KeyStore } from "./crypto";
import { generateWalletFromMnemonic } from "@everett-protocol/cosmosjs/utils/key";
import {
  PrivKey,
  PrivKeySecp256k1,
  PubKeySecp256k1
} from "@everett-protocol/cosmosjs/crypto";
import { KVStore } from "../../common/kvstore";
import { LedgerKeeper } from "../ledger/keeper";
import { BIP44HDPath } from "./types";

const Buffer = require("buffer/").Buffer;

export enum KeyRingStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED
}

export interface Key {
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
}

export type MultiKeyStoreInfoElem = Pick<
  KeyStore,
  "version" | "type" | "meta" | "bip44HDPath"
>;
export type MultiKeyStoreInfo = MultiKeyStoreInfoElem[];
export type MultiKeyStoreInfoWithSelectedElem = MultiKeyStoreInfoElem & {
  selected: boolean;
};
export type MultiKeyStoreInfoWithSelected = MultiKeyStoreInfoWithSelectedElem[];

const KeyStoreKey = "key-store";
const KeyMultiStoreKey = "key-multi-store";

/*
 Keyring stores keys in persistent backround.
 And, this manages the state, crypto, address, signing and so on...
 */
export class KeyRing {
  private cached: Map<string, PrivKey> = new Map();

  private loaded: boolean;

  /**
   * Keyring can have either private key or mnemonic.
   * If keyring has private key, it can't set the BIP 44 path.
   */
  private _privateKey?: Uint8Array;
  private _mnemonic?: string;
  private _ledgerPublicKey?: Uint8Array;

  private keyStore: KeyStore | null;

  private multiKeyStore: KeyStore[];

  private password: string = "";

  constructor(
    private readonly kvStore: KVStore,
    private readonly ledgerKeeper: LedgerKeeper
  ) {
    this.loaded = false;
    this.keyStore = null;
    this.multiKeyStore = [];
  }

  public get type(): "mnemonic" | "privateKey" | "ledger" | "none" {
    if (!this.keyStore) {
      return "none";
    } else {
      const type = this.keyStore.type;
      if (type == null) {
        return "mnemonic";
      }

      if (type !== "mnemonic" && type !== "privateKey" && type !== "ledger") {
        throw new Error("Invalid type of key store");
      }

      return type;
    }
  }

  public isLocked(): boolean {
    return (
      this.privateKey == null &&
      this.mnemonic == null &&
      this.ledgerPublicKey == null
    );
  }

  private get privateKey(): Uint8Array | undefined {
    return this._privateKey;
  }

  private set privateKey(privateKey: Uint8Array | undefined) {
    this._privateKey = privateKey;
    this._mnemonic = undefined;
    this._ledgerPublicKey = undefined;
    this.cached = new Map();
  }

  private get mnemonic(): string | undefined {
    return this._mnemonic;
  }

  private set mnemonic(mnemonic: string | undefined) {
    this._mnemonic = mnemonic;
    this._privateKey = undefined;
    this._ledgerPublicKey = undefined;
    this.cached = new Map();
  }

  private get ledgerPublicKey(): Uint8Array | undefined {
    return this._ledgerPublicKey;
  }

  private set ledgerPublicKey(publicKey: Uint8Array | undefined) {
    this._mnemonic = undefined;
    this._privateKey = undefined;
    this._ledgerPublicKey = publicKey;
    this.cached = new Map();
  }

  public get status(): KeyRingStatus {
    if (!this.loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (!this.keyStore) {
      return KeyRingStatus.EMPTY;
    } else if (!this.isLocked()) {
      return KeyRingStatus.UNLOCKED;
    } else {
      return KeyRingStatus.LOCKED;
    }
  }

  public getKey(coinType: number): Key {
    return this.loadKey(coinType);
  }

  public async createMnemonicKey(
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ) {
    if (this.status !== KeyRingStatus.EMPTY) {
      throw new Error("Key ring is not loaded or not empty");
    }

    this.mnemonic = mnemonic;
    this.keyStore = await KeyRing.CreateMnemonicKeyStore(
      mnemonic,
      password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );
    this.password = password;
    this.multiKeyStore.push(this.keyStore);
  }

  public async createPrivateKey(
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ) {
    if (this.status !== KeyRingStatus.EMPTY) {
      throw new Error("Key ring is not loaded or not empty");
    }

    this.privateKey = privateKey;
    this.keyStore = await KeyRing.CreatePrivateKeyStore(
      privateKey,
      password,
      await this.assignKeyStoreIdMeta(meta)
    );
    this.password = password;
    this.multiKeyStore.push(this.keyStore);
  }

  public async createLedgerKey(
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ) {
    if (this.status !== KeyRingStatus.EMPTY) {
      throw new Error("Key ring is not loaded or not empty");
    }

    // Get public key first
    const publicKey = await this.ledgerKeeper.getPublicKey(bip44HDPath);

    const keyStore = await KeyRing.CreateLedgerKeyStore(
      publicKey,
      password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );

    this.password = password;
    this.keyStore = keyStore;
    this.multiKeyStore.push(this.keyStore);
  }

  public lock() {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    this.mnemonic = undefined;
    this.privateKey = undefined;
    this.ledgerPublicKey = undefined;
    this.password = "";
  }

  public async unlock(password: string) {
    if (!this.keyStore || this.type === "none") {
      throw new Error("Key ring not initialized");
    }

    if (this.type === "mnemonic") {
      // If password is invalid, error will be thrown.
      this.mnemonic = Buffer.from(
        await Crypto.decrypt(this.keyStore, password)
      ).toString();
    } else if (this.type === "privateKey") {
      // If password is invalid, error will be thrown.
      this.privateKey = Buffer.from(
        Buffer.from(await Crypto.decrypt(this.keyStore, password)).toString(),
        "hex"
      );
    } else if (this.type === "ledger") {
      this.ledgerPublicKey = Buffer.from(
        Buffer.from(await Crypto.decrypt(this.keyStore, password)).toString(),
        "hex"
      );
    } else {
      throw new Error("Unexpected type of keyring");
    }

    this.password = password;
  }

  public async save() {
    await this.kvStore.set<KeyStore>(KeyStoreKey, this.keyStore);
    await this.kvStore.set<KeyStore[]>(KeyMultiStoreKey, this.multiKeyStore);
  }

  public async restore() {
    const keyStore = await this.kvStore.get<KeyStore>(KeyStoreKey);
    if (!keyStore) {
      this.keyStore = null;
    } else {
      this.keyStore = keyStore;
    }
    const multiKeyStore = await this.kvStore.get<KeyStore[]>(KeyMultiStoreKey);
    if (!multiKeyStore) {
      // Restore the multi keystore if key store exist but multi key store is empty.
      // This case will occur if extension is updated from the prior version that doesn't support the multi key store.
      // This line ensures the backward compatibility.
      if (keyStore) {
        keyStore.meta = await this.assignKeyStoreIdMeta({});
        this.multiKeyStore = [keyStore];
      } else {
        this.multiKeyStore = [];
      }
      await this.save();
    } else {
      this.multiKeyStore = multiKeyStore;
    }
    this.loaded = true;
  }

  public async deleteKeyRing(
    index: number,
    password: string
  ): Promise<MultiKeyStoreInfoWithSelected> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (this.password !== password) {
      throw new Error("Invalid password");
    }

    const keyStore = this.multiKeyStore[index];

    if (!keyStore) {
      throw new Error("Empty key store");
    }

    const multiKeyStore = this.multiKeyStore
      .slice(0, index)
      .concat(this.multiKeyStore.slice(index + 1));

    // Make sure that password is valid.
    await Crypto.decrypt(keyStore, password);

    if (this.keyStore) {
      // If key store is currently selected key store
      if (
        KeyRing.getKeyStoreId(keyStore) === KeyRing.getKeyStoreId(this.keyStore)
      ) {
        // If there is a key store left
        if (multiKeyStore.length > 0) {
          // Lock key store at first
          await this.lock();
          // Select first key store
          this.keyStore = multiKeyStore[0];
          // And unlock it
          await this.unlock(password);
        } else {
          // Else clear keyring.
          this.keyStore = null;
          this.mnemonic = undefined;
          this.privateKey = undefined;
        }
      }
    }

    this.multiKeyStore = multiKeyStore;
    return this.getMultiKeyStoreInfo();
  }

  private loadKey(coinType: number): Key {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    if (this.keyStore.type === "ledger") {
      if (!this.ledgerPublicKey) {
        throw new Error("Ledger public key not set");
      }

      const pubKey = new PubKeySecp256k1(this.ledgerPublicKey);

      return {
        algo: "secp256k1",
        pubKey: pubKey.serialize(),
        address: pubKey.toAddress().toBytes()
      };
    } else {
      const privKey = this.loadPrivKey(coinType);
      const pubKey = privKey.toPubKey();

      return {
        algo: "secp256k1",
        pubKey: pubKey.serialize(),
        address: pubKey.toAddress().toBytes()
      };
    }
  }

  private loadPrivKey(coinType: number): PrivKey {
    if (
      this.status !== KeyRingStatus.UNLOCKED ||
      this.type === "none" ||
      !this.keyStore
    ) {
      throw new Error("Key ring is not unlocked");
    }

    const bip44HDPath = KeyRing.getKeyStoreBIP44Path(this.keyStore);

    if (this.type === "mnemonic") {
      const path = `m/44'/${coinType}'/${bip44HDPath.account}'/${bip44HDPath.change}/${bip44HDPath.addressIndex}`;
      const cachedKey = this.cached.get(path);
      if (cachedKey) {
        return cachedKey;
      }

      if (!this.mnemonic) {
        throw new Error(
          "Key store type is mnemonic and it is unlocked. But, mnemonic is not loaded unexpectedly"
        );
      }

      const privKey = generateWalletFromMnemonic(this.mnemonic, path);

      this.cached.set(path, privKey);
      return privKey;
    } else if (this.type === "privateKey") {
      // If key store type is private key, path will be ignored.

      if (!this.privateKey) {
        throw new Error(
          "Key store type is private key and it is unlocked. But, private key is not loaded unexpectedly"
        );
      }

      return new PrivKeySecp256k1(this.privateKey);
    } else {
      throw new Error("Unexpected type of keyring");
    }
  }

  public async sign(
    coinType: number,
    message: Uint8Array
  ): Promise<Uint8Array> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    if (this.keyStore.type === "ledger") {
      const pubKey = this.ledgerPublicKey;

      if (!pubKey) {
        throw new Error("Ledger public key is not initialized");
      }

      return await this.ledgerKeeper.sign(
        KeyRing.getKeyStoreBIP44Path(this.keyStore),
        pubKey,
        message
      );
    } else {
      const privKey = this.loadPrivKey(coinType);
      return privKey.sign(message);
    }
  }

  // Show private key or mnemonic key if password is valid.
  public async showKeyRing(index: number, password: string): Promise<string> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (this.password !== password) {
      throw new Error("Invalid password");
    }

    const keyStore = this.multiKeyStore[index];

    if (!keyStore) {
      throw new Error("Empty key store");
    }

    if (keyStore.type === "mnemonic") {
      // If password is invalid, error will be thrown.
      return Buffer.from(await Crypto.decrypt(keyStore, password)).toString();
    } else {
      // If password is invalid, error will be thrown.
      return Buffer.from(await Crypto.decrypt(keyStore, password)).toString();
    }
  }

  public get canSetPath(): boolean {
    return this.type === "mnemonic" || this.type === "ledger";
  }

  public async addMnemonicKey(
    mnemonic: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<MultiKeyStoreInfoWithSelected> {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new Error("Key ring is locked or not initialized");
    }

    const keyStore = await KeyRing.CreateMnemonicKeyStore(
      mnemonic,
      this.password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );
    this.multiKeyStore.push(keyStore);

    return this.getMultiKeyStoreInfo();
  }

  public async addPrivateKey(
    privateKey: Uint8Array,
    meta: Record<string, string>
  ): Promise<MultiKeyStoreInfoWithSelected> {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new Error("Key ring is locked or not initialized");
    }

    const keyStore = await KeyRing.CreatePrivateKeyStore(
      privateKey,
      this.password,
      await this.assignKeyStoreIdMeta(meta)
    );
    this.multiKeyStore.push(keyStore);

    return this.getMultiKeyStoreInfo();
  }

  public async addLedgerKey(
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<MultiKeyStoreInfoWithSelected> {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new Error("Key ring is locked or not initialized");
    }

    // Get public key first
    const publicKey = await this.ledgerKeeper.getPublicKey(bip44HDPath);

    const keyStore = await KeyRing.CreateLedgerKeyStore(
      publicKey,
      this.password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );

    this.multiKeyStore.push(keyStore);

    return this.getMultiKeyStoreInfo();
  }

  public async changeKeyStoreFromMultiKeyStore(
    index: number
  ): Promise<MultiKeyStoreInfoWithSelected> {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new Error("Key ring is locked or not initialized");
    }

    const keyStore = this.multiKeyStore[index];
    if (!keyStore) {
      throw new Error("Invalid keystore");
    }

    this.keyStore = keyStore;

    await this.unlock(this.password);

    return this.getMultiKeyStoreInfo();
  }

  public getMultiKeyStoreInfo(): MultiKeyStoreInfoWithSelected {
    const result: MultiKeyStoreInfoWithSelected = [];

    for (const keyStore of this.multiKeyStore) {
      result.push({
        version: keyStore.version,
        type: keyStore.type,
        meta: keyStore.meta,
        bip44HDPath: keyStore.bip44HDPath,
        selected: this.keyStore
          ? KeyRing.getKeyStoreId(keyStore) ===
            KeyRing.getKeyStoreId(this.keyStore)
          : false
      });
    }

    return result;
  }

  private static async CreateMnemonicKeyStore(
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
      "mnemonic",
      mnemonic,
      password,
      meta,
      bip44HDPath
    );
  }

  private static async CreatePrivateKeyStore(
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
      "privateKey",
      Buffer.from(privateKey).toString("hex"),
      password,
      meta
    );
  }

  private static async CreateLedgerKeyStore(
    publicKey: Uint8Array,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
      "ledger",
      Buffer.from(publicKey).toString("hex"),
      password,
      meta,
      bip44HDPath
    );
  }

  private async assignKeyStoreIdMeta(meta: {
    [key: string]: string;
  }): Promise<{
    [key: string]: string;
  }> {
    // `__id__` is used to distinguish the key store.
    return Object.assign({}, meta, {
      __id__: (await this.getIncrementalNumber()).toString()
    });
  }

  private static getKeyStoreId(keyStore: KeyStore): string {
    const id = keyStore.meta?.__id__;
    if (!id) {
      throw new Error("Key store's id is empty");
    }

    return id;
  }

  private static getKeyStoreBIP44Path(keyStore: KeyStore): BIP44HDPath {
    if (!keyStore.bip44HDPath) {
      return {
        account: 0,
        change: 0,
        addressIndex: 0
      };
    }
    KeyRing.validateBIP44Path(keyStore.bip44HDPath);
    return keyStore.bip44HDPath;
  }

  public static validateBIP44Path(bip44Path: BIP44HDPath): void {
    if (!Number.isInteger(bip44Path.account) || bip44Path.account < 0) {
      throw new Error("Invalid account in hd path");
    }

    if (
      !Number.isInteger(bip44Path.change) ||
      !(bip44Path.change === 0 || bip44Path.change === 1)
    ) {
      throw new Error("Invalid change in hd path");
    }

    if (
      !Number.isInteger(bip44Path.addressIndex) ||
      bip44Path.addressIndex < 0
    ) {
      throw new Error("Invalid address index in hd path");
    }
  }

  private async getIncrementalNumber(): Promise<number> {
    let num = await this.kvStore.get<number>("incrementalNumber");
    if (num === undefined) {
      num = 0;
    }
    num++;

    await this.kvStore.set("incrementalNumber", num);
    return num;
  }
}
