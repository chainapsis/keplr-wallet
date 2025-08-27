import { decorateMsgType } from "./decorate-msg-type";

describe("decorateMsgType", () => {
  // Test cases from requirements
  test("should handle MsgVote -> Vote", () => {
    expect(decorateMsgType("MsgVote")).toBe("Vote");
  });

  test("should handle send -> Send", () => {
    expect(decorateMsgType("send")).toBe("Send");
  });

  test("should handle ibc transfer -> Ibc Transfer", () => {
    expect(decorateMsgType("ibc transfer")).toBe("Ibc Transfer");
  });

  test("should handle protobuf-style message types", () => {
    expect(decorateMsgType("/ibc.applications.transfer.v1.MsgTransfer")).toBe(
      "Transfer"
    );
  });

  // Additional test cases
  test("should handle MsgDelegate -> Delegate", () => {
    expect(decorateMsgType("MsgDelegate")).toBe("Delegate");
  });

  test("should handle MsgUndelegate -> Undelegate", () => {
    expect(decorateMsgType("MsgUndelegate")).toBe("Undelegate");
  });

  test("should handle MsgBeginRedelegate -> Begin Redelegate", () => {
    expect(decorateMsgType("MsgBeginRedelegate")).toBe("Begin Redelegate");
  });

  test("should handle hyphen-separated words", () => {
    expect(decorateMsgType("ibc-send")).toBe("Ibc Send");
  });

  test("should handle slash and hyphen separated words", () => {
    expect(decorateMsgType("custom/merged-claim-rewards")).toBe(
      "Custom Merged Claim Rewards"
    );
  });

  test("should handle underscore-separated words", () => {
    expect(decorateMsgType("atomone_mint_photon")).toBe("Atomone Mint Photon");
  });

  test("should handle complex protobuf message types", () => {
    expect(decorateMsgType("/cosmos.staking.v1beta1.MsgCreateValidator")).toBe(
      "Create Validator"
    );
  });

  test("should handle cosmos bank send message", () => {
    expect(decorateMsgType("/cosmos.bank.v1beta1.MsgSend")).toBe("Send");
  });

  test("should handle cosmos distribution withdraw rewards", () => {
    expect(
      decorateMsgType("/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward")
    ).toBe("Withdraw Delegator Reward");
  });

  test("should handle single word without Msg prefix", () => {
    expect(decorateMsgType("vote")).toBe("Vote");
  });

  test("should handle empty string", () => {
    expect(decorateMsgType("")).toBe("");
  });

  test("should handle string with only Msg", () => {
    expect(decorateMsgType("Msg")).toBe("Msg");
  });

  test("should preserve case for acronyms", () => {
    expect(decorateMsgType("IBCSend")).toBe("IBC Send");
  });

  test("should handle mixed separators", () => {
    expect(decorateMsgType("ibc_transfer-receive")).toBe(
      "Ibc Transfer Receive"
    );
  });
});
