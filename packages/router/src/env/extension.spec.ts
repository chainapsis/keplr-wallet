import assert from "assert";

import { ExtensionEnv } from "./extension";
import { MessageSender } from "../types";

describe("Test extension env producer", () => {
  const extensionId = "id";
  const extensionUrl = "https://wallet.keplr.app";
  const validSender: MessageSender = {
    id: extensionId,
    url: extensionUrl,
  };

  it("should return true if the sender is internal else return false", () => {
    assert.strictEqual(
      ExtensionEnv.checkIsInternalMessage(
        validSender,
        extensionId,
        extensionUrl
      ),
      true
    );

    assert.strictEqual(
      ExtensionEnv.checkIsInternalMessage(
        {
          ...validSender,
          url: "https://other.com",
        },
        extensionId,
        extensionUrl
      ),
      false
    );

    assert.strictEqual(
      ExtensionEnv.checkIsInternalMessage(
        {
          ...validSender,
          id: "other_id",
        },
        extensionId,
        extensionUrl
      ),
      false
    );

    assert.strictEqual(
      ExtensionEnv.checkIsInternalMessage(
        {
          id: "other_id",
          url: "https://other.com",
        },
        extensionId,
        extensionUrl
      ),
      false
    );
  });

  it("should throw an error if the sender is invalid", () => {
    assert.throws(() => {
      ExtensionEnv.checkIsInternalMessage({}, "id", "https://wallet.keplr.app");
    });

    assert.throws(() => {
      ExtensionEnv.checkIsInternalMessage(
        {
          ...validSender,
          url: "invalid://test.com",
        },
        "id",
        "https://wallet.keplr.app"
      );
    });
  });
});
