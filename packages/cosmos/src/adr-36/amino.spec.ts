import {
  checkAndValidateADR36AminoSignDoc,
  makeADR36AminoSignDoc,
  verifyADR36Amino,
  verifyADR36AminoSignDoc,
} from "./amino";
import { serializeSignDoc } from "@cosmjs/launchpad";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { Bech32Address } from "../bech32";

describe("Test ADR-36 Amino Sign Doc", () => {
  it("Check not ADR-36 Amino sign doc", () => {
    expect(
      checkAndValidateADR36AminoSignDoc({
        chain_id: "osmosis-1",
        account_number: "4287",
        sequence: "377",
        fee: {
          gas: "80000",
          amount: [
            {
              denom: "uosmo",
              amount: "0",
            },
          ],
        },
        msgs: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              from_address: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
              to_address: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
              amount: [
                {
                  denom: "uosmo",
                  amount: "1000000",
                },
              ],
            },
          },
        ],
        memo: "",
      })
    ).toBe(false);

    expect(
      checkAndValidateADR36AminoSignDoc({
        chain_id: "osmosis-1",
        account_number: "4287",
        sequence: "377",
        fee: {
          gas: "80000",
          amount: [
            {
              denom: "uosmo",
              amount: "0",
            },
          ],
        },
        msgs: [],
        memo: "",
      })
    ).toBe(false);

    expect(
      checkAndValidateADR36AminoSignDoc({
        chain_id: "osmosis-1",
        account_number: "4287",
        sequence: "377",
        fee: {
          gas: "80000",
          amount: [
            {
              denom: "uosmo",
              amount: "0",
            },
          ],
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        msgs: {},
        memo: "",
      })
    ).toBe(false);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(checkAndValidateADR36AminoSignDoc({})).toBe(false);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(checkAndValidateADR36AminoSignDoc(undefined)).toBe(false);
  });

  it("Check valid ADR-36 Amino sign doc", () => {
    // Without bech32 prefix
    expect(
      checkAndValidateADR36AminoSignDoc({
        chain_id: "",
        account_number: "0",
        sequence: "0",
        fee: {
          gas: "0",
          amount: [],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
            value: {
              signer: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
              data: "cmFuZG9t",
            },
          },
        ],
        memo: "",
      })
    ).toBe(true);

    // With bech32 prefix
    expect(
      checkAndValidateADR36AminoSignDoc(
        {
          chain_id: "",
          account_number: "0",
          sequence: "0",
          fee: {
            gas: "0",
            amount: [],
          },
          msgs: [
            {
              type: "sign/MsgSignData",
              value: {
                signer: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
                data: "cmFuZG9t",
              },
            },
          ],
          memo: "",
        },
        "osmo"
      )
    ).toBe(true);

    // With invalid bech32 prefix
    expect(() =>
      checkAndValidateADR36AminoSignDoc(
        {
          chain_id: "",
          account_number: "0",
          sequence: "0",
          fee: {
            gas: "0",
            amount: [],
          },
          msgs: [
            {
              type: "sign/MsgSignData",
              value: {
                signer: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
                data: "cmFuZG9t",
              },
            },
          ],
          memo: "",
        },
        "cosmos"
      )
    ).toThrow();
  });

  it("Check invalid ADR-36 Amino sign doc", () => {
    // Chain id should be empty string
    expect(() =>
      checkAndValidateADR36AminoSignDoc({
        chain_id: "haha",
        account_number: "0",
        sequence: "0",
        fee: {
          gas: "0",
          amount: [],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
            value: {
              signer: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
              data: "cmFuZG9t",
            },
          },
        ],
        memo: "",
      })
    ).toThrow();

    // Account number should be "0"
    expect(() =>
      checkAndValidateADR36AminoSignDoc({
        chain_id: "",
        account_number: "1",
        sequence: "0",
        fee: {
          gas: "0",
          amount: [],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
            value: {
              signer: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
              data: "cmFuZG9t",
            },
          },
        ],
        memo: "",
      })
    ).toThrow();

    // Sequence should be "0"
    expect(() =>
      checkAndValidateADR36AminoSignDoc({
        chain_id: "",
        account_number: "0",
        sequence: "1",
        fee: {
          gas: "0",
          amount: [],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
            value: {
              signer: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
              data: "cmFuZG9t",
            },
          },
        ],
        memo: "",
      })
    ).toThrow();

    // Gas should be "0"
    expect(() =>
      checkAndValidateADR36AminoSignDoc({
        chain_id: "",
        account_number: "0",
        sequence: "0",
        fee: {
          gas: "1",
          amount: [],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
            value: {
              signer: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
              data: "cmFuZG9t",
            },
          },
        ],
        memo: "",
      })
    ).toThrow();

    // Amount should be empty string
    expect(() =>
      checkAndValidateADR36AminoSignDoc({
        chain_id: "",
        account_number: "0",
        sequence: "0",
        fee: {
          gas: "0",
          amount: [
            {
              denom: "haha",
              amount: "1",
            },
          ],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
            value: {
              signer: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
              data: "cmFuZG9t",
            },
          },
        ],
        memo: "",
      })
    ).toThrow();

    // Memo should be empty string
    expect(() =>
      checkAndValidateADR36AminoSignDoc({
        chain_id: "",
        account_number: "0",
        sequence: "0",
        fee: {
          gas: "0",
          amount: [],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
            value: {
              signer: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
              data: "cmFuZG9t",
            },
          },
        ],
        memo: "1",
      })
    ).toThrow();

    // Should be value
    expect(() =>
      checkAndValidateADR36AminoSignDoc({
        chain_id: "",
        account_number: "0",
        sequence: "0",
        fee: {
          gas: "0",
          amount: [],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
          },
        ],
        memo: "",
      } as any)
    ).toThrow();

    // Value should have signer
    expect(() =>
      checkAndValidateADR36AminoSignDoc({
        chain_id: "",
        account_number: "0",
        sequence: "0",
        fee: {
          gas: "0",
          amount: [],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
            value: {
              data: "cmFuZG9t",
            },
          },
        ],
        memo: "",
      })
    ).toThrow();

    // Value should have valid signer
    expect(() =>
      checkAndValidateADR36AminoSignDoc({
        chain_id: "",
        account_number: "0",
        sequence: "0",
        fee: {
          gas: "0",
          amount: [],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
            value: {
              signer: "invalid1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
              data: "cmFuZG9t",
            },
          },
        ],
        memo: "",
      })
    ).toThrow();

    // Value should be data
    expect(() =>
      checkAndValidateADR36AminoSignDoc({
        chain_id: "",
        account_number: "0",
        sequence: "0",
        fee: {
          gas: "0",
          amount: [],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
            value: {
              signer: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
            },
          },
        ],
        memo: "",
      })
    ).toThrow();

    // Value should be base64 encoded data
    expect(() =>
      checkAndValidateADR36AminoSignDoc({
        chain_id: "",
        account_number: "0",
        sequence: "0",
        fee: {
          gas: "0",
          amount: [],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
            value: {
              signer: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
              data: "sc12v",
            },
          },
        ],
        memo: "",
      })
    ).toThrow();

    // Value should not have the empty data
    expect(() =>
      checkAndValidateADR36AminoSignDoc({
        chain_id: "",
        account_number: "0",
        sequence: "0",
        fee: {
          gas: "0",
          amount: [],
        },
        msgs: [
          {
            type: "sign/MsgSignData",
            value: {
              signer: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
              data: "",
            },
          },
        ],
        memo: "",
      })
    ).toThrow();
  });

  it("Make ADR-36 Amino sign doc and validate", () => {
    let signDoc = makeADR36AminoSignDoc(
      "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
      new Uint8Array([1, 2, 3])
    );

    expect(signDoc.msgs[0].type).toBe("sign/MsgSignData");
    expect(signDoc.msgs[0].value.signer).toBe(
      "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h"
    );
    expect(signDoc.msgs[0].value.data).toBe(
      Buffer.from([1, 2, 3]).toString("base64")
    );
    expect(checkAndValidateADR36AminoSignDoc(signDoc)).toBe(true);

    signDoc = makeADR36AminoSignDoc(
      "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
      "test"
    );

    expect(signDoc.msgs[0].type).toBe("sign/MsgSignData");
    expect(signDoc.msgs[0].value.signer).toBe(
      "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h"
    );
    expect(signDoc.msgs[0].value.data).toBe(
      Buffer.from("test").toString("base64")
    );
    expect(checkAndValidateADR36AminoSignDoc(signDoc)).toBe(true);
  });

  it("Verify ADR-36 Amino sign doc", () => {
    const privKey = PrivKeySecp256k1.generateRandomKey();
    const pubKey = privKey.getPubKey();
    const signer = new Bech32Address(pubKey.getAddress()).toBech32("osmo");

    const signDoc = makeADR36AminoSignDoc(signer, new Uint8Array([1, 2, 3]));

    const msg = serializeSignDoc(signDoc);

    const signature = privKey.sign(msg);

    expect(
      verifyADR36AminoSignDoc("osmo", signDoc, pubKey.toBytes(), signature)
    ).toBe(true);

    expect(() =>
      verifyADR36AminoSignDoc(
        "osmo",
        // Sign doc is not for ADR-36
        {
          chain_id: "osmosis-1",
          account_number: "4287",
          sequence: "377",
          fee: {
            gas: "80000",
            amount: [
              {
                denom: "uosmo",
                amount: "0",
              },
            ],
          },
          msgs: [
            {
              type: "cosmos-sdk/MsgSend",
              value: {
                from_address: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
                to_address: "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
                amount: [
                  {
                    denom: "uosmo",
                    amount: "1000000",
                  },
                ],
              },
            },
          ],
          memo: "",
        },
        pubKey.toBytes(),
        signature
      )
    ).toThrow();

    expect(
      verifyADR36Amino(
        "osmo",
        signer,
        new Uint8Array([1, 2, 3]),
        pubKey.toBytes(),
        signature
      )
    ).toBe(true);

    expect(() =>
      verifyADR36Amino(
        "osmo",
        // Unmatched signer
        "osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
        new Uint8Array([1, 2, 3]),
        pubKey.toBytes(),
        signature
      )
    ).toThrow();

    expect(() =>
      verifyADR36Amino(
        "osmo",
        // Invalid signer
        "invalid1ymk637a7wljvt4w7q9lnrw95mg9sr37yatxd9h",
        new Uint8Array([1, 2, 3]),
        pubKey.toBytes(),
        signature
      )
    ).toThrow();

    expect(
      verifyADR36AminoSignDoc(
        "osmo",
        signDoc,
        pubKey.toBytes(),
        signature.slice().filter((b) => (Math.random() > 0.5 ? 0 : b))
      )
    ).toBe(false);

    expect(
      verifyADR36Amino(
        "osmo",
        signer,
        new Uint8Array([1, 2]),
        pubKey.toBytes(),
        signature
      )
    ).toBe(false);
  });
});
