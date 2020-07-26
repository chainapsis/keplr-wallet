import assert from "assert";
import "mocha";

import * as Messages from "./messages";

describe("Test keyring message's validate basic method", () => {
  it("EnableKeyRingMsg should throw an error on validateBasic if field is invalid", () => {
    assert.throws(() => {
      const msg = new Messages.EnableKeyRingMsg("");
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.EnableKeyRingMsg("test-1");
      msg.validateBasic();
    });
  });

  it("ClearKeyRingMsg should throw an error on validateBasic if field is invalid", () => {
    assert.throws(() => {
      const msg = new Messages.ClearKeyRingMsg("");
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.ClearKeyRingMsg("test-password");
      msg.validateBasic();
    });
  });

  it("ShowKeyRingMsg should throw an error on validateBasic if field is invalid", () => {
    assert.throws(() => {
      const msg = new Messages.ShowKeyRingMsg("");
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.ShowKeyRingMsg("test-password");
      msg.validateBasic();
    });
  });

  it("CreateMnemonicKeyMsg should throw an error on validateBasic if field is invalid", () => {
    assert.throws(() => {
      const msg = new Messages.CreateMnemonicKeyMsg("", "");
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.CreateMnemonicKeyMsg("", "test-password");
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.CreateMnemonicKeyMsg(
        "endorse derive coin acquire dizzy peace column bird only stand despair better",
        ""
      );
      msg.validateBasic();
    });

    assert.throws(() => {
      // Invalid length of mnemonic
      const msg = new Messages.CreateMnemonicKeyMsg(
        "endorse derive coin acquire dizzy peace column bird only stand despair",
        "test-password"
      );
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      // Invalid checksome is not validated on validateMnemonic
      const msg = new Messages.CreateMnemonicKeyMsg(
        "endorse derive coin acquire dizzy peace column bird only stand despair endorse",
        "test-password"
      );
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.CreateMnemonicKeyMsg(
        "endorse derive coin acquire dizzy peace column bird only stand despair better",
        "test-password"
      );
      msg.validateBasic();
    });
  });

  it("CreatePrivateKeyMsg should throw an error on validateBasic if field is invalid", () => {
    assert.throws(() => {
      const msg = new Messages.CreatePrivateKeyMsg("", "");
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.CreatePrivateKeyMsg("", "test-password");
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.CreatePrivateKeyMsg("FFFFFF", "");
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.CreatePrivateKeyMsg("not-hex", "");
      msg.validateBasic();
    });

    assert.throws(() => {
      // Invalid length of hex
      const msg = new Messages.CreatePrivateKeyMsg("FfFff", "");
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.CreatePrivateKeyMsg("FFFFFF", "test-password");
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.CreatePrivateKeyMsg("FfFFff", "test-password");
      msg.validateBasic();
    });
  });

  it("UnlockKeyRingMsg should throw an error on validateBasic if field is invalid", () => {
    assert.throws(() => {
      const msg = new Messages.UnlockKeyRingMsg("");
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.UnlockKeyRingMsg("test-password");
      msg.validateBasic();
    });
  });

  it("SetPathMsg should throw an error on validateBasic if field is invalid", () => {
    assert.throws(() => {
      const msg = new Messages.SetPathMsg("", 0, 0);
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.SetPathMsg("test-1", -1, 0);
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.SetPathMsg("test-1", 0, -1);
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.SetPathMsg("test-1", 0, 0);
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.SetPathMsg("test-1", 10, 10);
      msg.validateBasic();
    });
  });

  it("GetKeyMsg should throw an error on validateBasic if field is invalid", () => {
    assert.throws(() => {
      const msg = new Messages.GetKeyMsg("");
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.GetKeyMsg("test-1");
      msg.validateBasic();
    });
  });
});
