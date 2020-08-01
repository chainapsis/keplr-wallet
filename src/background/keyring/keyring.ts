import { Crypto, KeyStore } from "./crypto";
import { generateWalletFromMnemonic } from "@everett-protocol/cosmosjs/utils/key";
import { PrivKey, PrivKeySecp256k1 } from "@everett-protocol/cosmosjs/crypto";
import { KVStore } from "../../common/kvstore";

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

export type MultiKeyStoreInfo = Pick<KeyStore, "version" | "type" | "meta">[];

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

  private keyStore: KeyStore | null;

  private multiKeyStore: KeyStore[];

  private password: string = "";

  constructor(private readonly kvStore: KVStore) {
    this.loaded = false;
    this.keyStore = null;
    this.multiKeyStore = [];
  }

  public get type(): "mnemonic" | "privateKey" | "none" {
    if (!this.keyStore) {
      return "none";
    } else {
      const type = this.keyStore.type;
      if (type == null) {
        return "mnemonic";
      }

      if (type !== "mnemonic" && type !== "privateKey") {
        throw new Error("Invalid type of key store");
      }

      return type;
    }
  }

  public isLocked(): boolean {
    return this.privateKey == null && this.mnemonic == null;
  }

  private get privateKey(): Uint8Array | undefined {
    return this._privateKey;
  }

  private set privateKey(privateKey: Uint8Array | undefined) {
    this._privateKey = privateKey;
    this._mnemonic = undefined;
    this.cached = new Map();
  }

  private get mnemonic(): string | undefined {
    return this._mnemonic;
  }

  private set mnemonic(mnemonic: string | undefined) {
    this._mnemonic = mnemonic;
    this._privateKey = undefined;
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

  public getKey(path: string): Key {
    return this.loadKey(path);
  }

  public async createMnemonicKey(
    mnemonic: string,
    password: string,
    meta: Record<string, string>
  ) {
    if (this.status !== KeyRingStatus.EMPTY) {
      throw new Error("Key ring is not loaded or not empty");
    }

    this.mnemonic = mnemonic;
    this.keyStore = await KeyRing.CreateMnemonicKeyStore(
      mnemonic,
      password,
      meta
    );
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
      meta
    );
    this.multiKeyStore.push(this.keyStore);
  }

  public lock() {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    this.mnemonic = undefined;
    this.privateKey = undefined;
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
    } else {
      // If password is invalid, error will be thrown.
      this.privateKey = Buffer.from(
        Buffer.from(await Crypto.decrypt(this.keyStore, password)).toString(),
        "hex"
      );
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
        this.multiKeyStore = [keyStore];
      } else {
        this.multiKeyStore = [];
      }
    } else {
      this.multiKeyStore = multiKeyStore;
    }
    this.loaded = true;
  }

  /**
   * This will clear all key ring data.
   */
  public async clear(password: string) {
    if (!this.keyStore) {
      throw new Error("Key ring is not initialized");
    }

    // Make sure that password is valid.
    await Crypto.decrypt(this.keyStore, password);

    this.keyStore = null;
    this.mnemonic = undefined;
    this.privateKey = undefined;

    await this.save();
  }

  private loadKey(path: string): Key {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    const privKey = this.loadPrivKey(path);
    const pubKey = privKey.toPubKey();

    return {
      algo: "secp256k1",
      pubKey: pubKey.serialize(),
      address: pubKey.toAddress().toBytes()
    };
  }

  private loadPrivKey(path: string): PrivKey {
    if (this.status !== KeyRingStatus.UNLOCKED || this.type === "none") {
      throw new Error("Key ring is not unlocked");
    }

    if (this.type === "mnemonic") {
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

  public sign(path: string, message: Uint8Array): Uint8Array {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    const privKey = this.loadPrivKey(path);
    return privKey.sign(message);
  }

  // Show private key or mnemonic key if password is valid.
  public async showKeyRing(password: string): Promise<string> {
    if (!this.keyStore || this.type === "none") {
      throw new Error("Key ring not initialized");
    }

    if (this.type === "mnemonic") {
      // If password is invalid, error will be thrown.
      return Buffer.from(
        await Crypto.decrypt(this.keyStore, password)
      ).toString();
    } else {
      // If password is invalid, error will be thrown.
      return Buffer.from(
        await Crypto.decrypt(this.keyStore, password)
      ).toString();
    }
  }

  public get canSetPath(): boolean {
    return this.type === "mnemonic";
  }

  public async addMnemonicKey(
    mnemonic: string,
    meta: Record<string, string>
  ): Promise<MultiKeyStoreInfo> {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new Error("Key ring is locked or not initialized");
    }

    const keyStore = await KeyRing.CreateMnemonicKeyStore(
      mnemonic,
      this.password,
      meta
    );
    this.multiKeyStore.push(keyStore);

    return this.getMultiKeyStoreInfo();
  }

  public async addPrivateKey(
    privateKey: Uint8Array,
    meta: Record<string, string>
  ): Promise<MultiKeyStoreInfo> {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new Error("Key ring is locked or not initialized");
    }

    const keyStore = await KeyRing.CreatePrivateKeyStore(
      privateKey,
      this.password,
      meta
    );
    this.multiKeyStore.push(keyStore);

    return this.getMultiKeyStoreInfo();
  }

  public async changeKeyStoreFromMultiKeyStore(index: number) {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new Error("Key ring is locked or not initialized");
    }

    const keyStore = this.multiKeyStore[index];
    if (!keyStore) {
      throw new Error("Invalid keystore");
    }

    this.keyStore = keyStore;

    await this.unlock(this.password);
  }

  public getMultiKeyStoreInfo(): MultiKeyStoreInfo {
    const result: MultiKeyStoreInfo = [];

    for (const keyStore of this.multiKeyStore) {
      result.push({
        version: keyStore.version,
        type: keyStore.type,
        meta: keyStore.meta
      });
    }

    return result;
  }

  private static async CreateMnemonicKeyStore(
    mnemonic: string,
    password: string,
    meta: Record<string, string>
  ): Promise<KeyStore> {
    return await Crypto.encrypt("mnemonic", mnemonic, password, meta);
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
}
