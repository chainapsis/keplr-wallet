// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip32 = require("bip32");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bs58check = require("bs58check");

import { Buffer } from "buffer/";

export type RNG = <
  T extends
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array
    | Uint8ClampedArray
    | Float32Array
    | Float64Array
    | DataView
    | null
>(
  array: T
) => Promise<T>;

export class Mnemonic {
  static async generateWallet(
    rng: RNG,
    path: string = `m/44'/118'/0'/0/0`,
    password: string = "",
    strength: number = 256
  ): Promise<{ privKey: Uint8Array; mnemonic: string }> {
    const mnemonic = await Mnemonic.generateSeed(rng, strength);
    const privKey = Mnemonic.generateWalletFromMnemonic(
      mnemonic,
      path,
      password
    );

    return {
      privKey,
      mnemonic,
    };
  }

  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  static async generateSeed(rng: RNG, strength: number = 128): Promise<string> {
    if (strength % 32 !== 0) {
      throw new TypeError("invalid entropy");
    }
    let bytes = new Uint8Array(strength / 8);
    bytes = await rng(bytes);
    return bip39.entropyToMnemonic(Buffer.from(bytes).toString("hex"));
  }

  static generateWalletFromMnemonic(
    mnemonic: string,
    path: string = `m/44'/118'/0'/0/0`,
    password: string = ""
  ): Uint8Array {
    const seed = bip39.mnemonicToSeedSync(mnemonic, password);
    const masterSeed = bip32.fromSeed(seed);
    const hd = masterSeed.derivePath(path);

    const privateKey = hd.privateKey;
    if (!privateKey) {
      throw new Error("null hd key");
    }
    return privateKey;
  }

  static generateMasterSeedFromMnemonic(
    mnemonic: string,
    password: string = ""
  ): Uint8Array {
    const seed = bip39.mnemonicToSeedSync(mnemonic, password);
    const masterKey = bip32.fromSeed(seed);

    return Buffer.from(bs58check.decode(masterKey.toBase58()));
  }

  static generatePrivateKeyFromMasterSeed(
    seed: Uint8Array,
    path: string = `m/44'/118'/0'/0/0`
  ): Uint8Array {
    const masterSeed = bip32.fromBase58(bs58check.encode(seed));
    const hd = masterSeed.derivePath(path);

    const privateKey = hd.privateKey;
    if (!privateKey) {
      throw new Error("null hd key");
    }
    return privateKey;
  }
}
