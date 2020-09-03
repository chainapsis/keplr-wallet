import assert from "assert";
import "mocha";

import { MockMessageManager } from "../../common/message/manager/mock";
import { MemoryKVStore } from "../../common/kvstore/memory";

const EventEmitter = require("events").EventEmitter;

import { ChainsKeeper } from "../chains/keeper";
import { init as chainsInit } from "../chains/init";
import { BIP44 } from "@chainapsis/cosmosjs/core/bip44";
import { defaultBech32Config } from "@chainapsis/cosmosjs/core/bech32Config";

import { KeyRingKeeper } from "./keeper";
import { init } from "./init";
import { sendMessage } from "../../common/message/send/mock";
import {
  ApproveSignMsg,
  ApproveTxBuilderConfigMsg,
  CreateMnemonicKeyMsg,
  CreatePrivateKeyMsg,
  DeleteKeyRingMsg,
  EnableKeyRingMsg,
  GetKeyMsg,
  LockKeyRingMsg,
  RejectSignMsg,
  RejectTxBuilderConfigMsg,
  RequestSignMsg,
  RequestTxBuilderConfigMsg,
  ShowKeyRingMsg,
  UnlockKeyRingMsg
} from "./messages";
import { KeyRingStatus } from "./keyring";
import delay from "delay";

