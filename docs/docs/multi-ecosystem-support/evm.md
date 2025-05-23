import EnableChainExampleImage from "@site/static/img/guide/enable-chain-evm-example.png";

# EVM-Based Chain Support

Keplr enables seamless interaction with EVM-based chains, allowing users to utilize its features on Ethereum and other compatible networks. Developers can access the EVM provider through the `evm` object, which is a member of the Keplr instance object. Throughout this documentation, we refer to these objects as `keplr` and `keplr.ethereum`.

## Enabling Connection

To interact with EVM-based chains, you first need to call the `keplr.ethereum.enable` method, which prompts the user for permission via a popup.

```typescript
enable(): Promise<void>
```

<img
  src={EnableChainExampleImage}
  width="300"
  alt="Starknet Enable Chain Example Image"
/>


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

Keplr allows sending Ethereum transactions through the `keplr.sendEthereumTx` method. It broadcasts the transaction and returns the transaction hash upon success.

```typescript
sendEthereumTx(chainId: string, tx: Uint8Array): Promise<string>;
```

## Suggesting ERC20 Tokens

Users can suggest ERC20 tokens to be added to a chain using the `keplr.suggestERC20` method. This process requires user approval.

```typescript
suggestERC20(chainId: string, contractAddress: string);
```

## EVM JSON-RPC Requests

Keplr handles EVM JSON-RPC requests via the `keplr.ethereum` object, enabling dApps to interact with EVM chains. Supported methods include those for managing accounts, transactions, subscriptions, and chain configurations.

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
keplr.ethereum.request({
  method: "wallet_requestPermissions",
});
```

### Revoking Permissions

```typescript
keplr.ethereum.request({
  method: "wallet_revokePermissions",
  params: [
    {
      eth_accounts: "eth_accounts",
    },
  ],
});
```
