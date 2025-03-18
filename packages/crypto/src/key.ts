import { secp256k1 } from "@noble/curves/secp256k1";
import * as utils from "@noble/curves/abstract/utils";
import { sha256 } from "@noble/hashes/sha2";
import { ripemd160 } from "@noble/hashes/ripemd160";
import { Buffer } from "buffer/";
import { Buffer as NodeBuffer } from "buffer";
import { Hash } from "./hash";
import { hash as starknetHash } from "starknet";
import { ECPairInterface, ECPairFactory } from "ecpair";
import { Network as BitcoinJSNetwork, payments } from "bitcoinjs-lib";
import * as ecc from "./ecc-adapter";
import * as bitcoin from "bitcoinjs-lib";

bitcoin.initEccLib(ecc);
export class PrivKeySecp256k1 {
  static generateRandomKey(): PrivKeySecp256k1 {
    return new PrivKeySecp256k1(secp256k1.utils.randomPrivateKey());
  }

  constructor(
    protected readonly privKey: Uint8Array,
    protected readonly masterFingerprint?: string,
    protected readonly path?: string
  ) {}

  toBytes(): Uint8Array {
    return new Uint8Array(this.privKey);
  }

  toKeyPair(): ECPairInterface {
    return ECPairFactory(ecc).fromPrivateKey(NodeBuffer.from(this.privKey));
  }

  getPubKey(): PubKeySecp256k1 {
    return new PubKeySecp256k1(secp256k1.getPublicKey(this.privKey, true));
  }

  getBitcoinPubKey(): PubKeyBitcoinCompatible {
    const pubKey = secp256k1.getPublicKey(this.toBytes(), false);

    return new PubKeyBitcoinCompatible(
      pubKey,
      this.masterFingerprint,
      this.path
    );
  }

  signDigest32(digest: Uint8Array): {
    readonly r: Uint8Array;
    readonly s: Uint8Array;
    readonly v: number | null;
  } {
    if (digest.length !== 32) {
      throw new Error(`Invalid length of digest to sign: ${digest.length}`);
    }

    const signature = secp256k1.sign(digest, this.privKey, {
      lowS: true,
    });

    return {
      r: utils.numberToBytesBE(signature.r, 32),
      s: utils.numberToBytesBE(signature.s, 32),
      v: signature.recovery,
    };
  }
}

export class PubKeyStarknet {
  constructor(protected readonly pubKey: Uint8Array) {
    if (pubKey.length !== 64) {
      throw new Error(`Invalid length of public key: ${pubKey.length}`);
    }
  }

  toBytes(): Uint8Array {
    return new Uint8Array(this.pubKey);
  }

  getStarknetPubKey(): Uint8Array {
    return this.pubKey.slice(0, 32);
  }

  getStarknetAddress(salt: Uint8Array, classHash: Uint8Array): Uint8Array {
    const starknetPubKey = this.getStarknetPubKey();

    let calculated = starknetHash
      .calculateContractAddressFromHash(
        "0x" + Buffer.from(salt).toString("hex"),
        "0x" + Buffer.from(classHash).toString("hex"),
        ["0x" + Buffer.from(starknetPubKey).toString("hex")],
        "0x00"
      )
      .replace("0x", "");

    const padZero = 64 - calculated.length;
    if (padZero > 0) {
      calculated = "0".repeat(padZero) + calculated;
    } else if (padZero < 0) {
      throw new Error("Invalid length of calculated address");
    }

    return new Uint8Array(Buffer.from(calculated, "hex"));
  }

  getStarknetAddressParams(): {
    readonly xLow: Uint8Array;
    readonly xHigh: Uint8Array;
    readonly yLow: Uint8Array;
    readonly yHigh: Uint8Array;
  } {
    return {
      xLow: this.pubKey.slice(16, 32),
      xHigh: this.pubKey.slice(0, 16),
      yLow: this.pubKey.slice(48, 64),
      yHigh: this.pubKey.slice(32, 48),
    };
  }
}

export class PubKeySecp256k1 {
  constructor(protected readonly pubKey: Uint8Array) {
    if (pubKey.length !== 33 && pubKey.length !== 65) {
      throw new Error(`Invalid length of public key: ${pubKey.length}`);
    }
  }

  toBytes(uncompressed?: boolean): Uint8Array {
    if (uncompressed && this.pubKey.length === 65) {
      return this.pubKey;
    }
    if (!uncompressed && this.pubKey.length === 33) {
      return this.pubKey;
    }

    if (uncompressed) {
      return secp256k1.ProjectivePoint.fromHex(
        Buffer.from(this.pubKey).toString("hex")
      ).toRawBytes(false);
    } else {
      return secp256k1.ProjectivePoint.fromHex(
        Buffer.from(this.pubKey).toString("hex")
      ).toRawBytes(true);
    }
  }

  toBitcoinPubKey(): PubKeyBitcoinCompatible {
    return new PubKeyBitcoinCompatible(this.toBytes(false));
  }

  /**
   * @deprecated Use `getCosmosAddress()` instead.
   */
  getAddress(): Uint8Array {
    return this.getCosmosAddress();
  }

  getCosmosAddress(): Uint8Array {
    return ripemd160(sha256(this.toBytes(false)));
  }

