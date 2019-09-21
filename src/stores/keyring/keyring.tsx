import { Key } from "./key";
import {
  generateSeed,
  generateWalletFromMnemonic
} from "@everett-protocol/cosmosjs/utils/key";
import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";

export class KeyRing {
  public static GenereateMnemonic(): string {
    return generateSeed(crypto.getRandomValues);
  }

  private cached: Map<string, Key> = new Map();

  constructor(private mnemonic: string) {}

  public bech32Address(bip44: BIP44, prefix: string): string {
    return this.loadKey(bip44).bech32Address(prefix);
  }

  private loadKey(bip44: BIP44): Key {
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
