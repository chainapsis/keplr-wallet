import assert from "assert";
import "mocha";

import { MockMessageManager } from "../../common/message/manager/mock";
import { sendMessage } from "../../common/message/send/mock";

const EventEmitter = require("events").EventEmitter;

import * as Messages from "./messages";
import { init } from "./init";

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

  it("RequestSignMsg should throw an error on validateBasic if field is invalid", () => {
    assert.throws(() => {
      const msg = new Messages.RequestSignMsg(
        "",
        "12345678",
        "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k",
        "FF",
        false,
        true
      );
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.RequestSignMsg(
        "test-1",
        "12345678",
        "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k",
        "",
        false,
        true
      );
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.RequestSignMsg(
        "test-1",
        "",
        "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k",
        "FF",
        false,
        true
      );
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.RequestSignMsg(
        "test-1",
        "12345678",
        "",
        "FF",
        false,
        true
      );
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.RequestSignMsg(
        "test-1",
        "12345678",
        // Invalid bech32 address
        "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f41",
        "FF",
        false,
        true
      );
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.RequestSignMsg(
        "",
        "12345678",
        "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k",
        // Invalid hex
        "Fg",
        false,
        true
      );
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.RequestSignMsg(
        "",
        "12345678",
        "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k",
        // Invalid hex
        "FFF",
        false,
        true
      );
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.RequestSignMsg(
        "test-1",
        "12345678",
        "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k",
        "FF",
        false,
        true
      );
      msg.validateBasic();
    });
  });
});

describe("Test keyring message's external permission", () => {
  const port = "test";
  const emitter = new EventEmitter();
  const extensionId = "test-mock";
  const extensionBaseURL = "http://test-mock/test";

  before(() => {
    // Init message manager.
    const messageManager = new MockMessageManager(
      emitter,
      extensionId,
      extensionBaseURL
    );
    // Keeper doesn't need to be initialized.
    init(messageManager, null as any);
    messageManager.listen(port);
  });

  it("RequestTxBuilderConfigMsg's skip approve field can be true only if it is sent from internal", async () => {
    await assert.rejects(async () => {
      const msg = new Messages.RequestTxBuilderConfigMsg(
        {} as any,
        "12345678",
        false,
        true
      );
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: extensionBaseURL,
          origin: "http://other.com"
        },
        port,
        msg
      );
    }, new Error("Invalid origin"));

    await assert.rejects(async () => {
      const msg = new Messages.RequestTxBuilderConfigMsg(
        {} as any,
        "12345678",
        false,
        true
      );
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://other.com",
          origin: "http://other.com"
        },
        port,
        msg
      );
    }, new Error("Permission rejected"));
  });

  it("RequestSignMsg's skip approve field can be true only if it is sent from internal", async () => {
    await assert.rejects(async () => {
      const msg = new Messages.RequestSignMsg(
        "test-1",
        "12345678",
        "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k",
        "FF",
        false,
        true
      );
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: extensionBaseURL,
          origin: "http://other.com"
        },
        port,
        msg
      );
    }, new Error("Invalid origin"));

    await assert.rejects(async () => {
      const msg = new Messages.RequestSignMsg(
        "test-1",
        "12345678",
        "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k",
        "FF",
        false,
        true
      );
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://other.com",
          origin: "http://other.com"
        },
        port,
        msg
      );
    }, new Error("Permission rejected"));
  });
});
