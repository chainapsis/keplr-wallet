import assert from "assert";
import "mocha";

import { Message } from "./message";
import { MockMessageManager } from "./manager/mock";
import { sendMockMessage } from "./send/mock";
import { BACKGROUND_PORT } from "./constant";

const EventEmitter = require("events").EventEmitter;

class MockMessage extends Message<{}> {
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

describe("Test message permission", () => {
  it("Basic message should be allowed only if it is from internal", async () => {
    const emitter = new EventEmitter();
    const id = "test-mock";

    // Init message manager.
    const messageManager = new MockMessageManager(emitter, id);
    messageManager.registerMessage(MockMessage);
    messageManager.addHandler("mock", () => {
      return {};
    });
    messageManager.listen(BACKGROUND_PORT);

    // Internal message should succeed.
    const mockMsg = new MockMessage();
    assert.doesNotThrow(async () => {
      const result = await sendMockMessage(
        {
          emitter,
          id,
          url: `http://${id}/`
        },
        BACKGROUND_PORT,
        mockMsg
      );
      assert.strictEqual(JSON.stringify(result), JSON.stringify({}));
    });

    // Test non internal message with empty id.
    await assert.rejects(async () => {
      await sendMockMessage(
        {
          emitter,
          id: "",
          url: `http://${id}/`
        },
        BACKGROUND_PORT,
        mockMsg
      );
    }, /Error: Permission rejected/);

    // Test non internal message with different id.
    await assert.rejects(async () => {
      await sendMockMessage(
        {
          emitter,
          id: id + "-other",
          url: `http://${id}/`
        },
        BACKGROUND_PORT,
        mockMsg
      );
    }, /Error: Permission rejected/);

    // Test non internal message with empty url.
    await assert.rejects(async () => {
      await sendMockMessage(
        {
          emitter,
          id: id,
          url: ""
        },
        BACKGROUND_PORT,
        mockMsg
      );
    }, /Error: Permission rejected/);

    // Test non internal message with different url.
    await assert.rejects(async () => {
      await sendMockMessage(
        {
          emitter,
          id: id,
          url: `http://${id + "-other"}/`
        },
        BACKGROUND_PORT,
        mockMsg
      );
    }, /Error: Permission rejected/);

    // Test non internal message with empty id and empty url.
    await assert.rejects(async () => {
      await sendMockMessage(
        {
          emitter,
          id: "",
          url: ""
        },
        BACKGROUND_PORT,
        mockMsg
      );
    }, /Error: Permission rejected/);

    // Test non internal message with different id and different url.
    await assert.rejects(async () => {
      await sendMockMessage(
        {
          emitter,
          id: id + "-other",
          url: `http://${id + "-other"}/`
        },
        BACKGROUND_PORT,
        mockMsg
      );
    }, /Error: Permission rejected/);
  });
});
