import { Mnemonic } from "./mnemonic";
import { PrivKeySecp256k1, PubKeySecp256k1 } from "./key";
import { Hash } from "./hash";
import * as ecc from "tiny-secp256k1";
import * as bitcoin from "bitcoinjs-lib";

bitcoin.initEccLib(ecc);

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
        2, 57, 75, 197, 54, 51, 54, 106, 42, 185, 181, 214, 151, 169, 76, 140,
        1, 33, 204, 94, 63, 13, 85, 74, 99, 22, 126, 219, 49, 140, 234, 232,
        188,
      ])
    );
    expect(Buffer.from(pubKey.toBytes(true)).toString("hex")).toBe(
      "04394bc53633366a2ab9b5d697a94c8c0121cc5e3f0d554a63167edb318ceae8bc4eb24976de98fa19e8f947e9aaaca820251c77c45a87049f2c3cd649bb26c3d8"
    );
  });

  it("priv key should generate the valid key pair", () => {
    const privKey = PrivKeySecp256k1.generateRandomKey();
    const keyPair = privKey.toKeyPair();

    const pubKey = Buffer.from(privKey.getPubKey().toBytes()).toString("hex");
    const pubKeyFromKeyPair = keyPair.publicKey.toString("hex");

    expect(pubKeyFromKeyPair).toBe(pubKey);
  });

  it("priv key should generate the valid signature", () => {
    const privKey = PrivKeySecp256k1.generateRandomKey();
    const pubKey = privKey.getPubKey();

    const data = new Uint8Array([1, 2, 3]);
    const signature = privKey.signDigest32(Hash.sha256(data));

    expect(
      pubKey.verifyDigest32(
        Hash.sha256(data),
        new Uint8Array([...signature.r, ...signature.s])
      )
    ).toBe(true);
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

  it("test eth address", () => {
    const privKey = new PrivKeySecp256k1(
      Mnemonic.generateWalletFromMnemonic(
        "notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius",
        `m/44'/60'/0'/0/0`
      )
    );

    const ethAddress = privKey.getPubKey().getEthAddress();
    expect(Buffer.from(ethAddress).toString("hex")).toBe(
      "d38de26638cbf4f5c99bd8787fedfdb50c3f236a"
    );
  });

  it("public key should handle compress/uncompressed format as input", () => {
    expect(() => {
      // Invalid length
      new PubKeySecp256k1(new Uint8Array(13));
    }).toThrow();

    // uncompressed
    let pubKey = new PubKeySecp256k1(
      Buffer.from(
        "0422b7d0ab1ec915bf3902bd4d3a1dde5d0add15865f951d7ac3fb206e9e898f2d2cd59418a2a27b98eb1e39fc33c55faeed8e550dbf9226a594203c0c2430b0d7",
        "hex"
      )
    );

    expect(Buffer.from(pubKey.getAddress()).toString("hex")).toBe(
      "c1c0ea527e67f52791985f91b22237feccf56b36"
    );
    expect(Buffer.from(pubKey.getCosmosAddress()).toString("hex")).toBe(
      "c1c0ea527e67f52791985f91b22237feccf56b36"
    );
    expect(Buffer.from(pubKey.getEthAddress()).toString("hex")).toBe(
      "d38de26638cbf4f5c99bd8787fedfdb50c3f236a"
    );

    // compressed
    pubKey = new PubKeySecp256k1(
      Buffer.from(
        "0322b7d0ab1ec915bf3902bd4d3a1dde5d0add15865f951d7ac3fb206e9e898f2d",
        "hex"
      )
    );

    expect(Buffer.from(pubKey.getAddress()).toString("hex")).toBe(
      "c1c0ea527e67f52791985f91b22237feccf56b36"
    );
    expect(Buffer.from(pubKey.getCosmosAddress()).toString("hex")).toBe(
      "c1c0ea527e67f52791985f91b22237feccf56b36"
    );
    expect(Buffer.from(pubKey.getEthAddress()).toString("hex")).toBe(
      "d38de26638cbf4f5c99bd8787fedfdb50c3f236a"
    );
  });

  it("test bitcoin address", () => {
    const mnemonic =
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

    const privKey = new PrivKeySecp256k1(
      Mnemonic.generateWalletFromMnemonic(mnemonic)
    );

    const bitcoinPubKey = privKey.getBitcoinPubKey();

    const legacyAddressUncompressed = bitcoinPubKey.getLegacyAddress(true);

    expect(legacyAddressUncompressed).not.toBeUndefined();
    expect(legacyAddressUncompressed?.startsWith("1")).toBe(true);
    expect(legacyAddressUncompressed).toBe("1z5bFTcS7zfCHHKk3kXjvBNr6hMMNQYjh");
    const legacyAddressCompressed = bitcoinPubKey.getLegacyAddress(false);

    expect(legacyAddressCompressed).not.toBeUndefined();
    expect(legacyAddressCompressed?.startsWith("1")).toBe(true);
    expect(legacyAddressCompressed).toBe("14jmwUEdEZ7Bn3ksbhceZryVdkbbdSCsMU");

    const nativeSegwitAddress = bitcoinPubKey.getNativeSegwitAddress();

    expect(nativeSegwitAddress).not.toBeUndefined();
    expect(nativeSegwitAddress?.startsWith("bc1q")).toBe(true);
    expect(nativeSegwitAddress).toBe(
      "bc1q9rl4cm2hmr8afy4kldpxz3fka4jguq0a26nkmc"
    );

    const taprootAddress = bitcoinPubKey.getTaprootAddress();

    expect(taprootAddress).not.toBeUndefined();
    expect(taprootAddress?.startsWith("bc1p")).toBe(true);
    expect(taprootAddress).toBe(
      "bc1ps0m23ua63lejktfq0vf9dp603q4h7l4tkcc4n644uph5ccjkjs8suu99pl"
    );
  });

  it("test dogecoin address", () => {
    const mnemonic =
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

    const privKey = new PrivKeySecp256k1(
      Mnemonic.generateWalletFromMnemonic(mnemonic)
    );

    const dogecoinPubKey = privKey.getBitcoinPubKey();

    const dogecoinMainnet = {
      messagePrefix: "\x19Dogecoin Signed Message:\n",
      bech32: "doge",
      bip32: {
        public: 0x02facafd, // dpub
        private: 0x02fac398, // dprv
      },
      pubKeyHash: 0x1e, // 30 (주소가 D로 시작)
      scriptHash: 0x16, // 22
      wif: 0x9e, // 158
    };

    const legacyAddressUncompressed = dogecoinPubKey.getLegacyAddress(
      true,
      dogecoinMainnet
    );

    expect(legacyAddressUncompressed).not.toBeUndefined();
    expect(legacyAddressUncompressed?.startsWith("D")).toBe(true);
    expect(legacyAddressUncompressed).toBe(
      "D68B8WQFjXtwjHTvUdk6HgLyjERecjVEYX"
    );

    const legacyAddressCompressed = dogecoinPubKey.getLegacyAddress(
      false,
      dogecoinMainnet
    );

    expect(legacyAddressCompressed).not.toBeUndefined();
    expect(legacyAddressCompressed?.startsWith("D")).toBe(true);
    expect(legacyAddressCompressed).toBe("D8ssUjBGXy1UK3wULHcD7d96WtKtus5My3");
  });
});
