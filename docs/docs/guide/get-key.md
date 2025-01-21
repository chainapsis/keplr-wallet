# Get Address / Public Key

The `getKey` function is used to retrieve addresses and its associated public key. This function is a crucial part of interacting with blockchain accounts, enabling developers to obtain account details securely.

---

## Function Signature

```javascript
getKey(chainId: string): Promise<Key>
```

### Parameters
  - `chainId` (string): The unique identifier of the blockchain chain from which the key information should be retrieved.
    - Cosmos-based chainIds (e.g., cosmoshub-4)
    - EVM-based chainIds (e.g., eip155:1)
    - Starknet chainIds (e.g., starknet:SN_MAIN)

If the webpage has the necessary permissions to access the key and Keplr is unlocked, invoking `getKey` will return the address and public key with information aside in the following structure:

### Return Type

```typescript
interface Key {
  readonly name: string;
  readonly algo: string;
  readonly pubKey: Uint8Array;
  readonly address: Uint8Array;
  readonly bech32Address: string;
  readonly ethereumHexAddress: string;
  readonly isNanoLedger: boolean;
  readonly isKeystone: boolean;
}
```

### Key Properties Table

| **Property**        | **Type**    | **Description**                       |
|---------------------|-------------|---------------------------------------|
| `name`              | `string`    | The name of the currently selected key store. This is a descriptive label set by the user.|
| `algo`              | `string`    | The algorithm used to generate the key (e.g., `secp256k1`).|
| `pubKey`            | `Uint8Array`| The public key of the account, provided in binary format (`Uint8Array`).|
| `address`           | `Uint8Array`| The account address, represented in binary format (`Uint8Array`).|
| `bech32Address`     | `string`    | The Bech32-encoded address, commonly used in Cosmos-based blockchains.|
| `ethereumHexAddress`| `string`    | The Ethereum-compatible address, formatted as a hexadecimal string.|
| `isNanoLedger`      | `boolean`   | Indicates whether the selected account is from a Ledger Nano hardware wallet.|
| `isKeystone`        | `boolean`   | Indicates whether the selected account is from a Keystone hardware wallet.|

<br/>

:::info
Hardware Wallet Support:
- Ledger wallets typically use the Amino JSON sign mode due to limited support for Protobuf-based SIGN_MODE_DIRECT. Check more details [here](../cosmjs#types-of-offline-signers).
- Use the `isNanoLedger` and `isKeystone` properties to determine the appropriate signing mode for hardware wallets.
:::

---

## Example Usage

Here’s an example of how to use the `getKey` function:

#### Cosmos-based chain
```javascript
(async () => {
  try {
    const chainId = "cosmoshub-4";
    const key = await getKey(chainId);

    console.log("Account Name:", key.name);
    console.log("Public Key (Hex):", Buffer.from(key.pubKey).toString("hex"));
    console.log("Bech32 Address:", key.bech32Address);
    console.log("Ethereum Address:", key.ethereumHexAddress);
    console.log("Is from Ledger:", key.isNanoLedger);
  } catch (error) {
    console.error("Error retrieving key:", error);
  }
})();
```

#### EVM-based chain
```javascript
(async () => {
  try {
    const chainId = "eip155:1"; // e.g., Ethereum Mainnet
    const key = await getKey(chainId);

    console.log("Account Name:", key.name);
    console.log("Public Key (Hex):", Buffer.from(key.pubKey).toString("hex"));
    console.log("Ethereum Address:", key.ethereumHexAddress);
    console.log("Is from Ledger:", key.isNanoLedger);
  } catch (error) {
    console.error("Error retrieving key:", error.message);
  }
})();
```
