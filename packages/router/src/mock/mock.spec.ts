import assert from "assert";
import { Message } from "../message";
import { MockRouter, Router } from "../router";
import { MockEnv } from "../env";
import { MockMessageRequester } from "../requester";
import { MockGuards } from "../guard";

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
  const port = "port";
  const mockId = "mock";
  const mockUrl = "http://mock.com";

  const mockInternalRequester = new MockMessageRequester(mockId, mockUrl);
  const mockExternalRequester = new MockMessageRequester(
    mockId,
    "http://other.com"
  );
  const mockExternalRequester2 = new MockMessageRequester("other", mockUrl);
  const mockExternalRequester3 = new MockMessageRequester(
    "other",
    "http://other.com"
  );

  let router: Router | undefined;
  beforeEach(() => {
    // Init router for mocking.
    router = new MockRouter(new MockEnv(mockId, mockUrl).envProducer());
    router.addGuard(MockGuards.checkOriginIsValid);
    router.addGuard(MockGuards.checkMessageIsInternal);

    router.registerMessage(MockMessage);
    router.registerMessage(MockExternalMessage);

    router.addHandler("mock", () => true);
    router.addHandler("mock-extern", () => true);

    router.listen(port);
  });

  afterEach(() => {
    if (router) {
      router.unlisten();
    }
  });

  const testSendMessage = async (
    msg: Message<unknown>,
    isAllowExternal: boolean
  ) => {
    const result = await mockInternalRequester.sendMessage(port, msg);
    assert.strictEqual(result, true);

    if (isAllowExternal) {
      await assert.doesNotReject(async () => {
        const result = await mockExternalRequester.sendMessage(port, msg);
        assert.strictEqual(result, true);
      });
      await assert.doesNotReject(async () => {
        const result = await mockExternalRequester2.sendMessage(port, msg);
        assert.strictEqual(result, true);
      });
      await assert.doesNotReject(async () => {
        const result = await mockExternalRequester3.sendMessage(port, msg);
        assert.strictEqual(result, true);
      });
    } else {
      await assert.rejects(async () => {
        const result = await mockExternalRequester.sendMessage(port, msg);
        assert.strictEqual(result, true);
      });
      await assert.rejects(async () => {
        const result = await mockExternalRequester2.sendMessage(port, msg);
        assert.strictEqual(result, true);
      });
      await assert.rejects(async () => {
        const result = await mockExternalRequester3.sendMessage(port, msg);
        assert.strictEqual(result, true);
      });
    }
  };

  it("Basic message should be allowed only if it is from internal", async () => {
    const mockMsg = new MockMessage();
    await testSendMessage(mockMsg, false);
  });

  it("External message should be allowed event if it is from external", async () => {
    const mockMsg = new MockExternalMessage();
    await testSendMessage(mockMsg, true);
  });
});
