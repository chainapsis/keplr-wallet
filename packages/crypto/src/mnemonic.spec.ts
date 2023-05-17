import { Mnemonic } from "./mnemonic";
import { PrivKeySecp256k1 } from "./key";

describe("Test gen key from mnemonic", () => {
  it("mnemonic should generate proper priv key", () => {
    const mnemonic =
      "celery husband drama unaware blue empower jelly twist program say prepare page";

    let privKey = new PrivKeySecp256k1(
      Mnemonic.generateWalletFromMnemonic(mnemonic)
    );
    let pubKey = privKey.getPubKey();
    expect(Buffer.from(pubKey.toBytes()).toString("hex")).toBe(
      "02394bc53633366a2ab9b5d697a94c8c0121cc5e3f0d554a63167edb318ceae8bc"
    );

    const masterSeed = Mnemonic.generateMasterSeedFromMnemonic(mnemonic);
    privKey = new PrivKeySecp256k1(
      Mnemonic.generatePrivateKeyFromMasterSeed(masterSeed)
    );
    pubKey = privKey.getPubKey();
    expect(Buffer.from(pubKey.toBytes()).toString("hex")).toBe(
      "02394bc53633366a2ab9b5d697a94c8c0121cc5e3f0d554a63167edb318ceae8bc"
    );
  });

  it("mnemonic should generate proper priv key 2", () => {
    const mnemonic =
      "celery husband drama unaware blue empower jelly twist program say prepare page";

    let privKey = new PrivKeySecp256k1(
      Mnemonic.generateWalletFromMnemonic(mnemonic, "m/44'/118'/1'/0/0")
    );
    let pubKey = privKey.getPubKey();
    expect(Buffer.from(pubKey.toBytes()).toString("hex")).toBe(
      "03270e75d7e43f57643cd661bc1a0a3b939b786bbcdec1b82b718fd628e947eec1"
    );

    const masterSeed = Mnemonic.generateMasterSeedFromMnemonic(mnemonic);
    privKey = new PrivKeySecp256k1(
      Mnemonic.generatePrivateKeyFromMasterSeed(masterSeed, "m/44'/118'/1'/0/0")
    );
    pubKey = privKey.getPubKey();
    expect(Buffer.from(pubKey.toBytes()).toString("hex")).toBe(
      "03270e75d7e43f57643cd661bc1a0a3b939b786bbcdec1b82b718fd628e947eec1"
    );
  });
});
