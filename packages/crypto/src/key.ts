import { secp256k1 } from "@noble/curves/secp256k1";
import * as utils from "@noble/curves/abstract/utils";
import CryptoJS from "crypto-js";

import { Buffer } from "buffer/";
import { Hash } from "./hash";

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
    let hash = CryptoJS.SHA256(
      CryptoJS.lib.WordArray.create(this.toBytes(false) as any)
    ).toString();
    hash = CryptoJS.RIPEMD160(CryptoJS.enc.Hex.parse(hash)).toString();

    return new Uint8Array(Buffer.from(hash, "hex"));
  }

  getEthAddress(): Uint8Array {
    // Should be uncompressed.
    // And remove prefix byte.
    // And hash by keccak256.
    // Use last 20 bytes.
    return Hash.keccak256(this.toBytes(true).slice(1)).slice(-20);
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
