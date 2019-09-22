import { Key } from "./key";
import {
  generateSeed,
  generateWalletFromMnemonic
} from "@everett-protocol/cosmosjs/utils/key";
import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";

import { action, computed, observable } from "mobx";

export enum KeyRingStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED
}

export interface KeyRingData {
  mnemonic: string;
}

export class KeyRing {
  public static GenereateMnemonic(): string {
    return generateSeed(array => {
      return crypto.getRandomValues(array);
    }, 128);
  }

  private cached: Map<string, Key> = new Map();

  @observable
  private loaded!: boolean;

  @observable
  private mnemonic!: string;

  constructor(mnemonic: string) {
    this.setLoad(false);
    this.setMnemonic(mnemonic);
  }

  @action
  private setLoad(loaded: boolean) {
    this.loaded = loaded;
  }

  @action
  public setMnemonic(mnemonic: string) {
    this.mnemonic = mnemonic;
    this.cached = new Map();
  }

  @computed
  public get status(): KeyRingStatus {
    if (!this.loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (this.mnemonic === "") {
      return KeyRingStatus.EMPTY;
    }
    return KeyRingStatus.UNLOCKED;
  }

  public bech32Address(bip44: BIP44, prefix: string): string {
    return this.loadKey(bip44).bech32Address(prefix);
  }

  public async save() {
    const data: KeyRingData = {
      mnemonic: this.mnemonic
    };
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        this.setLoad(true);
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
    if (data.mnemonic) {
      this.setMnemonic(data.mnemonic);
    }
    this.setLoad(true);
  }

  private loadKey(bip44: BIP44): Key {
    if (this.mnemonic === "") {
      throw new Error("mnemonic not set");
    }

    const path = bip44.pathString(0, 0);
    const cachedKey = this.cached.get(path);
    if (cachedKey) {
      return cachedKey;
    }

    const privKey = generateWalletFromMnemonic(this.mnemonic, path);

    const key = new Key(privKey);
    this.cached.set(path, key);
    return key;
  }
}
