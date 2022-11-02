import { Mnemonic } from "./mnemonic";
import { PrivKeySecp256k1 } from "./key";
import { Hash } from "./hash";

describe("Test priv key", () => {
  it("priv key should generate the valid pub key", () => {
    const mnemonic =
      "celery husband drama unaware blue empower jelly twist program say prepare page";

    const privKey = new PrivKeySecp256k1(
      Mnemonic.generateWalletFromMnemonic(mnemonic)
    );
    const pubKey = privKey.getPubKey();
    expect(pubKey.toBytes()).toStrictEqual(
      new Uint8Array([
        2,
        57,
        75,
        197,
        54,
        51,
        54,
        106,
        42,
        185,
        181,
        214,
        151,
        169,
        76,
        140,
        1,
        33,
        204,
        94,
        63,
        13,
        85,
        74,
        99,
        22,
        126,
        219,
        49,
        140,
        234,
        232,
        188,
      ])
    );
  });

  it("priv key should generate the valid signature", () => {
    const privKey = PrivKeySecp256k1.generateRandomKey();
    const pubKey = privKey.getPubKey();

    const data = new Uint8Array([1, 2, 3]);
    const signature = privKey.signDigest32(Hash.sha256(data));
    expect(signature).toStrictEqual(privKey.sign(data));

    expect(pubKey.verify(data, signature)).toBe(true);
    expect(pubKey.verifyDigest32(Hash.sha256(data), signature)).toBe(true);
  });

  it("test assertions", () => {
    const privKey = PrivKeySecp256k1.generateRandomKey();
    const pubKey = privKey.getPubKey();

    expect(() => {
      // Not 32 bytes hash
      privKey.signDigest32(new Uint8Array([1, 2, 3]));
    }).toThrow();

    expect(() => {
      // Not 32 bytes hash
      pubKey.verifyDigest32(new Uint8Array([1, 2, 3]), new Uint8Array(64));
    }).toThrow();

    expect(() => {
      // Not 64 bytes signature
      pubKey.verifyDigest32(
        Hash.sha256(new Uint8Array([1, 2, 3])),
        new Uint8Array(63)
      );
    }).toThrow();
  });
});
