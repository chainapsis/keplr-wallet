# Broadcast a Transaction

## Overview

Now that you’ve learned [how to get a signed result](./sign-a-message.md), let’s explore how to broadcast a signed transaction.

- Cosmos-based Chains
  - Continue from the next section.
- EVM-based Chains
  - Continue from the [EVM-based Chains](../multi-ecosystem-support/evm.md#sending-ethereum-transactions) section.
- Starknet
  - Continue from the [Starknet](../multi-ecosystem-support/starknet.md#signing-transactions-on-starknet) section.

---

The `sendTx` method allows developers to broadcast a transaction via Keplr's LCD endpoints. Keplr handles the entire broadcasting process, including notifications on the transaction's progress(e.g., pending, success, or failure). If the transaction fails to broadcast, the method throws an error.

## Function Signature

```typescript
sendTx(
  chainId: string,
  tx: Uint8Array,
  mode: BroadcastMode
): Promise<Uint8Array>
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| **`chainId`** | `string` | The unique identifier of the chain where the transaction will be sent. |
| **`tx`** | `Uint8Array` | The binary representation of the transaction to be broadcasted. This can include Amino-encoded or Protobuf-encoded transactions. |
| **`mode`** | `BroadcastMode` | The mode in which the transaction should be broadcasted. Options include:<br/> - `BroadcastMode.Block`(block): Waits for the transaction to be included in a block.<br/> - `BroadcastMode.Async`(async): Returns immediately after putting the transaction in the mempool.<br/> - `BroadcastMode.Sync`(sync): Returns after broadcasting the transaction without waiting for block confirmation. |

### Return Value

The method returns a `Promise<Uint8Array>` that resolves to the **transaction hash** if the broadcasting succeeds.

---

## Example Usage

```typescript
import { TxRaw } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";

// Please refer to "Sign a Message" page for detailed signing methods
const protoSignResponse = await keplr.signDirect(
  this.chainId,
  this.bech32Address,
  signDoc,
  signOptions,
);

// Build a TxRaw and serialize it for broadcasting
const protobufTx = TxRaw.encode({
  bodyBytes: protoSignResponse.signed.bodyBytes,
  authInfoBytes: protoSignResponse.signed.authInfoBytes,
  signatures: [
    Buffer.from(protoSignResponse.signature.signature, "base64"),
  ],
}).finish();

try {
  // Send the transaction
  const txResponse = await keplr.sendTx("cosmoshub-4", protobufTx, "block");
  const txHash = Buffer.from(txResponse, "hex");
} catch (error) {
  console.error("Failed to broadcast transaction:", error.message);
}
```
