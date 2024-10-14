import { secp256k1 } from "@noble/curves/secp256k1";
import * as utils from "@noble/curves/abstract/utils";
import { sha256 } from "@noble/hashes/sha2";
import { ripemd160 } from "@noble/hashes/ripemd160";
import { Buffer } from "buffer/";
import { Hash } from "./hash";
import { hash as starknetHash } from "starknet";

export class PrivKeySecp256k1 {
  static generateRandomKey(): PrivKeySecp256k1 {
    return new PrivKeySecp256k1(secp256k1.utils.randomPrivateKey());
  }

  constructor(protected readonly privKey: Uint8Array) {}

  toBytes(): Uint8Array {
    return new Uint8Array(this.privKey);
  }

  getPubKey(): PubKeySecp256k1 {
    return new PubKeySecp256k1(secp256k1.getPublicKey(this.privKey, true));
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
