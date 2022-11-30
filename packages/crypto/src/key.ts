import { ec } from "elliptic";
import CryptoJS from "crypto-js";

import { Buffer } from "buffer/";

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

  sign(msg: Uint8Array): Uint8Array {
    const secp256k1 = new ec("secp256k1");
    const key = secp256k1.keyFromPrivate(this.privKey);

    const hash = CryptoJS.SHA256(
      CryptoJS.lib.WordArray.create(msg as any)
    ).toString();

    const signature = key.sign(Buffer.from(hash, "hex"), {
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

  verify(msg: Uint8Array, signature: Uint8Array): boolean {
    const hash = CryptoJS.SHA256(
      CryptoJS.lib.WordArray.create(msg as any)
    ).toString();

    const secp256k1 = new ec("secp256k1");

    let r = signature.slice(0, 32);
    let s = signature.slice(32);
    const rIsNegative = r[0] >= 0x80;
    const sIsNegative = s[0] >= 0x80;
    if (rIsNegative) {
      r = new Uint8Array([0, ...r]);
    }
    if (sIsNegative) {
      s = new Uint8Array([0, ...s]);
    }

    // Der encoding
    const derData = new Uint8Array([
      0x02,
      r.length,
      ...r,
      0x02,
      s.length,
      ...s,
    ]);
    return secp256k1.verify(
      Buffer.from(hash, "hex"),
      new Uint8Array([0x30, derData.length, ...derData]),
      this.toKeyPair()
    );
  }
}
