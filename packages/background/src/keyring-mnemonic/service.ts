import { VaultService, PlainObject, Vault } from "../vault";
import { Buffer } from "buffer/";
import { Buffer as NodeBuffer } from "buffer";
import {
  Hash,
  Mnemonic,
  PrivKeySecp256k1,
  PubKeySecp256k1,
} from "@keplr-wallet/crypto";
import { KeyRing } from "src/keyring/types";
import { ModularChainInfo } from "@keplr-wallet/types";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

export class KeyRingMnemonicService implements KeyRing {
  constructor(protected readonly vaultService: VaultService) {}

  async init(): Promise<void> {
    // TODO: ?
  }

  supportedKeyRingType(): string {
    return "mnemonic";
  }

  createKeyRingVault(
    mnemonic: string,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    }
  ): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }> {
    if (!mnemonic || typeof mnemonic !== "string") {
      throw new Error("Invalid arguments");
    }

    // Validate mnemonic.
    // Checksome shouldn't be validated in this method.
    try {
      bip39.mnemonicToEntropy(mnemonic);
    } catch (e) {
      if (e.message !== "Invalid mnemonic checksum") {
        throw e;
      }
    }

    const masterSeed = Mnemonic.generateMasterSeedFromMnemonic(mnemonic);
    const masterSeedText = Buffer.from(masterSeed).toString("hex");

    return Promise.resolve({
      insensitive: {
        bip44Path,
      },
      sensitive: {
        masterSeedText,
        mnemonic,
      },
    });
  }

  getPubKey(vault: Vault, coinType: number): PubKeySecp256k1 {
    const bip44Path = this.getBIP44PathFromVault(vault);

    const tag = `pubKey-m/44'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`;

    if (vault.insensitive[tag]) {
      const pubKey = Buffer.from(vault.insensitive[tag] as string, "hex");
      return new PubKeySecp256k1(pubKey);
    }

    const privKey = this.getPrivKey(vault, coinType);

    const pubKey = privKey.getPubKey();

    const pubKeyText = Buffer.from(pubKey.toBytes()).toString("hex");
    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vault.id, {
      [tag]: pubKeyText,
    });

    return pubKey;
  }

  sign(
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256" | "hash256" | "noop",
    _modularChainInfo: ModularChainInfo,
    options?: {
      signMethod?: "ecdsa" | "schnorr";
      tweak?: Uint8Array;
    }
  ): {
    readonly r: Uint8Array;
    readonly s: Uint8Array;
    readonly v: number | null;
    readonly schnorr?: Uint8Array;
  } {
    const privKey = this.getPrivKey(vault, coinType);

    let digest = new Uint8Array();
    switch (digestMethod) {
      case "sha256":
        digest = Hash.sha256(data);
        break;
      case "keccak256":
        digest = Hash.keccak256(data);
        break;
      case "hash256":
        digest = Hash.hash256(data);
        break;
      case "noop":
        digest = data.slice();
        break;
      default:
        throw new Error(`Unknown digest method: ${digestMethod}`);
    }

    if (options?.signMethod === "schnorr") {
      let keyPair = privKey.toKeyPair();

      if (options?.tweak) {
        keyPair = keyPair.tweak(NodeBuffer.from(options.tweak));
      }

      const schnorr = keyPair.signSchnorr(NodeBuffer.from(digest));

      return {
        r: new Uint8Array(),
        s: new Uint8Array(),
        v: null,
        schnorr,
      };
    }

    return privKey.signDigest32(digest);
  }

  protected getPrivKey(vault: Vault, coinType: number): PrivKeySecp256k1 {
    const bip44Path = this.getBIP44PathFromVault(vault);

    const decrypted = this.vaultService.decrypt(vault.sensitive);
    const masterSeedText = decrypted["masterSeedText"] as string | undefined;
    if (!masterSeedText) {
      throw new Error("masterSeedText is null");
    }

    const masterSeed = Buffer.from(masterSeedText, "hex");
    return new PrivKeySecp256k1(
      Mnemonic.generatePrivateKeyFromMasterSeed(
        masterSeed,
        `m/44'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
      )
    );
  }

  protected getBIP44PathFromVault(vault: Vault): {
    account: number;
    change: number;
    addressIndex: number;
  } {
    return vault.insensitive["bip44Path"] as {
      account: number;
      change: number;
      addressIndex: number;
    };
  }
}
