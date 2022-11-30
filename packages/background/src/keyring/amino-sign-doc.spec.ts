import { trimAminoSignDoc } from "./amino-sign-doc";

describe("Test trim amino sign doc", () => {
  it("test normal sign doc", () => {
    const signDoc = {
      chain_id: "cosmoshub-4",
      account_number: "1642",
      sequence: "26235",
      fee: {
        amount: [],
        gas: "838921",
      },
      msgs: [
        {
          type: "cosmos-sdk/MsgWithdrawDelegationReward",
          value: {
            delegator_address: "cosmos1ptxnfvmjyx6n6hsu5q2yv9thsy24f83cplprmg",
            validator_address:
              "cosmosvaloper1sjllsnramtg3ewxqwwrwjxfgc4n4ef9u2lcnj0",
          },
        },
      ],
      memo: "",
    };

    const newSignDoc = trimAminoSignDoc(signDoc);

    expect(JSON.stringify(newSignDoc)).toBe(JSON.stringify(signDoc));
  });

  it("test invalid sign doc", () => {
    const signDoc = {
      chain_id: "cosmoshub-4",
      account_number: false,
      sequence: false,
      fee: {
        amount: [],
        gas: "838921",
      },
      msgs: [
        {
          type: "cosmos-sdk/MsgWithdrawDelegationReward",
          value: {
            delegator_address: "cosmos1ptxnfvmjyx6n6hsu5q2yv9thsy24f83cplprmg",
            validator_address:
              "cosmosvaloper1sjllsnramtg3ewxqwwrwjxfgc4n4ef9u2lcnj0",
          },
        },
      ],
      memo: "",
    } as any;

    expect(() => trimAminoSignDoc(signDoc)).toThrow();
  });

  it("test sign doc with unknown field", () => {
    const signDoc = {
      chain_id: "cosmoshub-4",
      account_number: "1642",
      sequence: "26235",
      fee: {
        amount: [],
        gas: "838921",
      },
      msgs: [
        {
          type: "cosmos-sdk/MsgWithdrawDelegationReward",
          value: {
            delegator_address: "cosmos1ptxnfvmjyx6n6hsu5q2yv9thsy24f83cplprmg",
            validator_address:
              "cosmosvaloper1sjllsnramtg3ewxqwwrwjxfgc4n4ef9u2lcnj0",
          },
        },
      ],
      memo: "",
      unknown: 1,
    };

    const newSignDoc = trimAminoSignDoc(signDoc);

    expect((newSignDoc as any).unknown).toBe(undefined);
    expect(JSON.stringify(newSignDoc)).toBe(
      JSON.stringify(
        (() => {
          const obj = {
            ...signDoc,
          } as any;
          delete obj.unknown;
          return obj;
        })()
      )
    );
  });

  it("test sign doc with unknown fields in fee", () => {
    const signDoc = {
      chain_id: "cosmoshub-4",
      account_number: "1642",
      sequence: "26235",
      fee: {
        amount: [
          {
            denom: "uatom",
            amount: "2000",
            foo: 1,
          },
        ],
        gas: "838921",
        payer: "cosmos1ptxnfvmjyx6n6hsu5q2yv9thsy24f83cplprmg",
        granter: "cosmos1ptxnfvmjyx6n6hsu5q2yv9thsy24f83cplprmg",
        bar: "unknown",
      },
      msgs: [
        {
          type: "cosmos-sdk/MsgWithdrawDelegationReward",
          value: {
            delegator_address: "cosmos1ptxnfvmjyx6n6hsu5q2yv9thsy24f83cplprmg",
            validator_address:
              "cosmosvaloper1sjllsnramtg3ewxqwwrwjxfgc4n4ef9u2lcnj0",
          },
        },
      ],
      memo: "",
    };

    const newSignDoc = trimAminoSignDoc(signDoc);

    expect((newSignDoc as any).fee.bar).toBe(undefined);
    expect((newSignDoc as any).fee.amount[0].foo).toBe(undefined);
    expect(JSON.stringify(newSignDoc)).toBe(
      JSON.stringify(
        (() => {
          const obj = {
            ...signDoc,
          } as any;
          delete obj.fee.bar;
          delete obj.fee.amount[0].foo;
          return obj;
        })()
      )
    );
  });

  it("test sign doc with dumb msgs", () => {
    const signDoc = {
      chain_id: "cosmoshub-4",
      account_number: "1642",
      sequence: "26235",
      fee: {
        amount: [],
        gas: "838921",
      },
      msgs: [
        {
          delegator_address: "cosmos1ptxnfvmjyx6n6hsu5q2yv9thsy24f83cplprmg",
          validator_address:
            "cosmosvaloper1sjllsnramtg3ewxqwwrwjxfgc4n4ef9u2lcnj0",
        },
        "dumb",
      ],
      memo: "",
    } as any;

    const newSignDoc = trimAminoSignDoc(signDoc);

    expect(JSON.stringify(newSignDoc)).toBe(JSON.stringify(signDoc));
  });
});
