import { BaseAccount } from "./index";

describe("Test account parse", () => {
  test("Test fromAminoJSON", () => {
    // Base account
    let account = BaseAccount.fromAminoJSON({
      height: "8409557",
      result: {
        type: "cosmos-sdk/BaseAccount",
        value: {
          address: "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k",
          public_key: {
            type: "tendermint/PubKeySecp256k1",
            value: "Avn3xBbmE0+MEyWMuxhmjjiX1GtCUVyv/Mavg8OcRIm4",
          },
          account_number: "9736",
          sequence: "971",
        },
      },
    });

    expect(account.getAddress()).toBe(
      "cosmos1vv6hruquzpty4xpks9znkw8gys5x4nsnqw9f4k"
    );
    expect(account.getSequence().toString()).toBe("971");
    expect(account.getAccountNumber().toString()).toBe("9736");
    expect(account.getType()).toBe("cosmos-sdk/BaseAccount");

    // Vesting account
    account = BaseAccount.fromAminoJSON({
      height: "8409738",
      result: {
        type: "cosmos-sdk/DelayedVestingAccount",
        value: {
          base_vesting_account: {
            base_account: {
              address: "cosmos1x3rhderemr703f4lxktk2da99vl5crs28ur3xl",
              public_key: {
                type: "tendermint/PubKeySecp256k1",
                value: "A+Zzm/8QhyL00ISXgiAgeW6zeqZHezVFi2w3iQkJeKyP",
              },
              account_number: "367245",
              sequence: "7",
            },
            original_vesting: [{ denom: "uatom", amount: "16666660000" }],
            delegated_free: [],
            delegated_vesting: [],
            end_time: "1719752607",
          },
        },
      },
    });

    expect(account.getAddress()).toBe(
      "cosmos1x3rhderemr703f4lxktk2da99vl5crs28ur3xl"
    );
    expect(account.getSequence().toString()).toBe("7");
    expect(account.getAccountNumber().toString()).toBe("367245");
    expect(account.getType()).toBe("cosmos-sdk/DelayedVestingAccount");

    // Custom account that embeds the base account (ethermint)
    account = BaseAccount.fromAminoJSON({
      height: "449",
      result: {
        base_account: {
          address: "evmos1w3ygakvq5snf30pca5g8pnyvvfr7x28djnj34m",
          public_key: {
            type: "tendermint/PubKeySecp256k1",
            value: "AulWtcPTIZWd/CnkFkQOMqDOwU7e+U/Iq8Tli1nhBq6j",
          },
          account_number: "11",
          sequence: "1",
        },
        code_hash:
          "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      },
      // Above makes the type error.
      // But, just test that it can be parsed with ignoring the type error.
    } as any);

    expect(account.getAddress()).toBe(
      "evmos1w3ygakvq5snf30pca5g8pnyvvfr7x28djnj34m"
    );
    expect(account.getSequence().toString()).toBe("1");
    expect(account.getAccountNumber().toString()).toBe("11");
    expect(account.getType()).toBe("");
  });
});
