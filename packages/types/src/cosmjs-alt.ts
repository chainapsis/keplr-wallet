import { StdSignature } from "./cosmjs";
import Long from "long";

export interface SignDocDirectAux {
  /**
   * body_bytes is protobuf serialization of a TxBody that matches the
   * representation in TxRaw.
   */
  bodyBytes: Uint8Array;
  /** public_key is the public key of the signing account. */
  publicKey:
    | {
        typeUrl: string;
        /** Must be a valid serialized protocol buffer of the above specified type. */
        value: Uint8Array;
      }
    | undefined;
  /**
   * chain_id is the identifier of the chain this transaction targets.
   * It prevents signed transactions from being used on another chain by an
   * attacker.
   */
  chainId: string;
  /** account_number is the account number of the account in state. */
  accountNumber: Long;
  /** sequence is the sequence number of the signing account. */
  sequence: Long;
}

export interface DirectAuxSignResponse {
  /**
   * The sign doc that was signed.
   * This may be different from the input signDoc when the signer modifies it as part of the signing process.
   */
  readonly signed: SignDocDirectAux;
  readonly signature: StdSignature;
}