describe("Test keyring handler", () => {
  let messageManager: MockMessageManager;

  const port = "test";
  const emitter = new EventEmitter();
  const extensionId = "test-mock";
  const extensionBaseURL = "http://test-mock/test";
  const internalOrigin = "http://test-mock";

  beforeEach(() => {
    if (messageManager) {
      messageManager.unlisten();
    }

    // Init message manager.
    messageManager = new MockMessageManager(
      emitter,
      extensionId,
      extensionBaseURL
    );

    const chainsKeeper = new ChainsKeeper(
      new MemoryKVStore("chains"),
      [
        {
          rpc: "nope",
          rest: "nope",
          chainId: "test-1",
          chainName: "Test",
          nativeCurrency: "test",
          walletUrl: "nope",
          walletUrlForStaking: "nope",
          bip44: new BIP44(44, 118, 0),
          bech32Config: defaultBech32Config("cosmos"),
          currencies: ["test"],
          feeCurrencies: ["test"],
          coinType: 118
        }
      ],
      [
        {
          chainId: "test-1",
          origins: ["http://test.com"]
        }
      ],
      (): void => {},
      0
    );

    const keeper = new KeyRingKeeper(
      new MemoryKVStore("keyring"),
      chainsKeeper,
      undefined as any,
      (): void => {},
      0
    );

    chainsInit(messageManager, chainsKeeper);
    init(messageManager, keeper);
    messageManager.listen(port);
  });

  it("Test EnableKeyRingMsg", async () => {
    const result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new EnableKeyRingMsg("test-1")
    );

    assert.strictEqual(result.status, KeyRingStatus.EMPTY);

    // Should throw an error if chain is unknown.
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: extensionBaseURL,
          origin: internalOrigin
        },
        port,
        new EnableKeyRingMsg("test-2")
      );
    }, new Error("There is no chain info for test-2"));
  });

  it("Test EnableKeyRingMsg with locking/unlocking", async () => {
    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new EnableKeyRingMsg("test-1")
    );

    // Lock is not allowed to external
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://app.com/test",
          origin: "http://app.com"
        },
        port,
        new LockKeyRingMsg()
      );
    }, new Error("Permission rejected"));

    let result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new CreateMnemonicKeyMsg(
        "estate trim mixture pull annual unfold napkin runway wisdom web bridge main",
        "password",
        {},
        {
          account: 0,
          change: 0,
          addressIndex: 0
        }
      )
    );

    assert.strictEqual(result.status, KeyRingStatus.UNLOCKED);

    result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new LockKeyRingMsg()
    );

    assert.strictEqual(result.status, KeyRingStatus.LOCKED);

    // Enableing is allowed to external access and it will wait unlocking.
    const results = await Promise.all([
      sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://test.com/test",
          origin: "http://test.com"
        },
        port,
        new EnableKeyRingMsg("test-1")
      ),
      (async () => {
        await delay(100);
        await sendMessage(
          {
            emitter,
            id: extensionId,
            url: extensionBaseURL,
            origin: internalOrigin
          },
          port,
          new UnlockKeyRingMsg("password")
        );
      })()
    ]);

    assert.strictEqual(results[0].status, KeyRingStatus.UNLOCKED);
  });

  it("Test lock/unlock permission", async () => {
    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new EnableKeyRingMsg("test-1")
    );

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new CreateMnemonicKeyMsg(
        "estate trim mixture pull annual unfold napkin runway wisdom web bridge main",
        "password",
        {},
        {
          account: 0,
          change: 0,
          addressIndex: 0
        }
      )
    );

    // Locking is allowed only if access is internal.
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://test.com/test",
          origin: "http://test.com"
        },
        port,
        new LockKeyRingMsg()
      );
    }, new Error("Permission rejected"));

    let result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new LockKeyRingMsg()
    );

    assert.strictEqual(result.status, KeyRingStatus.LOCKED);

    // Unlocking is allowed only if access is internal.
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://test.com/test",
          origin: "http://test.com"
        },
        port,
        new UnlockKeyRingMsg("password")
      );
    }, new Error("Permission rejected"));

    // Unlocking is allowed only if password is valid.
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: extensionBaseURL,
          origin: internalOrigin
        },
        port,
        new UnlockKeyRingMsg("invalid-password")
      );
    }, new Error("Unmatched mac"));

    result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new UnlockKeyRingMsg("password")
    );

    assert.strictEqual(result.status, KeyRingStatus.UNLOCKED);
  });

  it("Test CreateMnemonicKeyMsg", async () => {
    // Can not create key before restoring.
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: extensionBaseURL,
          origin: internalOrigin
        },
        port,
        new CreateMnemonicKeyMsg(
          "estate trim mixture pull annual unfold napkin runway wisdom web bridge main",
          "password",
          {},
          {
            account: 0,
            change: 0,
            addressIndex: 0
          }
        )
      );
    }, new Error("Key ring is not loaded or not empty"));

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new EnableKeyRingMsg("test-1")
    );

    // Can not create key from external
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://test.com/test",
          origin: "http://test.com"
        },
        port,
        new CreateMnemonicKeyMsg(
          "estate trim mixture pull annual unfold napkin runway wisdom web bridge main",
          "password",
          {},
          {
            account: 0,
            change: 0,
            addressIndex: 0
          }
        )
      );
    }, new Error("Permission rejected"));

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new CreateMnemonicKeyMsg(
        "estate trim mixture pull annual unfold napkin runway wisdom web bridge main",
        "password",
        {},
        {
          account: 0,
          change: 0,
          addressIndex: 0
        }
      )
    );

    let result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new GetKeyMsg("test-1")
    );

    assert.strictEqual(
      result.bech32Address,
      "cosmos1jgfuw4mswjmdc6npcj5vcjjmqa2x8y63l5lq2s"
    );

    // Get key msg is allowed to external access that has permission.
    result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: "http://test.com/test",
        origin: "http://test.com"
      },
      port,
      new GetKeyMsg("test-1")
    );

    assert.strictEqual(
      result.bech32Address,
      "cosmos1jgfuw4mswjmdc6npcj5vcjjmqa2x8y63l5lq2s"
    );

    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://app.com/test",
          origin: "http://app.com"
        },
        port,
        new GetKeyMsg("test-1")
      );
    }, new Error("This origin is not approved"));
  });

  it("Test CreatePrivateKeyMsg", async () => {
    // Can not create key before restoring.
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: extensionBaseURL,
          origin: internalOrigin
        },
        port,
        new CreatePrivateKeyMsg(
          "b48c37e10017645264f985ac118b59448bf3d280ed5ed6674440dc7a4a452d81",
          "password",
          {}
        )
      );
    }, new Error("Key ring is not loaded or not empty"));

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new EnableKeyRingMsg("test-1")
    );

    // Can not create key from external
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://test.com/test",
          origin: "http://test.com"
        },
        port,
        new CreatePrivateKeyMsg(
          "b48c37e10017645264f985ac118b59448bf3d280ed5ed6674440dc7a4a452d81",
          "password",
          {}
        )
      );
    }, new Error("Permission rejected"));

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new CreatePrivateKeyMsg(
        "b48c37e10017645264f985ac118b59448bf3d280ed5ed6674440dc7a4a452d81",
        "password",
        {}
      )
    );

    let result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new GetKeyMsg("test-1")
    );

    assert.strictEqual(
      result.bech32Address,
      "cosmos1m3y35cl0tlxqcuzkce6ld7ww0st0j4ra846wwh"
    );

    result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new GetKeyMsg("test-1")
    );

    // But, key path is ignored.
    assert.strictEqual(
      result.bech32Address,
      "cosmos1m3y35cl0tlxqcuzkce6ld7ww0st0j4ra846wwh"
    );

    result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: "http://test.com/test",
        origin: "http://test.com"
      },
      port,
      new GetKeyMsg("test-1")
    );

    assert.strictEqual(
      result.bech32Address,
      "cosmos1m3y35cl0tlxqcuzkce6ld7ww0st0j4ra846wwh"
    );

    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://app.com/test",
          origin: "http://app.com"
        },
        port,
        new GetKeyMsg("test-1")
      );
    }, new Error("This origin is not approved"));
  });

  /* it("Test keyring clearing", async () => {
    const testClear = async () => {
      await assert.rejects(async () => {
        await sendMessage(
          {
            emitter,
            id: extensionId,
            url: extensionBaseURL,
            origin: internalOrigin
          },
          port,
          new ClearKeyRingMsg("invalid-password")
        );
      }, new Error("Unmatched mac"));

      await assert.rejects(async () => {
        await sendMessage(
          {
            emitter,
            id: extensionId,
            url: "http://test.com/test",
            origin: "http://test.com"
          },
          port,
          new ClearKeyRingMsg("password")
        );
      }, new Error("Permission rejected"));

      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: extensionBaseURL,
          origin: internalOrigin
        },
        port,
        new ClearKeyRingMsg("password")
      );
    };

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new EnableKeyRingMsg("test-1")
    );

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new CreateMnemonicKeyMsg(
        "estate trim mixture pull annual unfold napkin runway wisdom web bridge main",
        "password",
        {}
      )
    );

    await testClear();

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new CreatePrivateKeyMsg(
        "b48c37e10017645264f985ac118b59448bf3d280ed5ed6674440dc7a4a452d81",
        "password",
        {}
      )
    );

    await testClear();
  });*/

  it("Test show keyring", async () => {
    const testShow = async (expected: string) => {
      await assert.rejects(async () => {
        await sendMessage(
          {
            emitter,
            id: extensionId,
            url: extensionBaseURL,
            origin: internalOrigin
          },
          port,
          new ShowKeyRingMsg(0, "invalid-password")
        );
      }, new Error("Invalid password"));

      await assert.rejects(async () => {
        await sendMessage(
          {
            emitter,
            id: extensionId,
            url: "http://test.com/test",
            origin: "http://test.com"
          },
          port,
          new ShowKeyRingMsg(0, "password")
        );
      }, new Error("Permission rejected"));

      const result = await sendMessage(
        {
          emitter,
          id: extensionId,
          url: extensionBaseURL,
          origin: internalOrigin
        },
        port,
        new ShowKeyRingMsg(0, "password")
      );

      assert.strictEqual(result, expected);
    };

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new EnableKeyRingMsg("test-1")
    );

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new CreateMnemonicKeyMsg(
        "estate trim mixture pull annual unfold napkin runway wisdom web bridge main",
        "password",
        {},
        {
          account: 0,
          change: 0,
          addressIndex: 0
        }
      )
    );

    await testShow(
      "estate trim mixture pull annual unfold napkin runway wisdom web bridge main"
    );

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new DeleteKeyRingMsg(0, "password")
    );

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new CreatePrivateKeyMsg(
        "b48c37e10017645264f985ac118b59448bf3d280ed5ed6674440dc7a4a452d81",
        "password",
        {}
      )
    );

    await testShow(
      "b48c37e10017645264f985ac118b59448bf3d280ed5ed6674440dc7a4a452d81"
    );
  });

  it("Test RequestTxBuilderConfigMsg permission that be able to skip approving", async () => {
    // Only internal access can skip approving.
    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new RequestTxBuilderConfigMsg(
        {
          chainId: "test-1",
          gas: "1",
          memo: "",
          fee: "1uatom"
        },
        "1234",
        false,
        true
      )
    );

    // Only internal access can skip approving.
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://test.com/test",
          origin: "http://test.com"
        },
        port,
        new RequestTxBuilderConfigMsg(
          {
            chainId: "test-1",
            gas: "1",
            memo: "",
            fee: "1uatom"
          },
          "1234",
          false,
          true
        )
      );
    }, new Error("Permission rejected"));

    // Only internal access can skip approving.
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://app.com/test",
          origin: "http://app.com"
        },
        port,
        new RequestTxBuilderConfigMsg(
          {
            chainId: "test-1",
            gas: "1",
            memo: "",
            fee: "1uatom"
          },
          "1234",
          false,
          true
        )
      );
    }, new Error("Permission rejected"));
  });

  it("Test Approve/RejectTxBuilderConfigMsg permission", async () => {
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://test.com/test",
          origin: "http://test.com"
        },
        port,
        new ApproveTxBuilderConfigMsg("1234", {} as any)
      );
    }, new Error("Permission rejected"));

    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://app.com/test",
          origin: "http://app.com"
        },
        port,
        new ApproveTxBuilderConfigMsg("1234", {} as any)
      );
    }, new Error("Permission rejected"));

    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://test.com/test",
          origin: "http://test.com"
        },
        port,
        new RejectTxBuilderConfigMsg("1234")
      );
    }, new Error("Permission rejected"));

    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://app.com/test",
          origin: "http://app.com"
        },
        port,
        new RejectTxBuilderConfigMsg("1234")
      );
    }, new Error("Permission rejected"));
  });

  it("Test RequestSignMsg permission that be able to skip approving", async () => {
    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new EnableKeyRingMsg("test-1")
    );

    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new CreateMnemonicKeyMsg(
        "estate trim mixture pull annual unfold napkin runway wisdom web bridge main",
        "password",
        {},
        {
          account: 0,
          change: 0,
          addressIndex: 0
        }
      )
    );

    // Only internal access can skip approving.
    await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new RequestSignMsg(
        "test-1",
        "1234",
        "cosmos1jgfuw4mswjmdc6npcj5vcjjmqa2x8y63l5lq2s",
        "ff",
        false,
        true
      )
    );

    // Only internal access can skip approving.
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://app.com/test",
          origin: "http://app.com"
        },
        port,
        new RequestSignMsg(
          "test-1",
          "1234",
          "cosmos1jgfuw4mswjmdc6npcj5vcjjmqa2x8y63l5lq2s",
          "ff",
          false,
          true
        )
      );
    }, new Error("Permission rejected"));

    // Only internal access can skip approving.
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://test.com/test",
          origin: "http://test.com"
        },
        port,
        new RequestSignMsg(
          "test-1",
          "1234",
          "cosmos1jgfuw4mswjmdc6npcj5vcjjmqa2x8y63l5lq2s",
          "ff",
          false,
          true
        )
      );
    }, new Error("Permission rejected"));
  });

  it("Test Approve/RejectSignMsg permission", async () => {
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://test.com/test",
          origin: "http://test.com"
        },
        port,
        new ApproveSignMsg("1234")
      );
    }, new Error("Permission rejected"));

    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://app.com/test",
          origin: "http://app.com"
        },
        port,
        new ApproveSignMsg("1234")
      );
    }, new Error("Permission rejected"));

    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://test.com/test",
          origin: "http://test.com"
        },
        port,
        new RejectSignMsg("1234")
      );
    }, new Error("Permission rejected"));

    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://app.com/test",
          origin: "http://app.com"
        },
        port,
        new RejectSignMsg("1234")
      );
    }, new Error("Permission rejected"));
  });
});
