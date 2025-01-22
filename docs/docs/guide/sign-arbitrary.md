import SignArbitraryExampleImage from "@site/static/img/guide/sign-arbitrary-example.png";

# Sign an Arbitrary Message

The `signArbitrary` and `verifyArbitrary` APIs enable off-chain proof of account ownership and message verification, adhering to the [ADR-36 specification](https://github.com/cosmos/cosmos-sdk/blob/master/docs/architecture/adr-036-arbitrary-signature.md).

---

## `signArbitrary`

### Function Signatures

This method allows you to request an ADR-36-compliant signature, primarily used for off-chain account ownership proofs. The signature is generated based on the provided `data`.

```javascript
signArbitrary(
  chainId: string,
  signer: string,
  data: string | Uint8Array
): Promise<StdSignature>;
```

#### Parameters

| **Parameter** | **Type**           | **Description**                                                                                           |
|---------------|--------------------|-----------------------------------------------------------------------------------------------------------|
| `chainId`     | `string`           | The chain ID of the chain for which the signature is being requested.                        |
| `signer`      | `string`           | The Bech32 address of the account that will sign the message.                                              |
| `data`        | `string \| Uint8Array` | The arbitrary message to sign. If provided as a string, it will be displayed as plain text in the confirmation popup. |


#### Return Value

It returns a `Promise<StdSignature>` that resolves to the signature object.

**`StdSignature` Interface**

```typescript
interface StdSignature {
  readonly pub_key: PubKey;
  readonly signature: string;
}
```

### Example Usage

```javascript
const chainId = "cosmoshub-4";
const signer = "cosmos1...";
const data = "This is a test message";

const signature = await keplr.signArbitrary(chainId, signer, data);
console.log("Generated Signature:", signature);
```

It displays the popup as follows:

<img
  src={SignArbitraryExampleImage}
  width="300"
  alt="Keplr - Sign Arbitrary Example"
/>

---

## ADR-36 Signing with `signAmino`

If you use the `signAmino` API with a sign doc formatted to meet ADR-36 requirements, it functions equivalently to `signArbitrary`. The required sign doc format is as follows:

1. **Message Requirements**:
   - The message should be a single message of type `"sign/MsgSignData"`.
   - The message must include:
     - `"signer"`: The account performing the signature.
     - `"data"`: The message content, encoded in Base64.

2. **Sign Doc Fields**:
   - **`chain_id`**: Must be an empty string (`""`).
   - **`memo`**: Must be an empty string (`""`).
   - **`account_number`**: Must be `"0"`.
   - **`sequence`**: Must be `"0"`.
   - **`fee`**: Must be `{ gas: "0", amount: [] }`.

Essential details about `signAmino` can be found in [Amino Signing section](./sign-a-message#amino-signing) in "Sign a Message" page.

### Example Usage
```javascript
const adr36SignData = async (chainId, signerAddress, message) => {
  // Base64 encode the message as required by ADR-36
  const base64Data = Buffer.from(message).toString("base64");

  // Create a sign doc compliant with ADR-36
  const signDoc = {
    chain_id: "",
    account_number: "0",
    sequence: "0",
    fee: { gas: "0", amount: [] },
    memo: "",
    msgs: [
    {
      type: "sign/MsgSignData",
      value: {
      signer: signerAddress,
      data: base64Data,
      },
    },
    ],
  };

  const signResponse = await keplr.signAmino(chainId, signerAddress, signDoc);

  console.log("Signed Document:", signResponse.signed);
  console.log("Signature:", signResponse.signature);

  return signResponse;
};
```


---

## `verifyArbitrary`

### Function Signatures

This method verifies the result of an ADR-36 signature generated via the `signArbitrary` or `signAmino` API. 
`verifyArbitrary` is designed for simple usage and verifies the signature of the currently selected account only.

:::note
**Recommendation**: Use the `verifyADR36Amino` function from the `@keplr-wallet/cosmos` package or implement your own verification logic for more robust use cases.
:::


```javascript
verifyArbitrary(
  chainId: string,
  signer: string,
  data: string | Uint8Array,
  signature: StdSignature
): Promise<boolean>;
```

#### Parameters

| **Parameter** | **Type**           | **Description**                                                 |
|---------------|--------------------|-----------------------------------------------------------------|
| `chainId`     | `string`           | The chain ID of the chain for which the signature was created.  |
| `signer`      | `string`           | The Bech32 address of the account used to create the signature. |
| `data`        | `string \| Uint8Array` | The original message that was signed.                       |
| `signature`   | `StdSignature`     | The signature object to verify.                                 |

### Example Usage

```javascript
const chainId = "cosmoshub-4";
const signer = "cosmos1...";
const data = "This is a test message";
const signature = {
  pub_key: { type: "tendermint/PubKeySecp256k1", value: "..." },
  signature: "...",
};

const isValid = await keplr.verifyArbitrary(chainId, signer, data, signature);

console.log("Is signature valid?", isValid);
```
