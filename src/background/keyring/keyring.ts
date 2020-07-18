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

const KeyStoreKey = "key-store";

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

  constructor(private readonly kvStore: KVStore) {
    this.loaded = false;
    this.keyStore = null;
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

  public async createMnemonicKey(mnemonic: string, password: string) {
    this.mnemonic = mnemonic;
    this.keyStore = await Crypto.encrypt("mnemonic", this.mnemonic, password);
  }

  public async createPrivateKey(privateKey: Uint8Array, password: string) {
    this.privateKey = privateKey;
    this.keyStore = await Crypto.encrypt(
      "privateKey",
      Buffer.from(this.privateKey).toString("hex"),
      password
    );
  }

  public lock() {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    this.mnemonic = undefined;
    this.privateKey = undefined;
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
  }

  public async save() {
    await this.kvStore.set<KeyStore>(KeyStoreKey, this.keyStore);
  }

  public async restore() {
    const keyStore = await this.kvStore.get<KeyStore>(KeyStoreKey);
    if (!keyStore) {
      this.keyStore = null;
    } else {
      this.keyStore = keyStore;
    }
    this.loaded = true;
  }

  /**
   * This will clear all key ring data.
   * Make sure to use this only in development env for testing.
   */
  public async clear() {
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
        Buffer.from(await Crypto.decrypt(this.keyStore, password)).toString(),
        "hex"
      );
    }
  }

  public get canSetPath(): boolean {
    return this.type === "mnemonic";
  }
}
