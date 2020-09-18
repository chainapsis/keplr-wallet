import assert from "assert";
import "mocha";

import * as Messages from "./messages";

describe("Test chains message's validate basic method", () => {
  it("ReqeustAccessMsg should throw an error on validateBasic if field is invalid", () => {
    assert.throws(() => {
      const msg = new Messages.ReqeustAccessMsg("", "", "");
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.ReqeustAccessMsg("12345678", "", "");
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.ReqeustAccessMsg("12345678", "test-1", "");
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.ReqeustAccessMsg(
        "12345678",
        "",
        "http://test.com"
      );
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.ReqeustAccessMsg(
        "12345678",
        "test-1",
        "invalid://origin.com"
      );
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.ReqeustAccessMsg(
        "12345678",
        "test-1",
        "http://origin.com"
      );
      msg.validateBasic();
    });
  });

  it("GetAccessOriginMsg should throw an error on validateBasic if field is invalid", () => {
    assert.throws(() => {
      const msg = new Messages.GetAccessOriginMsg("");
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.GetAccessOriginMsg("test-1");
      msg.validateBasic();
    });
  });

  it("RemoveAccessOriginMsg should throw an error on validateBasic if field is invalid", () => {
    assert.throws(() => {
      const msg = new Messages.RemoveAccessOriginMsg("", "");
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.RemoveAccessOriginMsg("test-1", "");
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.RemoveAccessOriginMsg("", "http://origin.com");
      msg.validateBasic();
    });

    assert.throws(() => {
      const msg = new Messages.RemoveAccessOriginMsg(
        "test-1",
        "invalid://origin.com"
      );
      msg.validateBasic();
    });

    assert.doesNotThrow(() => {
      const msg = new Messages.RemoveAccessOriginMsg(
        "test-1",
        "http://origin.com"
      );
      msg.validateBasic();
    });
  });
});
