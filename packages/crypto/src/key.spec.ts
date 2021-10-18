import assert from "assert";
import { Mnemonic } from "./mnemonic";
import { PrivKeySecp256k1 } from "./key";
import { Bech32Address } from "@keplr-wallet/cosmos";

describe("Test priv key", () => {
  it("priv key should generate the valid address", () => {
    const mnemonic =
      "celery husband drama unaware blue empower jelly twist program say prepare page";
    const expectedAddress = "cosmos1d2kh2xaen7c0zv3h7qnmghhwhsmmassqlmr2nv";

    const privKey = new PrivKeySecp256k1(
      Mnemonic.generateWalletFromMnemonic(mnemonic)
    );
    const pubKey = privKey.getPubKey();
    const address = new Bech32Address(pubKey.getAddress());

    assert.strictEqual(address.toBech32("cosmos"), expectedAddress);
  });
});
