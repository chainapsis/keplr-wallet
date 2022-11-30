import { MockKeplr } from "@keplr-wallet/provider-mock";
import { SigningStargateClient } from "@cosmjs/stargate";

/*
 * Currently, these tests do not test behavior.
 * The purpose of the test is to make sure that there is no type conflict with cosmjs.
 */

describe("Test cosmjs compatibility", () => {
  test("test type conflict with offline signer", async () => {
    const keplr = new MockKeplr(
      () => {
        throw new Error("Not implemented");
      },
      [
        {
          chainId: "test-1",
          bech32Config: {
            bech32PrefixAccAddr: "test",
          },
        },
      ],
      "diary match wagon soccer worth planet sea stumble thought post easily want"
    );

    const offlineSigner = keplr.getOfflineSignerOnlyAmino("test-1");

    const signer = (await offlineSigner.getAccounts())[0].address;
    expect(signer).toBe("test1ce0nzfm5a0j5yg48xz88qr430caaxdrs2ec4f4");

    const cosmJS = await SigningStargateClient.offline(offlineSigner, {
      prefix: "test",
    });

    await cosmJS.sign(
      signer,
      [
        {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: {
            fromAddress: signer,
            toAddress: signer,
            amount: [
              {
                denom: "utest",
                amount: "1",
              },
            ],
          },
        },
      ],
      {
        amount: [
          {
            denom: "utest",
            amount: "1",
          },
        ],
        gas: "100",
      },
      "^^",
      {
        accountNumber: 1,
        sequence: 2,
        chainId: "test-1",
      }
    );
  });

  test("test type conflict with direct signer", async () => {
    const keplr = new MockKeplr(
      () => {
        throw new Error("Not implemented");
      },
      [
        {
          chainId: "test-1",
          bech32Config: {
            bech32PrefixAccAddr: "test",
          },
        },
      ],
      "diary match wagon soccer worth planet sea stumble thought post easily want"
    );

    const offlineSigner = keplr.getOfflineSigner("test-1");

    const signer = (await offlineSigner.getAccounts())[0].address;
    expect(signer).toBe("test1ce0nzfm5a0j5yg48xz88qr430caaxdrs2ec4f4");

    const cosmJS = await SigningStargateClient.offline(offlineSigner, {
      prefix: "test",
    });

    await cosmJS.sign(
      signer,
      [
        {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: {
            fromAddress: signer,
            toAddress: signer,
            amount: [
              {
                denom: "utest",
                amount: "1",
              },
            ],
          },
        },
      ],
      {
        amount: [
          {
            denom: "utest",
            amount: "1",
          },
        ],
        gas: "100",
      },
      "^^",
      {
        accountNumber: 1,
        sequence: 2,
        chainId: "test-1",
      }
    );
  });
});
