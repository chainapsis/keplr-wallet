import { PubKey, StdSignature, StdSignDoc } from "@keplr-wallet/types";
import { Buffer } from "buffer/";
import { escapeHTML, sortedJsonByKeyStringify } from "@keplr-wallet/common";

export function encodeSecp256k1Pubkey(pubkey: Uint8Array): PubKey {
  if (pubkey.length !== 33 || (pubkey[0] !== 0x02 && pubkey[0] !== 0x03)) {
    throw new Error(
      "Public key must be compressed secp256k1, i.e. 33 bytes starting with 0x02 or 0x03"
    );
  }
  return {
    type: "tendermint/PubKeySecp256k1",
    value: Buffer.from(pubkey).toString("base64"),
  };
}

export function encodeSecp256k1Signature(
  pubkey: Uint8Array,
  signature: Uint8Array
): StdSignature {
  if (signature.length !== 64) {
    throw new Error(
      "Signature must be 64 bytes long. Cosmos SDK uses a 2x32 byte fixed length encoding for the secp256k1 signature integers r and s."
    );
  }

  return {
    pub_key: encodeSecp256k1Pubkey(pubkey),
    signature: Buffer.from(signature).toString("base64"),
  };
}

export function serializeSignDoc(signDoc: StdSignDoc): Uint8Array {
  return Buffer.from(escapeHTML(sortedJsonByKeyStringify(signDoc)));
}
