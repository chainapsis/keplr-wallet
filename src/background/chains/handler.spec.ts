import assert from "assert";
import "mocha";
import { ChainsKeeper } from "./keeper";
import { MemoryKVStore } from "../../common/kvstore/memory";
import { init } from "./init";

import { MockMessageManager } from "../../common/message/manager/mock";
const EventEmitter = require("events").EventEmitter;

import { BIP44 } from "@chainapsis/cosmosjs/core/bip44";
import { defaultBech32Config } from "@chainapsis/cosmosjs/core/bech32Config";

import {
  ApproveAccessMsg,
  GetAccessOriginMsg,
  GetChainInfosMsg,
  RejectAccessMsg,
  ReqeustAccessMsg
} from "./messages";
import { sendMessage } from "../../common/message/send/mock";
import delay from "delay";
import { ChainUpdaterKeeper } from "../updater/keeper";

describe("Test chains handler", () => {
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

    const keeper = new ChainsKeeper(
      new MemoryKVStore("chains"),
      new ChainUpdaterKeeper(new MemoryKVStore("updater")),
      // TODO: Fix me
      undefined as any,
      [
        {
          rpc: "nope",
          rest: "nope",
          chainId: "test-1",
          chainName: "Test",
          stakeCurrency: {
            coinDenom: "TEST",
            coinMinimalDenom: "test",
            coinDecimals: 6
          },
          walletUrl: "nope",
          walletUrlForStaking: "nope",
          bip44: new BIP44(44, 118, 0),
          bech32Config: defaultBech32Config("test"),
          currencies: [
            {
              coinDenom: "TEST",
              coinMinimalDenom: "test",
              coinDecimals: 6
            }
          ],
          feeCurrencies: [
            {
              coinDenom: "TEST",
              coinMinimalDenom: "test",
              coinDecimals: 6
            }
          ],
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

    init(messageManager, keeper);
    messageManager.listen(port);
  });

  it("Test GetChainInfosMsg", async () => {
    const msg = new GetChainInfosMsg();

    const result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      msg
    );

    assert.strictEqual(result.chainInfos.length, 1);
    assert.strictEqual(result.chainInfos[0].chainId, "test-1");

    // GetChainInfoMsg is not allowed to external access.
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://app.com/test",
          origin: "http://app.com"
        },
        port,
        msg
      );
    }, new Error("Permission rejected"));
  });

  it("Test ReqeustAccessMsg", async () => {
    await Promise.all([
      sendMessage(
        {
          emitter,
          id: extensionId,
          url: extensionBaseURL,
          origin: internalOrigin
        },
        port,
        new ReqeustAccessMsg("1234", "test-1", "http://app.com")
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
          new ApproveAccessMsg("1234")
        );
      })()
    ]);

    const result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new GetAccessOriginMsg("test-1")
    );

    // Above message will return the access origins that are not embeded.
    assert.strictEqual(result.chainId, "test-1");
    assert.strictEqual(result.origins.length, 1);
    assert.strictEqual(result.origins[0], "http://app.com");
  });

  it("Can not request access to unknown chain", async () => {
    await assert.rejects(async () => {
      await sendMessage(
        {
          emitter,
          id: extensionId,
          url: extensionBaseURL,
          origin: internalOrigin
        },
        port,
        new ReqeustAccessMsg("1234", "test-2", "http://app.com")
      );
    });
  });

  it("ReqeustAccessMsg is allowed to external access", async () => {
    await Promise.all([
      sendMessage(
        {
          emitter,
          id: extensionId,
          url: "http://app.com/test",
          origin: "http://app.com"
        },
        port,
        new ReqeustAccessMsg("1234", "test-1", "http://app.com")
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
          new ApproveAccessMsg("1234")
        );
      })()
    ]);

    const result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new GetAccessOriginMsg("test-1")
    );

    // Above message will return the access origins that are not embeded.
    assert.strictEqual(result.chainId, "test-1");
    assert.strictEqual(result.origins.length, 1);
    assert.strictEqual(result.origins[0], "http://app.com");
  });

  it("ApproveAccessMsg is allowed only if it is sent from internal", async () => {
    await assert.rejects(async () => {
      await Promise.all([
        sendMessage(
          {
            emitter,
            id: extensionId,
            url: "http://app.com/test",
            origin: "http://app.com"
          },
          port,
          new ReqeustAccessMsg("1234", "test-1", "http://app.com")
        ),
        (async () => {
          await delay(100);
          await sendMessage(
            {
              emitter,
              id: extensionId,
              url: "http://app.com/test",
              origin: "http://app.com"
            },
            port,
            new ApproveAccessMsg("1234")
          );
        })()
      ]);
    }, new Error("Permission rejected"));
  });

  it("Test a case that ReqeustAccessMsg is rejected", async () => {
    await assert.rejects(async () => {
      await Promise.all([
        sendMessage(
          {
            emitter,
            id: extensionId,
            url: "http://app.com/test",
            origin: "http://app.com"
          },
          port,
          new ReqeustAccessMsg("1234", "test-1", "http://app.com")
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
            new RejectAccessMsg("1234")
          );
        })()
      ]);
    }, new Error("Request rejected"));

    const result = await sendMessage(
      {
        emitter,
        id: extensionId,
        url: extensionBaseURL,
        origin: internalOrigin
      },
      port,
      new GetAccessOriginMsg("test-1")
    );

    // Above message will return the access origins that are not embeded.
    assert.strictEqual(result.chainId, "test-1");
    assert.strictEqual(result.origins.length, 0);
  });
});
