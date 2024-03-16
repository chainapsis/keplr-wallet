---
title: Signing and Broadcasting
order: 4
---

# Keplr Signature and Broadcasting API

Keplr offers a rich set of functions that allow developers to sign various types of data and request broadcasting for transactions. This guide provides an overview of these functionalities.

## Table of Contents

- [Sign Amino](#sign-amino-signamino)
- [Sign Direct / Protobuf](#sign-direct-protobuf-signdirect)
- [Request Transaction Broadcasting](#request-transaction-broadcasting-sendtx)
- [Request Signature for Arbitrary Message](#request-signature-for-arbitrary-message-signarbitrary)
- [Verify offline messages](#verifying-offline-message-signatures-verifyarbitrary)
- [Request Ethereum Signature](#request-ethereum-signatures)

## Sign Modes

Cosmos SDK chains historically used Amino as the default encoding for transactions and communication. However, with the evolution of Cosmos SDK, Protobuf became the new encoding standard due to its efficiency and cross-language support (Cosmos SDK v0.40+). Most chains today use Protobuf. However, they also have compatibility for Amino signing, primarily due to the support needed for Ledger hardware wallet signing.

#### When to use signAmino over signDirect?

Ledger Hardware Wallets: Even if the chain supports Protobuf, if you are targeting users with Ledger hardware wallets within the Cosmos ecosystem, support for Amino signing might still be necessary. As of this writing, the Cosmos app on Ledger devices only supports Amino-encoded transactions. This means that Ledger users will need Amino signing support to interact with the chain.

### Sign Amino (signAmino)

```javascript
signAmino(chainId: string, signer: string, signDoc: StdSignDoc): Promise<AminoSignResponse>
```

- Keplr's `signAmino` is similar to CosmJS `OfflineSigner`'s `signAmino` but with the chain-id as a required parameter.
- It is used to sign Amino-encoded `StdSignDoc`.

### Sign Direct / Protobuf (signDirect)

```javascript
signDirect(chainId:string, signer:string, signDoc: {
    /** SignDoc bodyBytes */
    bodyBytes?: Uint8Array | null;
    /** SignDoc authInfoBytes */
    authInfoBytes?: Uint8Array | null;
    /** SignDoc chainId */
    chainId?: string | null;
    /** SignDoc accountNumber */
    accountNumber?: Long | null;
  }): Promise<DirectSignResponse>
```

- Similar to CosmJS `OfflineDirectSigner`'s `signDirect` with chain-id as a required parameter.
- Used to sign Proto-encoded `StdSignDoc`.

### Request Transaction Broadcasting (sendTx)

```javascript
sendTx(
    chainId: string,
    tx: Uint8Array,
    mode: BroadcastMode
): Promise<Uint8Array>;
```

- Delegates the broadcasting of the transaction to Keplr's LCD endpoints.
- Returns the transaction hash if successful; otherwise, throws an error.
- Keplr sends notifications on transaction progress.

### Request Signature for Arbitrary Message (signArbitrary)

```javascript
signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
): Promise<StdSignature>;
```

- Experimental implementation based on [ADR-36](https://github.com/cosmos/cosmos-sdk/blob/master/docs/architecture/adr-036-arbitrary-signature.md).
- Mainly used to prove ownership of an account off-chain.

To use ADR-36 with the `signAmino` API, the following criteria must be met:

- The signing document should be in the Amino format. (For Protobuf, ADR-36 requirements aren't fully specified for implementation yet.)
- The message in the sign doc should be singular, with the message type as "sign/MsgSignData".
- The "sign/MsgSignData" message should include "signer" and "data" as its value. The "data" should be base64 encoded.
- Specific fields in the sign doc, such as chain_id, memo, account_number, sequence, and fee, should be set as mentioned in your list above.
- If the `data` parameter type in the `signArbitrary` API is a `string`, the signature page will display as plain text.

### Verifying offline message signatures (verifyArbitrary)

Developers can use the `verifyArbitrary` API to validate results from both the `signArbitrary` and `signAmino` APIs, as long as they conform to the ADR-36 specification standards.

However, a few key things to note:

- The `verifyArbitrary` API is primarily designed for straightforward usage.
- It will return verification results only for the currently selected account's signing document. If the account isn't the one currently selected, an error will be thrown.
- For a more comprehensive experience, it's advisable to use the `verifyADR36Amino` function from the `@keplr-wallet/cosmos` package or implement a custom solution instead of solely relying on the `verifyArbitrary` API.

### Request Ethereum Signatures

```javascript
signEthereum(
  chainId: string,
  signer: string, // Bech32 address, not hex
  data: string | Uint8Array,
  type: 'message' | 'transaction'
)
```

This is an experimental implementation of native Ethereum signing in Keplr to be used by dApps on EVM-compatible chains such as Evmos. 

- Experimental implementation for native Ethereum signing in Keplr for EVM-compatible chains.
- Supports signing [Personal Messages](https://eips.ethereum.org/EIPS/eip-191) or [Transactions](https://ethereum.org/en/developers/docs/transactions/).

Notes on Usage:
- The `signer` field must be a Bech32 address, not an Ethereum hex address
- The data should be either stringified JSON (for transactions) or a string message (for messages). Byte arrays are accepted as alternatives for either.