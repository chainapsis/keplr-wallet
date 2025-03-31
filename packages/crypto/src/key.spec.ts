import { Mnemonic } from "./mnemonic";
import {
  PrivKeySecp256k1,
  PubKeyBitcoinCompatible,
  PubKeySecp256k1,
} from "./key";
import { Hash } from "./hash";
import * as ecc from "./ecc-adapter";
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
    const path = `m/44'/118'/0'/0/0`;

    const { privateKey, masterFingerprint } =
      Mnemonic.generatePrivateKeyFromMasterSeed(
        Mnemonic.generateMasterSeedFromMnemonic(mnemonic),
        path
      );

    const privKey = new PrivKeySecp256k1(privateKey, masterFingerprint, path);

    const bitcoinPubKey = privKey.getBitcoinPubKey();

    expect(bitcoinPubKey.getMasterFingerprint()).not.toBeUndefined();
    expect(bitcoinPubKey.getMasterFingerprint()).toBe(masterFingerprint);

    expect(bitcoinPubKey.getPath()).not.toBeUndefined();
    expect(bitcoinPubKey.getPath()).toBe(path);

    const legacyAddress = bitcoinPubKey.getBitcoinAddress("legacy");

    expect(legacyAddress).not.toBeUndefined();
    expect(legacyAddress?.startsWith("1")).toBe(true);
    expect(legacyAddress).toBe("14jmwUEdEZ7Bn3ksbhceZryVdkbbdSCsMU");

    const nativeSegwitAddress =
      bitcoinPubKey.getBitcoinAddress("native-segwit");

    expect(nativeSegwitAddress).not.toBeUndefined();
    expect(nativeSegwitAddress?.startsWith("bc1q")).toBe(true);
    expect(nativeSegwitAddress).toBe(
      "bc1q9rl4cm2hmr8afy4kldpxz3fka4jguq0a26nkmc"
    );

    const taprootAddress = bitcoinPubKey.getBitcoinAddress("taproot");

    expect(taprootAddress).not.toBeUndefined();
    expect(taprootAddress?.startsWith("bc1p")).toBe(true);
    expect(taprootAddress).toBe(
      "bc1ps0m23ua63lejktfq0vf9dp603q4h7l4tkcc4n644uph5ccjkjs8suu99pl"
    );

    const defaultAddress = bitcoinPubKey.getBitcoinAddress(); // 44 for legacy

    expect(defaultAddress).not.toBeUndefined();
    expect(defaultAddress?.startsWith("1")).toBe(true);
    expect(defaultAddress).toBe("14jmwUEdEZ7Bn3ksbhceZryVdkbbdSCsMU");

    const noDefaultAddressPubKey = privKey.getPubKey().toBitcoinPubKey();

    expect(noDefaultAddressPubKey.getBitcoinAddress()).toBeUndefined();
  });

  it("test dogecoin address", () => {
    const mnemonic =
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

    const privKey = new PrivKeySecp256k1(
      Mnemonic.generateWalletFromMnemonic(mnemonic)
    );

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

    const dogecoinPubKey = privKey.getBitcoinPubKey(dogecoinMainnet);

    const legacyAddress = dogecoinPubKey.getBitcoinAddress("legacy");

    expect(legacyAddress).not.toBeUndefined();
    expect(legacyAddress?.startsWith("D")).toBe(true);
    expect(legacyAddress).toBe("D8ssUjBGXy1UK3wULHcD7d96WtKtus5My3");
  });

  it("test bitcoin pubkey from descriptor", () => {
    const xpub =
      "xpub6Fd2f6TiHNAWkKxDNxvLfRgE6m1Xos1pgfMcLDQX7jHrNyR2RzpHGQE1rCPNqhxSZnMS2G37Ht1DvukVNpWC3gUCx62mzaWdxxy4h8BYCUz";
    const hdPath = "m/86'/0'/0'/0/0";
    const masterFingerprint = "1c1fbbc3";

    const descriptor = PubKeyBitcoinCompatible.createDescriptor(
      "tr",
      masterFingerprint,
      hdPath,
      xpub
    );

    expect(descriptor).toBe(
      "tr([1c1fbbc3/86'/0'/0'/0/0]xpub6Fd2f6TiHNAWkKxDNxvLfRgE6m1Xos1pgfMcLDQX7jHrNyR2RzpHGQE1rCPNqhxSZnMS2G37Ht1DvukVNpWC3gUCx62mzaWdxxy4h8BYCUz)"
    );

    const pubKey = PubKeyBitcoinCompatible.fromDescriptor(descriptor);

    expect(pubKey.getBitcoinAddress()).toBe(
      "bc1p6tc2uwrwy2yjtzsfjrjugm2d5q6rkvjuylnnrk62xa4fzfpfwn0q9k3qq8"
    );
    expect(pubKey.getMasterFingerprint()).not.toBeUndefined();
    expect(pubKey.getMasterFingerprint()).toBe(masterFingerprint);
    expect(pubKey.getPath()).not.toBeUndefined();
    expect(pubKey.getPath()).toBe(hdPath);
    expect(Buffer.from(pubKey.toBytes()).toString("hex")).toBe(
      "0388496b304f490c5466cc60c3d82cc40835f474a6ba17b056e588bf49d1290ff6"
    );

    expect(Buffer.from(pubKey.toBytes(true)).toString("hex")).toBe(
      "0488496b304f490c5466cc60c3d82cc40835f474a6ba17b056e588bf49d1290ff6f157c79efa77687d6e4d06d7e4a3a0af3db5c516d6d75be6ab74234bf7b89a11"
    );
  });

  it("test bitcoin pubkey from base58", () => {
    const xpub =
      "xpub6Fd2f6TiHNAWkKxDNxvLfRgE6m1Xos1pgfMcLDQX7jHrNyR2RzpHGQE1rCPNqhxSZnMS2G37Ht1DvukVNpWC3gUCx62mzaWdxxy4h8BYCUz";

    const hdPath = "m/86'/0'/0'/0/0";

    const pubKey = PubKeyBitcoinCompatible.fromBase58(xpub, hdPath);

    expect(pubKey.getBitcoinAddress()).toBe(
      "bc1p6tc2uwrwy2yjtzsfjrjugm2d5q6rkvjuylnnrk62xa4fzfpfwn0q9k3qq8"
    );
    expect(pubKey.getMasterFingerprint()).toBeUndefined();
    expect(pubKey.getPath()).not.toBeUndefined();
    expect(pubKey.getPath()).toBe(hdPath);
    expect(Buffer.from(pubKey.toBytes()).toString("hex")).toBe(
      "0388496b304f490c5466cc60c3d82cc40835f474a6ba17b056e588bf49d1290ff6"
    );
  });
});
