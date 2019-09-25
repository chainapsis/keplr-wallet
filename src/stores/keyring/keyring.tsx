import { Key } from "./key";
import { Crypto } from "./crypto";
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
  chiper: string;
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

  @observable
  private cipher!: string;

  constructor() {
    this.setLoad(false);
    this.setChiper("");
    this.setMnemonic("");
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

  @action
  public setChiper(chiper: string) {
    this.cipher = chiper;
  }

  @computed
  public get status(): KeyRingStatus {
    if (!this.loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (this.cipher === "") {
      return KeyRingStatus.EMPTY;
    } else if (this.mnemonic) {
      return KeyRingStatus.UNLOCKED;
    } else {
      return KeyRingStatus.LOCKED;
    }
  }

  public bech32Address(bip44: BIP44, prefix: string): string {
    return this.loadKey(bip44).bech32Address(prefix);
  }

  public async lock(password: string) {
    this.setChiper(await Crypto.encrypt(this.mnemonic, password));
    this.setMnemonic("");
  }

  public async unlock(password: string) {
    this.setMnemonic(await Crypto.decrypt(this.cipher, password));
  }

  public async save() {
    const data: KeyRingData = {
      chiper: this.cipher
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
    }).then(() => {
      return new Promise(resolve => {
        chrome.runtime.sendMessage(
          { type: "setPersistentMemory", data: { mnemonic: this.mnemonic } },
          () => {
            resolve();
          }
        );
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

    const getPersistent = () => {
      return new Promise<any>(resolve => {
        chrome.runtime.sendMessage({ type: "getPersistentMemory" }, data => {
          resolve(data);
        });
      });
    };

    const [data, persistentData] = await Promise.all([get(), getPersistent()]);

    if (data.chiper) {
      this.setChiper(data.chiper);
    }
    if (persistentData && persistentData.mnemonic) {
      this.setMnemonic(persistentData.mnemonic);
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