  getEthAddress(): Uint8Array {
    // Should be uncompressed.
    // And remove prefix byte.
    // And hash by keccak256.
    // Use last 20 bytes.
    return Hash.keccak256(this.toBytes(true).slice(1)).slice(-20);
  }

  getStarknetAddress(salt: Uint8Array, classHash: Uint8Array): Uint8Array {
    const pubBytes = this.toBytes(true).slice(1);
    const xLow = pubBytes.slice(16, 32);
    const xHigh = pubBytes.slice(0, 16);
    const yLow = pubBytes.slice(48, 64);
    const yHigh = pubBytes.slice(32, 48);

    let calculated = starknetHash
      .calculateContractAddressFromHash(
        "0x" + Buffer.from(salt).toString("hex"),
        "0x" + Buffer.from(classHash).toString("hex"),
        [
          "0x" + Buffer.from(xLow).toString("hex"),
          "0x" + Buffer.from(xHigh).toString("hex"),
          "0x" + Buffer.from(yLow).toString("hex"),
          "0x" + Buffer.from(yHigh).toString("hex"),
        ],
        "0x00"
      )
      .replace("0x", "");

    const padZero = 64 - calculated.length;
    if (padZero > 0) {
      calculated = "0".repeat(padZero) + calculated;
    } else if (padZero < 0) {
      throw new Error("Invalid length of calculated address");
    }

    return new Uint8Array(Buffer.from(calculated, "hex"));
  }

  getStarknetAddressParams(): {
    readonly xLow: Uint8Array;
    readonly xHigh: Uint8Array;
    readonly yLow: Uint8Array;
    readonly yHigh: Uint8Array;
  } {
    const pubBytes = this.toBytes(true).slice(1);
    return {
      xLow: pubBytes.slice(16, 32),
      xHigh: pubBytes.slice(0, 16),
      yLow: pubBytes.slice(48, 64),
      yHigh: pubBytes.slice(32, 48),
    };
  }

  getStarknetPubKey(): Uint8Array {
    return this.pubKey.slice(1);
  }

  verifyDigest32(digest: Uint8Array, signature: Uint8Array): boolean {
    if (digest.length !== 32) {
      throw new Error(`Invalid length of digest to verify: ${digest.length}`);
    }

    if (signature.length !== 64) {
      throw new Error(`Invalid length of signature: ${signature.length}`);
    }

    const r = signature.slice(0, 32);
    const s = signature.slice(32);

    return secp256k1.verify(
      {
        r: utils.bytesToNumberBE(r),
        s: utils.bytesToNumberBE(s),
      },
      digest,
      this.pubKey
    );
  }
}

export class PubKeyBitcoinCompatible {
  constructor(
    protected readonly pubKey: Uint8Array,
    protected readonly masterFingerprint?: string,
    protected readonly path?: string
  ) {}

  toBytes(uncompressed?: boolean): Uint8Array {
    if (uncompressed && this.pubKey.length === 65) {
      return this.pubKey;
    }
    if (!uncompressed && this.pubKey.length === 33) {
      return this.pubKey;
    }

    if (uncompressed) {
      return secp256k1.ProjectivePoint.fromHex(
        Buffer.from(this.pubKey).toString("hex")
      ).toRawBytes(false);
    } else {
      return secp256k1.ProjectivePoint.fromHex(
        Buffer.from(this.pubKey).toString("hex")
      ).toRawBytes(true);
    }
  }

  getMasterFingerprint(): string | undefined {
    return this.masterFingerprint;
  }

  getPath(): string | undefined {
    return this.path;
  }

  getBitcoinAddress(
    paymentType?: "legacy" | "native-segwit" | "taproot",
    network?: BitcoinJSNetwork
  ): string | undefined {
    const pubKey = this.toBytes(false);

    const getLegacyAddress = () => {
      return payments.p2pkh({
        pubkey: NodeBuffer.from(pubKey),
        network,
      }).address;
    };

    const getNativeSegwitAddress = () => {
      return payments.p2wpkh({
        pubkey: NodeBuffer.from(pubKey),
        network,
      }).address;
    };

    const getTaprootAddress = () => {
      return payments.p2tr({
        internalPubkey: toXOnly(NodeBuffer.from(pubKey)),
        network,
      }).address;
    };

    switch (paymentType) {
      case "legacy":
        return getLegacyAddress();
      case "native-segwit":
        return getNativeSegwitAddress();
      case "taproot":
        return getTaprootAddress();
      default:
        const path = this.getPath();
        if (path) {
          const segments = path.split("/").filter(Boolean);
          // Check if this is a BIP44 compatible path
          const purposeIndex = segments[0] === "m" ? 1 : 0;

          if (segments.length >= purposeIndex + 5) {
            const purposeSegment = segments[purposeIndex];
            const purpose = parseInt(
              purposeSegment.endsWith("'")
                ? purposeSegment.slice(0, -1)
                : purposeSegment
            );

            // Determine payment type based on purpose
            if (purpose === 44) {
              return getLegacyAddress();
            } else if (purpose === 84) {
              return getNativeSegwitAddress();
            } else if (purpose === 86) {
              return getTaprootAddress();
            }
          }
        }
    }
  }
}

/**
 * Converts a public key to an X-only public key.
 * @param pubKey The public key to convert.
 * @returns The X-only public key.
 */
export const toXOnly = (pubKey: NodeBuffer) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
