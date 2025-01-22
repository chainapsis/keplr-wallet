import SignMessageExampleImage from "@site/static/img/guide/sign-message-example.png";
import SignMessageEvmExampleImage from "@site/static/img/guide/sign-message-evm-example.png";

# Sign a Message

## Overview

Before submitting a transaction, users are required to review and sign a message to ensure their approval. Keplr simplifies this process by providing methods for signing messages across various blockchain networks. When a signing request is initiated, a popup appears prompting the user to confirm the action. Below is an example of the popup that users will encounter:

<div style={{ display: "flex", justifyContent: "space-around" }}>
  <figure style={{ textAlign: "center" }}>
    <figcaption style={{ fontSize: "0.8em", fontWeight: "bold" }}>For a Cosmos-based Chain Tx</figcaption>
    <img
      src={SignMessageExampleImage}
      width="300"
      alt="Signing Message For Cosmos-based Chains"
    />
  </figure>
  <figure style={{ textAlign: "center" }}>
    <figcaption style={{ fontSize: "0.8em", fontWeight: "bold" }}>For a EVM-based Chain Tx</figcaption>
    <img
      src={SignMessageEvmExampleImage}
      width="300"
      alt="Signing Message For EVM-based Chains"
    />
  </figure>
</div>

- Cosmos-based Chains
  - Keplr provides methods to sign messages using two distinct signing modes: **Amino** and **Protobuf (Direct)**. Each mode has its own use cases and compatibility considerations, as described in the next section.
- EVM-based Chains
  - Continue from the [EVM-based Chains](../multi-ecosystem-support/evm#requesting-ethereum-signatures) section.
- Starknet
  - Continue from the [Starknet](../multi-ecosystem-support/starknet#requesting-a-starknet-signature) section.

---

## Signing Modes in the Cosmos SDK

1. **Amino Signing**:<br/>
    Amino is the legacy JSON-based signing format used by Cosmos SDK. It encodes transactions in a human-readable JSON structure and is widely supported across Cosmos-based blockchains.
    - **Pros**:
      - Highly compatible with older wallets and hardware devices, such as Ledger.
      - Easier to debug due to its JSON representation.
    - **Cons**:
      - Larger transaction sizes compared to Protobuf.
      - Limited efficiency due to its JSON-based structure.

2. **Protobuf-Based Signing (Direct)**:<br/>
    Protobuf is the modern binary-based signing format for the Cosmos SDK, introduced with `SIGN_MODE_DIRECT`. It is more efficient and compact than Amino.
    - **Pros**:
      - Smaller transaction sizes.
      - Faster serialization and deserialization.
    - **Cons**:
      - Requires updated wallet and device firmware (e.g., Ledger may not support it fully in some cases).
      - More challenging to debug due to its binary format.

Developers should choose the signing mode based on the target chain's requirements and the compatibility of wallets or hardware devices.

More details about the signing modes can be found in the <a href="https://docs.cosmos.network/main/learn/advanced/transactions#signing-transactions" target="_blank">Cosmos SDK documentation</a>.

---

## Amino Signing

### Function Signature

```javascript
signAmino(
  chainId: string,
  signer: string,
  signDoc: StdSignDoc,
  signOptions?: KeplrSignOptions
): Promise<AminoSignResponse>;
```

The `signAmino` method signs an Amino-encoded `StdSignDoc`. Unlike CosmJS's `OfflineSigner`, Keplr's `signAmino` requires the `chainId` parameter to ensure the transaction is linked to the correct chain.

#### Parameters

- **`chainId`** (`string`): The chain ID of the chain where the transaction is being signed.
- **`signer`** (`string`): The Bech32 address of the signer.
- **`signDoc`** (`StdSignDoc`): The transaction document to be signed, encoded in Amino format.
    ```typescript
    interface StdSignDoc {
      chain_id: string;
      account_number: string;
      sequence: string;
      timeout_height?: string;
      fee: StdFee;
      msgs: Msg[];
      memo: string;
    }
    ```
- **`signOptions`** (`KeplrSignOptions`, optional): Additional signing options. <a id="sign-options"></a>
  - `preferNoSetFee`: If true, the fee configured by the dApp will be prioritized over the fee set by the user.
  - `preferNoSetMemo`: If true, the memo will be set by the dApp and the user will not be able to modify it.
  - `disableBalanceCheck`: If true, the transaction won't be blocked even if the balance is insufficient.

#### Return Type

```typescript
interface AminoSignResponse {
  readonly signed: StdSignDoc;
  readonly signature: StdSignature;
}
```

### Example Usage

```javascript
const signDoc = {
  "account_number": "227917",
  "chain_id": "celestia",
  "fee": {
    "gas": "96585",
    "amount": [{ "amount": "966", "denom": "utia" }]
  },
  "msgs": [
    {
      "type": "cosmos-sdk/MsgSend",
      "value": {
        // msg value objects here
      }
    }
  ],
  "sequence": "84",
  "memo": "Test transaction",
};

const signOptions = {
  preferNoSetFee: false,
  preferNoSetMemo: true,
  disableBalanceCheck: true,
};

const signedResponse = await keplr.signAmino(
  "celestia", 
  "celestia1...", 
  signDoc, 
  signOptions,
);

console.log("Signed Doc:", signedResponse.signed);
console.log("Signature:", signedResponse.signature);
```

---

## Protobuf-Based Signing (Direct)

### Function Signature

```javascript
signDirect(
  chainId: string,
  signer: string,
  signDoc: SignDoc,
  signOptions?: KeplrSignOptions
): Promise<DirectSignResponse>;
```

The `signDirect` method signs a Protobuf-encoded transaction (`StdSignDoc`) using `SIGN_MODE_DIRECT`. Similar to CosmJS's `OfflineDirectSigner`, Keplr's `signDirect` also requires the `chainId` parameter.

#### Parameters

- **`chainId`** (`string`): The chain ID of the chain where the transaction is being signed.
- **`signer`** (`string`): The Bech32 address of the signer.
- **`signDoc`** (`SignDoc`): The Protobuf-encoded transaction document, including:
  - `bodyBytes`: Encoded transaction body (messages and memo).
  - `authInfoBytes`: Encoded authorization information (fees, signer info).
  - `chainId`: The chain ID of the transaction.
  - `accountNumber`: The account number of the signer.

#### Return Type

The method returns a `DirectSignResponse` containing the signed transaction and its signature.

**`DirectSignResponse` Interface**

```typescript
interface DirectSignResponse {
  readonly signed: SignDoc;
  readonly signature: {
    readonly signature: StdSignature;
    readonly pub_key: PubKey;
  };
}
```

### Example Usage

```javascript
const signDoc = {
  bodyBytes: new Uint8Array(), // Add encoded messages
  authInfoBytes: new Uint8Array(), // Add encoded fee and signer info
  chainId: "celestia",
  accountNumber: 12345,
};

const signOptions = {
  preferNoSetFee: true, 
};

const directResponse = await keplr.signDirect(
  "celestia", 
  "celestia1...", 
  signDoc, 
  signOptions,
);

console.log("Signed Doc:", directResponse.signed);
console.log("Signature:", directResponse.signature);
```
