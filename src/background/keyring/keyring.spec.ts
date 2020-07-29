import assert from "assert";
import "mocha";

import { KeyRing, KeyRingStatus } from "./keyring";
import { MemoryKVStore } from "../../common/kvstore/memory";
import { AccAddress } from "@everett-protocol/cosmosjs/common/address";

describe("Test keyring", () => {
  let keyRing: KeyRing;

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  global.crypto = {
    getRandomValues: (arr: Uint8Array): Uint8Array => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  };

  beforeEach(() => {
    keyRing = new KeyRing(new MemoryKVStore("test"));
  });

  it("Status of keyring should be not loaded before loading", () => {
    assert.strictEqual(keyRing.status, KeyRingStatus.NOTLOADED);
    assert.strictEqual(keyRing.type, "none");
  });

  it("Status of keyring should be empty after restoring but not have key", async () => {
    await keyRing.restore();
    assert.strictEqual(keyRing.status, KeyRingStatus.EMPTY);
    assert.strictEqual(keyRing.type, "none");
  });

  it("Keyring should return proper public key and address after creating mnemonic key", async () => {
    await keyRing.restore();
    assert.strictEqual(keyRing.status, KeyRingStatus.EMPTY);
    assert.strictEqual(keyRing.type, "none");

    await keyRing.createMnemonicKey(
      "estate trim mixture pull annual unfold napkin runway wisdom web bridge main",
      "password"
    );

    assert.strictEqual(keyRing.status, KeyRingStatus.UNLOCKED);
    assert.strictEqual(keyRing.type, "mnemonic");

    assert.strictEqual(keyRing.canSetPath, true);

    const key = keyRing.getKey("m/44'/118'/0'/0/0");

    assert.strictEqual(
      new AccAddress(key.address, "cosmos").toBech32(),
      "cosmos1jgfuw4mswjmdc6npcj5vcjjmqa2x8y63l5lq2s"
    );
  });

  it("Keyring should return proper public key and address after creating private Key", async () => {
    await keyRing.restore();
    assert.strictEqual(keyRing.status, KeyRingStatus.EMPTY);
    assert.strictEqual(keyRing.type, "none");

    await keyRing.createPrivateKey(
      Buffer.from(
        "b48c37e10017645264f985ac118b59448bf3d280ed5ed6674440dc7a4a452d81",
        "hex"
      ),
      "password"
    );

    assert.strictEqual(keyRing.status, KeyRingStatus.UNLOCKED);
    assert.strictEqual(keyRing.type, "privateKey");

    assert.strictEqual(keyRing.canSetPath, false);

    // Path will be ignored if it is on private key mode.
    const key = keyRing.getKey("m/44'/118'/0'/0/0");

    assert.strictEqual(
      new AccAddress(key.address, "cosmos").toBech32(),
      "cosmos1m3y35cl0tlxqcuzkce6ld7ww0st0j4ra846wwh"
    );
  });

  it("Keyring should be unlocked only if password is valid (mnemonic)", async () => {
    await keyRing.restore();
    assert.strictEqual(keyRing.status, KeyRingStatus.EMPTY);
    assert.strictEqual(keyRing.type, "none");

    await keyRing.createMnemonicKey(
      "estate trim mixture pull annual unfold napkin runway wisdom web bridge main",
      "password"
    );

    assert.strictEqual(keyRing.status, KeyRingStatus.UNLOCKED);
    assert.strictEqual(keyRing.isLocked(), false);
    assert.strictEqual(keyRing.type, "mnemonic");

    keyRing.lock();

    assert.strictEqual(keyRing.status, KeyRingStatus.LOCKED);
    assert.strictEqual(keyRing.isLocked(), true);
    assert.strictEqual(keyRing.type, "mnemonic");

    await assert.rejects(async () => {
      await keyRing.unlock("invalid-password");
    });

    await assert.doesNotReject(async () => {
      await keyRing.unlock("password");
    });
  });

  it("Keyring should be unlocked only if password is valid (private key)", async () => {
    await keyRing.restore();
    assert.strictEqual(keyRing.status, KeyRingStatus.EMPTY);
    assert.strictEqual(keyRing.type, "none");

    await keyRing.createPrivateKey(
      Buffer.from(
        "b48c37e10017645264f985ac118b59448bf3d280ed5ed6674440dc7a4a452d81",
        "hex"
      ),
      "password"
    );

    assert.strictEqual(keyRing.status, KeyRingStatus.UNLOCKED);
    assert.strictEqual(keyRing.isLocked(), false);
    assert.strictEqual(keyRing.type, "privateKey");

    keyRing.lock();

    assert.strictEqual(keyRing.status, KeyRingStatus.LOCKED);
    assert.strictEqual(keyRing.isLocked(), true);
    assert.strictEqual(keyRing.type, "privateKey");

    await assert.rejects(async () => {
      await keyRing.unlock("invalid-password");
    });

    await assert.doesNotReject(async () => {
      await keyRing.unlock("password");
    });
  });

  it("Keyring should show mnemonic key only if password is valid", async () => {
    await keyRing.restore();
    assert.strictEqual(keyRing.status, KeyRingStatus.EMPTY);
    assert.strictEqual(keyRing.type, "none");

    await keyRing.createMnemonicKey(
      "estate trim mixture pull annual unfold napkin runway wisdom web bridge main",
      "password"
    );

    await assert.rejects(async () => {
      await keyRing.showKeyRing("invalid-password");
    });

    await assert.doesNotReject(async () => {
      const result = await keyRing.showKeyRing("password");

      assert.strictEqual(
        result,
        "estate trim mixture pull annual unfold napkin runway wisdom web bridge main"
      );
    });
  });

  it("Keyring should show private key only if password is valid", async () => {
    await keyRing.restore();
    assert.strictEqual(keyRing.status, KeyRingStatus.EMPTY);
    assert.strictEqual(keyRing.type, "none");

    await keyRing.createPrivateKey(
      Buffer.from(
        "b48c37e10017645264f985ac118b59448bf3d280ed5ed6674440dc7a4a452d81",
        "hex"
      ),
      "password"
    );

    await assert.rejects(async () => {
      await keyRing.showKeyRing("invalid-password");
    });

    await assert.doesNotReject(async () => {
      const result = await keyRing.showKeyRing("password");

      assert.strictEqual(
        result,
        "b48c37e10017645264f985ac118b59448bf3d280ed5ed6674440dc7a4a452d81"
      );
    });
  });

  it("Keyring should clear mnemonic key only if password is valid", async () => {
    await keyRing.restore();
    assert.strictEqual(keyRing.status, KeyRingStatus.EMPTY);
    assert.strictEqual(keyRing.type, "none");

    await keyRing.createMnemonicKey(
      "estate trim mixture pull annual unfold napkin runway wisdom web bridge main",
      "password"
    );

    await assert.rejects(async () => {
      await keyRing.clear("invalid-password");
    });

    await assert.doesNotReject(async () => {
      await keyRing.clear("password");
    });

    assert.strictEqual(keyRing.status, KeyRingStatus.EMPTY);
    assert.strictEqual(keyRing.type, "none");
  });

  it("Keyring should clear private key only if password is valid", async () => {
    await keyRing.restore();
    assert.strictEqual(keyRing.status, KeyRingStatus.EMPTY);
    assert.strictEqual(keyRing.type, "none");

    await keyRing.createPrivateKey(
      Buffer.from(
        "b48c37e10017645264f985ac118b59448bf3d280ed5ed6674440dc7a4a452d81",
        "hex"
      ),
      "password"
    );

    await assert.rejects(async () => {
      await keyRing.clear("invalid-password");
    });

    await assert.doesNotReject(async () => {
      await keyRing.clear("password");
    });

    assert.strictEqual(keyRing.status, KeyRingStatus.EMPTY);
    assert.strictEqual(keyRing.type, "none");
  });
});
