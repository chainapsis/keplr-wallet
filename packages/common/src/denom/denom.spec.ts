import { DenomHelper } from "./index";

describe("Test Denom helper methods", () => {
  test("Test ibc denom", () => {
    expect(
      DenomHelper.ibcDenom(
        [
          {
            portId: "transfer",
            channelId: "channel-0",
          },
        ],
        "uatom"
      )
    ).toBe(
      "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
    );
  });
});
