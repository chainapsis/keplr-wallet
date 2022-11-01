import { ec } from "elliptic";
import CryptoJS from "crypto-js";

import { Buffer } from "buffer/";
import { Hash } from "./hash";

export class PrivKeySecp256k1 {
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

  toBytes(): Uint8Array {
    return new Uint8Array(this.pubKey);
  }

  getAddress(): Uint8Array {
    let hash = CryptoJS.SHA256(
      CryptoJS.lib.WordArray.create(this.pubKey as any)
    ).toString();
    hash = CryptoJS.RIPEMD160(CryptoJS.enc.Hex.parse(hash)).toString();

    return new Uint8Array(Buffer.from(hash, "hex"));
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
