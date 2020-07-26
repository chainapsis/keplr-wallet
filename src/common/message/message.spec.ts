import assert from "assert";
import "mocha";

import { Message } from "./message";
import { MockMessageManager } from "./manager/mock";
import { sendMessage } from "./send/mock";

const EventEmitter = require("events").EventEmitter;

class MockMessage extends Message<boolean> {
  public static type() {
    return "mock";
  }

  route(): string {
    return "mock";
  }

  type(): string {
    return MockMessage.type();
  }

  validateBasic(): void {
    // noop
  }
}

class MockExternalMessage extends Message<boolean> {
  public static type() {
    return "mock-extern";
  }

  route(): string {
    return "mock-extern";
  }

  type(): string {
    return MockExternalMessage.type();
  }

  validateBasic(): void {
    // noop
  }

  approveExternal(): boolean {
    return true;
  }
}

describe("Test message permission", () => {
  const port = "test";
  const emitter = new EventEmitter();
  const extensionId = "test-mock";
  const extensionBaseURL = "http://test-mock/test";
  const internalOrigin = "http://test-mock";

  before(() => {
    // Init message manager.
    const messageManager = new MockMessageManager(
      emitter,
      extensionId,
      extensionBaseURL
    );
    messageManager.registerMessage(MockMessage);
    messageManager.registerMessage(MockExternalMessage);
    messageManager.addHandler("mock", () => {
      return true;
    });
    messageManager.addHandler("mock-extern", () => {
      return true;
    });
    messageManager.listen(port);
  });

  it("Basic message should be allowed only if it is from internal", async () => {
    const mockMsg = new MockMessage();
    await assert.doesNotReject(async () => {
      const result = await sendMessage(
        {
          emitter,
          id: extensionId,
          url: extensionBaseURL,
          origin: internalOrigin
        },
        port,
        mockMsg
      );
      assert.strictEqual(result, true);
    }, "internal message sending should be succeed");

    // Message should be rejected if origin and url are not matched.
    await assert.rejects(
      async () => {
        await sendMessage(
          {
            emitter,
            id: extensionId,
            url: extensionBaseURL,
            origin: "http://other-origin"
          },
          port,
          mockMsg
        );
      },
      new Error("Invalid origin"),
      "internal message sending should be failed if origin is invalid"
    );

    // Message should be rejected if origin is empty.
    await assert.rejects(
      async () => {
        await sendMessage(
          {
            emitter,
            id: extensionId,
            url: extensionBaseURL,
            origin: ""
          },
          port,
          mockMsg
        );
      },
      new Error("Invalid origin: origin is empty"),
      "internal message sending should be failed if origin is empty"
    );

    // Message should be rejected if sender's id is empty.
    await assert.rejects(
      async () => {
        await sendMessage(
          {
            emitter,
            id: "",
            url: extensionBaseURL,
            origin: internalOrigin
          },
          port,
          mockMsg
        );
      },
      new Error("Permission rejected"),
      "internal message sending should be failed if sender's id is empty"
    );

    // Message should be rejected if sender's url is empty.
    await assert.rejects(
      async () => {
        await sendMessage(
          {
            emitter,
            id: extensionId,
            url: "",
            origin: internalOrigin
          },
          port,
          mockMsg
        );
      },
      new Error("Invalid origin: url is empty"),
      "internal message sending should be failed if sender's url is empty"
    );
  });

  it("External message should be allowed only if message approves external access and it's origin is valid", async () => {
    // Internal message should succeed.
    const mockMsg = new MockExternalMessage();
    // Case of internal sending.
    await assert.doesNotReject(async () => {
      const result = await sendMessage(
        {
          emitter,
          id: extensionId,
          url: extensionBaseURL,
          origin: internalOrigin
        },
        port,
        mockMsg
      );
      assert.strictEqual(result, true);
    }, "external message sending should be succeed if it is sent from internal");

    // Message should be rejected if origin and url are not matched.
    await assert.rejects(
      async () => {
        await sendMessage(
          {
            emitter,
            id: extensionId,
            url: extensionBaseURL,
            origin: "http://other-origin"
          },
          port,
          mockMsg
        );
      },
      new Error("Invalid origin"),
      "external message sending should be failed if origin is invalid"
    );

    // Message should be rejected if origin is empty.
    await assert.rejects(
      async () => {
        await sendMessage(
          {
            emitter,
            id: extensionId,
            url: extensionBaseURL,
            origin: ""
          },
          port,
          mockMsg
        );
      },
      new Error("Invalid origin: origin is empty"),
      "external message sending should be failed if origin is empty"
    );

    // Message should be rejected if sender's url is empty.
    await assert.rejects(
      async () => {
        await sendMessage(
          {
            emitter,
            id: extensionId,
            url: "",
            origin: internalOrigin
          },
          port,
          mockMsg
        );
      },
      new Error("Invalid origin: url is empty"),
      "external message sending should be failed if sender's url is empty"
    );

    await assert.doesNotReject(async () => {
      const result = await sendMessage(
        {
          emitter,
          id: "other-id",
          url: "http://other-app/test",
          origin: "http://other-app"
        },
        port,
        mockMsg
      );
      assert.strictEqual(result, true);
    }, "external message sending should be succeed even if it is sent from external");
  });
});
