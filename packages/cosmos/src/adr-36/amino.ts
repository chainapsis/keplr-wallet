import { serializeSignDoc, StdSignDoc } from "@cosmjs/launchpad";
import { Bech32Address } from "../bech32";
import { Buffer } from "buffer/";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";

/**
 * Check the sign doc is for ADR-36.
 * If the sign doc is expected to be ADR-36, validate the sign doc and throw an error if the sign doc is valid ADR-36.
 * @param signDoc
 * @param bech32PrefixAccAddr If this argument is provided, validate the signer in the `MsgSignData` with this prefix.
 *                            If not, validate the signer in the `MsgSignData` without considering the bech32 prefix.
 */
export function checkAndValidateADR36AminoSignDoc(
  signDoc: StdSignDoc,
  bech32PrefixAccAddr?: string
): boolean {
  const hasOnlyMsgSignData = (() => {
    if (
      signDoc &&
      signDoc.msgs &&
      Array.isArray(signDoc.msgs) &&
      signDoc.msgs.length === 1
    ) {
      const msg = signDoc.msgs[0];
      return msg.type === "sign/MsgSignData";
    } else {
      return false;
    }
  })();

  if (!hasOnlyMsgSignData) {
    return false;
  }

  if (signDoc.chain_id !== "") {
    throw new Error("Chain id should be empty string for ADR-36 signing");
  }

  if (signDoc.memo !== "") {
    throw new Error("Memo should be empty string for ADR-36 signing");
  }

  if (signDoc.account_number !== "0") {
    throw new Error('Account number should be "0" for ADR-36 signing');
  }

  if (signDoc.sequence !== "0") {
    throw new Error('Sequence should be "0" for ADR-36 signing');
  }

  if (signDoc.fee.gas !== "0") {
    throw new Error('Gas should be "0" for ADR-36 signing');
  }

  if (signDoc.fee.amount.length !== 0) {
    throw new Error("Fee amount should be empty array for ADR-36 signing");
  }

  const msg = signDoc.msgs[0];
  if (msg.type !== "sign/MsgSignData") {
    throw new Error(`Invalid type of ADR-36 sign msg: ${msg.type}`);
  }
  if (!msg.value) {
    throw new Error("Empty value in the msg");
  }
  const signer = msg.value.signer;
  if (!signer) {
    throw new Error("Empty signer in the ADR-36 msg");
  }
  Bech32Address.validate(signer, bech32PrefixAccAddr);
  const data = msg.value.data;
  if (!data) {
    throw new Error("Empty data in the ADR-36 msg");
  }
  const rawData = Buffer.from(data, "base64");
  // Validate the data is encoded as base64.
  if (rawData.toString("base64") !== data) {
    throw new Error("Data is not encoded by base64");
  }
  if (rawData.length === 0) {
    throw new Error("Empty data in the ADR-36 msg");
  }

  return true;
}

export function makeADR36AminoSignDoc(
  signer: string,
  data: string | Uint8Array
): StdSignDoc {
  if (typeof data === "string") {
    data = Buffer.from(data).toString("base64");
  } else {
    data = Buffer.from(data).toString("base64");
  }

  return {
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
          signer,
          data,
        },
      },
    ],
    memo: "",
  };
}

export function verifyADR36AminoSignDoc(
  bech32PrefixAccAddr: string,
  signDoc: StdSignDoc,
  pubKey: Uint8Array,
  signature: Uint8Array
): boolean {
  if (!checkAndValidateADR36AminoSignDoc(signDoc, bech32PrefixAccAddr)) {
    throw new Error("Invalid sign doc for ADR-36");
  }

  const cryptoPubKey = new PubKeySecp256k1(pubKey);
  const expectedSigner = new Bech32Address(cryptoPubKey.getAddress()).toBech32(
    bech32PrefixAccAddr
  );
  const signer = signDoc.msgs[0].value.signer;
  if (expectedSigner !== signer) {
    throw new Error("Unmatched signer");
  }

  const msg = serializeSignDoc(signDoc);

  return cryptoPubKey.verify(msg, signature);
}

export function verifyADR36Amino(
  bech32PrefixAccAddr: string,
  signer: string,
  data: string | Uint8Array,
  pubKey: Uint8Array,
  signature: Uint8Array
): boolean {
  const signDoc = makeADR36AminoSignDoc(signer, data);

  return verifyADR36AminoSignDoc(
    bech32PrefixAccAddr,
    signDoc,
    pubKey,
    signature
  );
}
