import { Crypto, KeyStore } from "./crypto";
import { generateWalletFromMnemonic } from "@everett-protocol/cosmosjs/utils/key";
import { PrivKey } from "@everett-protocol/cosmosjs/crypto";

const Buffer = require("buffer/").Buffer;

export enum KeyRingStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED
}

export interface KeyRingData {
  keyStore?: KeyStore;
}

export interface Key {
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
}

/*
 Keyring stores keys in persistent backround.
 And, this manages the state, crypto, address, signing and so on...
 */
export class KeyRing {
  private cached: Map<string, PrivKey> = new Map();

  private loaded: boolean;

  private _mnemonic: string;

  private keyStore: KeyStore | undefined;

  constructor() {
    this.loaded = false;
    this._mnemonic = "";
    this.keyStore = undefined;
  }

  private get mnemonic(): string {
    return this._mnemonic;
  }

  private set mnemonic(mnemonic: string) {
    this._mnemonic = mnemonic;
    this.cached = new Map();
  }

  public get status(): KeyRingStatus {
    if (!this.loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (this.keyStore === undefined) {
      return KeyRingStatus.EMPTY;
    } else if (this.mnemonic) {
      return KeyRingStatus.UNLOCKED;
    } else {
      return KeyRingStatus.LOCKED;
    }
  }

  public getKey(path: string): Key {
    return this.loadKey(path);
  }

  public async createKey(mnemonic: string, password: string) {
    this.mnemonic = mnemonic;
    this.keyStore = await Crypto.encrypt(this.mnemonic, password);
  }

  public lock() {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    this.mnemonic = "";
  }

  public async unlock(password: string) {
    if (!this.keyStore) {
      throw new Error("Key ring not initialized");
    }
    // If password is invalid, error will be thrown.
    this.mnemonic = Buffer.from(
      await Crypto.decrypt(this.keyStore, password)
    ).toString();
  }

  public async save() {
    const data: KeyRingData = {
      keyStore: this.keyStore
    };
    await new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  public async restore() {
    const get = () => {
      return new Promise<KeyRingData>((resolve, reject) => {
        chrome.storage.local.get(data => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          resolve(data as KeyRingData);
        });
      });
    };

    const data = await get();

    if (data.keyStore) {
      this.keyStore = data.keyStore;
    }
    this.loaded = true;
  }

  /**
   * This will clear all key ring data.
   * Make sure to use this only in development env for testing.
   */
  public async clear() {
    this.keyStore = undefined;
    this.mnemonic = "";
    this.cached = new Map();

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
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    const cachedKey = this.cached.get(path);
    if (cachedKey) {
      return cachedKey;
    }

    const privKey = generateWalletFromMnemonic(this.mnemonic, path);

    this.cached.set(path, privKey);
    return privKey;
  }

  public sign(path: string, message: Uint8Array): Uint8Array {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    const privKey = this.loadPrivKey(path);
    return privKey.sign(message);
  }
}
