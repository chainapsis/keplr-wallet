---
title: EVM-based Chains
order: 5
---

# EVM-Based Chain Support

Keplr enables seamless interaction with EVM-based chains, allowing users to utilize its features on Ethereum and other compatible networks. Developers can access the `window.keplr` and `window.keplr.ethereum` objects to leverage various methods for EVM-based interactions.

## Requesting Ethereum Signatures

Keplr supports native Ethereum signing for EVM-based chains, including EVM-compatible Cosmos chains like Evmos. Developers can use the `window.keplr.signEthereum` method to sign:

- [Personal Messages](https://eips.ethereum.org/EIPS/eip-191)  
- [Transactions](https://ethereum.org/en/developers/docs/transactions/)  
- [Typed Data](https://eips.ethereum.org/EIPS/eip-712)  

```typescript
signEthereum(
  chainId: string,
  signer: string,
  data: string | Uint8Array,
  type: 'message' | 'transaction' | 'eip-712'
);
```

**Notes:**
- The `signer` field supports both Bech32 and Ethereum hex addresses.
- The `data` parameter can be a stringified JSON (for transactions) or a plain text message (for messages). Byte arrays are also supported.

## Sending Ethereum Transactions

Keplr allows sending Ethereum transactions through the `window.keplr.sendEthereumTx` method. It broadcasts the transaction and returns the transaction hash upon success.

```typescript
sendEthereumTx(chainId: string, tx: Uint8Array): Promise<string>;
```

## Suggesting ERC20 Tokens

Users can suggest ERC20 tokens to be added to a chain using the `window.keplr.suggestERC20` method. This process requires user approval.

```typescript
suggestERC20(chainId: string, contractAddress: string);
```

## EVM JSON-RPC Requests

Keplr handles EVM JSON-RPC requests via the `window.keplr.ethereum` object, enabling dApps to interact with EVM chains. Supported methods include those for managing accounts, transactions, subscriptions, and chain configurations.

### Supported Request Types

- **`eth_chainId`**: Returns the current chain's EVM chain ID.
- **`net_version`**: Retrieves the network version.
- **`eth_accounts` & `eth_requestAccounts`**: Returns the selected address.
- **`eth_sendTransaction`**: Sends a signed transaction and returns the transaction hash.

  ```typescript
  params: [
    {
      chainId: string | number,
      from: string,
      gas?: string,
      gasLimit?: string,
    },
  ];
  ```

- **`eth_signTransaction`**: Signs a transaction and returns the signed data.

  ```typescript
  params: [
    {
      chainId?: string | number,
      from: string,
      gas?: string,
      gasLimit?: string,
    },
  ];
  ```

- **`personal_sign`**: Signs a personal message.

  ```typescript
  params: [message: string];
  ```

- **`eth_signTypedData_v3` & `eth_signTypedData_v4`**: Signs EIP-712 typed data.

  ```typescript
  params: [signer: string];
  ```

- **`eth_subscribe` & `eth_unsubscribe`**: Manages subscriptions via WebSocket.
- **`wallet_switchEthereumChain`**: Switches to a specified chain.

  ```typescript
  params: [
    {
      chainId: string,
    },
  ];
  ```

- **`wallet_addEthereumChain`**: Adds a new EVM chain.

  ```typescript
  params: [
    {
      chainId: string,
      chainName: string,
      nativeCurrency: {
        name: string,
        symbol: string,
        decimals: number,
      },
      rpcUrls: string[],
      iconUrls?: string[],
    },
  ];
  ```

- **`wallet_getPermissions`, `wallet_requestPermissions`**: Requests or returns permissions.
- **`wallet_revokePermissions`**: Revokes permissions.
  ```typescript
  params: [
    {
      eth_accounts: object
    },
  ]
  ```

- **`wallet_watchAsset`**: Adds an ERC20 asset.

  ```typescript
  params: {
    type: string,
    options: {
      address: string,
      symbol?: string,
      decimals?: number,
      image?: string,
      tokenId?: string,
    },
  };
  ```

#### Ethereum-Native Methods

- `eth_call`, `eth_estimateGas`, `eth_getTransactionCount`, `eth_getTransactionByHash`, `eth_getTransactionByBlockHashAndIndex`, `eth_getTransactionByBlockNumberAndIndex`, `eth_getTransactionReceipt`, `eth_sendRawTransaction`, `eth_protocolVersion`, `eth_syncing`, `eth_getCode`, `eth_getLogs`, `eth_getProof`, `eth_getStorageAt`, `eth_getBalance`, `eth_blockNumber`, `eth_getBlockByHash`, `eth_getBlockByNumber`, `eth_gasPrice`, `eth_feeHistory`, `eth_maxPriorityFeePerGas`

Keplr supports Ethereum-native methods following [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) and [EIP-2255](https://eips.ethereum.org/EIPS/eip-2255) standards. For a complete list, refer to the [Ethereum JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/).

## Example Usage

### Requesting Permissions

```typescript
window.keplr.ethereum.request({
  method: "wallet_requestPermissions",
});
```

### Revoking Permissions

```typescript
window.keplr.ethereum.request({
  method: "wallet_revokePermissions",
  params: [
    {
      eth_accounts: "eth_accounts",
    },
  ],
});
```

## Events

The EVM provider offers event listeners to track changes in accounts and chain.

### accountsChanged

Listen for changes to the user's exposed account address.

#### Interface

```typescript
interface KeplrEvmProvider {
  on: (event: 'accountsChanged', handler: (accounts: Array<string>) => void) => void;
  off: (event: 'accountsChanged', handler: (accounts: Array<string>) => void) => void;
}
```

#### Example

```typescript
const handleAccountsChanged = (accounts) => {
  console.log('Accounts changed:', accounts);
};

// Add listener
window.keplr.ethereum.on('accountsChanged', handleAccountsChanged);

// Remove listener
window.keplr.ethereum.off('accountsChanged', handleAccountsChanged);
```

### chainChanged

Listen for changes to the current chain.

#### Interface

```typescript
interface KeplrEvmProvider {
  on: (event: 'chainChanged', handler: (chainIdHexString: string) => void) => void;
  off: (event: 'chainChanged', handler: (chainIdHexString: string) => void) => void;
}
```

#### Example

```typescript
const handleChainChanged = (chainIdHexString) => {
  console.log('Chain changed:', chainIdHexString);
};

// Add listener
window.keplr.ethereum.on('chainChanged', handleChainChanged);

// Remove listener
window.keplr.ethereum.off('chainChanged', handleChainChanged);
```
