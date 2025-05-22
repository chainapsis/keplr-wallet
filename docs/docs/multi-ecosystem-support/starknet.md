---
title: Starknet
order: 6
---

# Starknet Support

## Signing Transactions on Starknet

### Requesting a Starknet Signature

To request a Starknet signature, use the `window.keplr.signStarknetTx` method. This method returns a promise that resolves to an object containing the signed transactions and signer details.

```typescript
signStarknetTx(
    chainId: string,
    transactions: Call[],
    details: InvocationsSignerDetails
): Promise<{
    transactions: Call[];
    details: InvocationsSignerDetails;
    signature: string[];
}>
```

### Signing a Starknet Deploy Account Transaction

To start interacting with Starknet, users must create an account, which requires a signature. Use the `window.keplr.signStarknetDeployAccountTransaction` method to sign a deploy account transaction.

```typescript
signStarknetDeployAccountTransaction(
    chainId: string,
    transaction: DeployAccountSignerDetails
): Promise<{
    transaction: DeployAccountSignerDetails;
    signature: string[];
}>
```

## Retrieving Starknet Keys

You can retrieve Starknet keys and addresses using the following methods:

```typescript
type Key = {
  name: string;
  hexAddress: string;
  pubKey: Uint8Array;
  address: Uint8Array;
  isNanoLedger: boolean;
};

// Get the Starknet key for a single chain
getStarknetKey(chainId: string): Promise<Key>;

// Get Starknet keys for multiple chains
getStarknetKeysSettled(
  chainIds: string[]
): Promise<SettledResponses<Key>>;
```

## Starknet JSON-RPC Requests

The `window.keplr.starknet.request` method enables you to send Starknet JSON-RPC requests. This method supports various request types, which may require specific parameters.

```typescript
request<T = unknown>({
  type,
  params,
}: {
  type: string;
  params?: unknown[] | Record<string, unknown>;
}): Promise<T>;
```

### Supported Request Types

- **`wallet_watchAsset`:** Suggest ERC20 tokens.
  ```typescript
  params: {
    type: "ERC20";
    options: {
      address: string
      symbol?: string
      decimals?: number
      image?: string
      name?: string
    };
  };
  ```
- **`wallet_requestAccounts`:** Retrieve selected Starknet accounts.
- **`wallet_getPermissions`:** Retrieve Starknet permissions.
- **`wallet_switchStarknetChain`:** Switch the current chain.
  ```typescript
  params: [{ chainId: string }];
  ```
- **`wallet_requestChainId`:** Retrieve the current chain ID.
- **`wallet_addInvokeTransaction`:** Add a Starknet invoke transaction.
  ```typescript
  params: {
    calls: {
      contract_address: string
      entry_point: string
      calldata: RawArgs | Calldata
    }[]
  };
  ```
- **`wallet_signTypedData`:** Sign Starknet typed data.
  ```typescript
  params: { message: StarknetTypedData };
  ```
- **`wallet_supportedSpecs`:** Retrieve supported Starknet specifications.

#### Starknet-Native Request Types

- `starknet_addDeclareTransaction`, `starknet_addDeployAccountTransaction`, `starknet_addInvokeTransaction`, `starknet_blockHashAndNumber`, `starknet_blockNumber`, `starknet_call`, `starknet_chainId`, `starknet_estimateFee`, `starknet_getBlockTransactionCount`, `starknet_getBlockWithTxHashes`, `starknet_getBlockWithTxs`, `starknet_getClass`, `starknet_getClassAt`, `starknet_getClassHashAt`, `starknet_getEvents`, `starknet_getNonce`, `starknet_getStateUpdate`, `starknet_getStorageAt`, `starknet_getTransactionByBlockIdAndIndex`, `starknet_getTransactionByHash`, `starknet_getTransactionReceipt`, `starknet_pendingTransactions`, `starknet_simulateTransactions`, `starknet_specVersion`, `starknet_syncing`

For detailed information on Starknet JSON-RPC APIs, refer to the [Starknet API OpenRPC](https://github.com/starkware-libs/starknet-specs/blob/master/api/starknet_api_openrpc.json).

### Examples

#### Suggesting ERC20 Tokens

```typescript
window.keplr.starknet.request({
  type: "wallet_watchAsset",
  params: {
    type: "ERC20",
    options: {
      address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH Contract address
    },
  },
});
```

#### Switching Chains

```typescript
window.keplr.starknet.request({
  type: "wallet_switchStarknetChain",
  params: { chainId: "0x534e5f5345504f4c4941" },
});
```

#### Retrieving Transaction Information

```typescript
window.keplr.starknet.request({
  type: "starknet_getTransactionByHash",
  params: { transactionHash: "0x123456789abcdef" },
});
```

## Events

The Starknet provider offers event listeners to track changes in accounts and network.

### accountsChanged

Listen for changes to the user's exposed account address.

#### Interface

```typescript
interface KeplrStarknetProvider {
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
window.keplr.starknet.on('accountsChanged', handleAccountsChanged);

// Remove listener
window.keplr.starknet.off('accountsChanged', handleAccountsChanged);
```

### networkChanged

Listen for changes to the current network.

#### Interface

```typescript
type StarknetChainId = 
  | "0x534e5f4d41494e"     // SN_MAIN - Starknet Mainnet
  | "0x534e5f5345504f4c4941"; // SN_SEPOLIA - Starknet Sepolia Testnet

interface KeplrStarknetProvider {
  on: (event: 'networkChanged', handler: (chainId: StarknetChainId) => void) => void;
  off: (event: 'networkChanged', handler: (chainId: StarknetChainId) => void) => void;
}
```

#### Example

```typescript
const handleNetworkChanged = (chainId) => {
  console.log('Network changed:', chainId);
};

// Add listener
window.keplr.starknet.on('networkChanged', handleNetworkChanged);

// Remove listener
window.keplr.starknet.off('networkChanged', handleNetworkChanged);
```
