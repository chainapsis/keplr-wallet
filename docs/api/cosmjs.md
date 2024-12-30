---
title: Use with CosmJs
order: 2
---

## How to detect Keplr
Keplr API may be undefined right after the webpage is shown.
Please check the [How to detect Keplr](./README.md#how-to-detect-keplr) first before reading this section.

## Connecting with CosmJS

CosmJS official documentation: [https://cosmos.github.io/cosmjs/](https://cosmos.github.io/cosmjs/)

Latest packages:
- Stargate client: [@cosmjs/stargate](https://www.npmjs.com/package/@cosmjs/stargate)
- Tendermint client: [@cosmjs/tendermint-rpc](https://www.npmjs.com/package/@cosmjs/tendermint-rpc)

### Basic Connection

```javascript
try {
  // Enabling before using the Keplr is recommended.
  await window.keplr.enable(chainId);

  const offlineSigner = window.getOfflineSigner(chainId);
  const accounts = await offlineSigner.getAccounts();

  // Initialize the Stargate client
  const cosmJS = await SigningStargateClient.connectWithSigner(
    "https://rpc-endpoint.example.com",
    offlineSigner
  );
  
  console.log("Connected to CosmJS with address:", accounts[0].address);
} catch (error) {
  console.error("Error connecting to Keplr:", error);
}
```

### Error Handling

When working with Keplr and CosmJS, you should handle these common errors:

```javascript
try {
  // Your CosmJS code
} catch (error) {
  if (error instanceof KeplrConnectionError) {
    console.error("Failed to connect to Keplr");
  } else if (error instanceof SigningError) {
    console.error("User rejected the transaction");
  } else {
    console.error("Unknown error:", error);
  }
}
```

## Types of Offline Signers

Keplr supports multiple types of signers:

1. **Combined Signer (Default)**
```javascript
const signer = window.getOfflineSigner(chainId);
// Works with both Amino and Protobuf
```

2. **Amino-Only Signer**
```javascript
const aminoSigner = window.getOfflineSignerOnlyAmino(chainId);
// Forces Amino encoding
```

3. **Auto-detecting Signer**
```javascript
const autoSigner = await window.getOfflineSignerAuto(chainId);
// Automatically chooses based on account type
```

### When to Use Each Signer

- Use **Combined Signer** for most modern applications
- Use **Amino-Only Signer** when:
  - Working with Ledger devices
  - Using chains that don't support Protobuf
  - Need human-readable transaction data
- Use **Auto-detecting Signer** when supporting multiple account types

## Advanced Usage

### Custom Gas Settings
```javascript
const tx = await cosmJS.sendTokens(
  recipient,
  amount,
  {
    gasLimit: "200000",
    gasPriceInFeeDenom: "0.025",
  }
);
```

### Interaction Options
You can customize the user experience using [Interaction Options](./#interaction-options).

### Chain Registration
For adding custom blockchains to Keplr, see the [Suggest Chain](./suggest-chain.md) documentation.

## Best Practices

1. Always check for Keplr availability before usage
2. Implement proper error handling
3. Use appropriate signer type for your use case
4. Test with multiple account types (mnemonic, ledger, etc.)
5. Monitor [keplr_keystorechange](./README.md#change-key-store-event) events

## Examples

For complete implementation examples, check our:
- [Keplr Example Repository](https://github.com/chainapsis/keplr-example)
- [CosmJS Integration Guide](https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html)
