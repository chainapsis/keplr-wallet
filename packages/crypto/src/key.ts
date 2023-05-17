import { ec } from "elliptic";
import CryptoJS from "crypto-js";
import {
  SecretKey as SecretKeyBlst,
  PublicKey as PublicKeyBlst,
  Signature as SignatureBlst,
  verify as verifyBlst,
} from "@fetchai/blst-ts";

import { Buffer } from "buffer/";
import { Hash } from "./hash";

export const KeyCurves: Record<KeyCurve, KeyCurve> = {
  secp256k1: "secp256k1",
  bls12381: "bls12381",
};

export type KeyCurve = "secp256k1" | "bls12381";

export interface PublicKey {
  toBytes(): Uint8Array;

  getAddress(): Uint8Array;

  verify(message: Uint8Array, signature: Uint8Array): boolean;
}

export interface SecretKey {
  readonly curve: KeyCurve;

  toBytes(): Uint8Array;

  sign(message: Uint8Array): Uint8Array;

  signDigest32(digest: Uint8Array): Uint8Array;

  getPubKey(): PublicKey;
}

export class PrivKeySecp256k1 implements SecretKey {
  readonly curve: KeyCurve = "secp256k1";

  static generateRandomKey(): PrivKeySecp256k1 {
    const secp256k1 = new ec("secp256k1");

    return new PrivKeySecp256k1(
      Buffer.from(secp256k1.genKeyPair().getPrivate().toArray())
    );
  }

  constructor(protected readonly privKey: Uint8Array) {}

  toBytes(): Uint8Array {
    return new Uint8Array(this.privKey);
  }

  getPubKey(): PubKeySecp256k1 {
    const secp256k1 = new ec("secp256k1");

    const key = secp256k1.keyFromPrivate(this.privKey);

    return new PubKeySecp256k1(
      new Uint8Array(key.getPublic().encodeCompressed("array"))
    );
  }

  /**
   * @deprecated Use `signDigest32(Hash.sha256(data))` instead.
   * @param msg
   */
  sign(msg: Uint8Array): Uint8Array {
    return this.signDigest32(Hash.sha256(msg));
  }

  signDigest32(digest: Uint8Array): Uint8Array {
    if (digest.length !== 32) {
      throw new Error(`Invalid length of digest to sign: ${digest.length}`);
    }

    const secp256k1 = new ec("secp256k1");
    const key = secp256k1.keyFromPrivate(this.privKey);

    const signature = key.sign(digest, {
      canonical: true,
    });

    return new Uint8Array(
      signature.r.toArray("be", 32).concat(signature.s.toArray("be", 32))
    );
  }
}

export class PubKeySecp256k1 {
  constructor(protected readonly pubKey: Uint8Array) {}

  toBytes(uncompressed?: boolean): Uint8Array {
    if (uncompressed) {
      const keyPair = this.toKeyPair();
      return new Uint8Array(
        Buffer.from(keyPair.getPublic().encode("hex", false), "hex")
      );
    }
    return new Uint8Array(this.pubKey);
  }

  // Cosmos address
  getAddress(): Uint8Array {
    let hash = CryptoJS.SHA256(
      CryptoJS.lib.WordArray.create(this.pubKey as any)
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

  toKeyPair(): ec.KeyPair {
    const secp256k1 = new ec("secp256k1");

    return secp256k1.keyFromPublic(
      Buffer.from(this.pubKey).toString("hex"),
      "hex"
    );
  }

  /**
   * @deprecated Use `verifyDigest32(Hash.sha256(data))` instead.
   * @param msg
   */
  verify(msg: Uint8Array, signature: Uint8Array): boolean {
    return this.verifyDigest32(Hash.sha256(msg), signature);
  }

  verifyDigest32(digest: Uint8Array, signature: Uint8Array): boolean {
    if (digest.length !== 32) {
      throw new Error(`Invalid length of digest to verify: ${digest.length}`);
    }

    if (signature.length !== 64) {
      throw new Error(`Invalid length of signature: ${signature.length}`);
    }

    const secp256k1 = new ec("secp256k1");

    const r = signature.slice(0, 32);
    const s = signature.slice(32);

    return secp256k1.verify(
      digest,
      {
        r: Buffer.from(r).toString("hex"),
        s: Buffer.from(s).toString("hex"),
      },
      this.toKeyPair()
    );
  }
}

export class SecretKeyBls12381 implements SecretKey {
  readonly curve: KeyCurve = "bls12381";
  protected secretKey: SecretKeyBlst;

  constructor(secretKeyBytes: Uint8Array) {
    this.secretKey = SecretKeyBlst.fromBytes(secretKeyBytes);
  }

  toBytes(): Uint8Array {
    return this.secretKey.toBytes();
  }

  getPubKey(): PublicKey {
    return PublicKeyBls12381.fromPublicKey(this.secretKey.toPublicKey());
  }

  sign(message: Uint8Array): Uint8Array {
    return this.secretKey.sign(message).toBytes();
  }

  signDigest32(digest: Uint8Array): Uint8Array {
    return this.sign(digest);
  }
}

export class PublicKeyBls12381 implements PublicKey {
  protected publicKey: PublicKeyBlst;

  constructor(publicKeyBytes: Uint8Array) {
    this.publicKey = PublicKeyBlst.fromBytes(publicKeyBytes);
  }

  static fromPublicKey(publicKey: PublicKeyBlst): PublicKeyBls12381 {
    return new PublicKeyBls12381(publicKey.toBytes());
  }

  toBytes(): Uint8Array {
    return this.publicKey.toBytes();
  }

  // TODO: the notion of address is likely different in the
  //  group module context and may be N/A.
  getAddress(): Uint8Array {
    let hash = CryptoJS.SHA256(
      CryptoJS.lib.WordArray.create(this.toBytes() as any)
    ).toString();
    hash = CryptoJS.RIPEMD160(CryptoJS.enc.Hex.parse(hash)).toString();

    return new Uint8Array(Buffer.from(hash, "hex"));
  }

  verify(message: Uint8Array, signature: Uint8Array): boolean {
    const blsSignature = SignatureBlst.fromBytes(signature);
    return verifyBlst(message, this.publicKey, blsSignature);
  }
}
