import Long from "long";

export declare enum BroadcastMode {
  /** Return after tx commit */
  Block = "block",
  /** Return after CheckTx */
  Sync = "sync",
  /** Return right away */
  Async = "async",
}

export interface Coin {
  readonly denom: string;
  readonly amount: string;
}

export interface StdFee {
  readonly amount: readonly Coin[];
  readonly gas: string;
  readonly payer?: string;
  readonly granter?: string;

  // XXX: "feePayer" should be "payer". But, it maybe from ethermint team's mistake.
  //      That means this part is not standard.
  readonly feePayer?: string;
}

export interface Msg {
  readonly type: string;
  readonly value: any;
}

export interface StdSignDoc {
  readonly chain_id: string;
  readonly account_number: string;
  readonly sequence: string;
  // Should be nullable
  readonly timeout_height?: string;
  readonly fee: StdFee;
  readonly msgs: readonly Msg[];
  readonly memo: string;
}

export interface PubKey {
  readonly type: string;
  readonly value: string;
}

export interface StdSignature {
  readonly pub_key: PubKey;
  readonly signature: string;
}

export interface StdTx {
  readonly msg: readonly Msg[];
  readonly fee: StdFee;
  readonly signatures: readonly StdSignature[];
  readonly memo: string | undefined;
}

export interface AminoSignResponse {
  readonly signed: StdSignDoc;
  readonly signature: StdSignature;
}

export interface SignDoc {
  /**
   * body_bytes is protobuf serialization of a TxBody that matches the
   * representation in TxRaw.
   */
  bodyBytes: Uint8Array;
  /**
   * auth_info_bytes is a protobuf serialization of an AuthInfo that matches the
   * representation in TxRaw.
   */
  authInfoBytes: Uint8Array;
  /**
   * chain_id is the unique identifier of the chain this transaction targets.
   * It prevents signed transactions from being used on another chain by an
   * attacker
   */
  chainId: string;
  /** account_number is the account number of the account in state */
  accountNumber: Long;
}

export interface DirectSignResponse {
  /**
   * The sign doc that was signed.
   * This may be different from the input signDoc when the signer modifies it as part of the signing process.
   */
  readonly signed: SignDoc;
  readonly signature: StdSignature;
}

/**
 * This is the same as Algo from @cosmjs/launchpad but those might diverge in the future.
 */
export declare type Algo = "secp256k1" | "ed25519" | "sr25519";
/**
 * This is the same as AccountData from @cosmjs/launchpad but those might diverge in the future.
 */
export interface AccountData {
  /** A printable address (typically bech32 encoded) */
  readonly address: string;
  readonly algo: Algo;
  readonly pubkey: Uint8Array;
}
export interface DirectSignResponse {
  /**
   * The sign doc that was signed.
   * This may be different from the input signDoc when the signer modifies it as part of the signing process.
   */
  readonly signed: SignDoc;
  readonly signature: StdSignature;
}
export interface OfflineDirectSigner {
  readonly getAccounts: () => Promise<readonly AccountData[]>;
  readonly signDirect: (
    signerAddress: string,
    signDoc: SignDoc
  ) => Promise<DirectSignResponse>;
}

export interface OfflineAminoSigner {
  /**
   * Get AccountData array from wallet. Rejects if not enabled.
   */
  readonly getAccounts: () => Promise<readonly AccountData[]>;
  /**
   * Request signature from whichever key corresponds to provided bech32-encoded address. Rejects if not enabled.
   *
   * The signer implementation may offer the user the ability to override parts of the signDoc. It must
   * return the doc that was signed in the response.
   *
   * @param signerAddress The address of the account that should sign the transaction
   * @param signDoc The content that should be signed
   */
  readonly signAmino: (
    signerAddress: string,
    signDoc: StdSignDoc
  ) => Promise<AminoSignResponse>;
}
