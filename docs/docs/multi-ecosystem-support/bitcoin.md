---
title: Bitcoin
order: 7
---

# Bitcoin Support

Keplr enables seamless interaction with Bitcoin Mainnet, Bitcoin Signet and Bitcoin Testnet. Dapp developers can access the `window.keplr.bitcoin` and `window.bitcoin_keplr` objects to leverage various methods for interactions.

## Connecting to Keplr and Retrieving Bitcoin Accounts

### connectWallet

Connect the current account and get the address of it.

#### Interface

```typescript
interface KeplrBitcoinProvider {
  connectWallet: () => Promise<string[]>; // return an array of address of current account
}
```

#### Example

```typescript
await window.bitcoin_keplr.connectWallet()
// ["bc1pwnhlsga02l88x8z6l3hgqwep9cakmsp67fh6t664p0juk9dfnd6qff48zw"]
```

### requestAccounts

Connect the current account and get the address of it.

#### Interface

```typescript
interface KeplrBitcoinProvider {
  requestAccounts: () => Promise<string[]>; // return an array of address of current account
}
```

#### Example

```typescript
await window.bitcoin_keplr.requestAccounts()
// ["bc1pwnhlsga02l88x8z6l3hgqwep9cakmsp67fh6t664p0juk9dfnd6qff48zw"]
```

### getAccounts

Get the address of current account. It will return empty array if the website isn't connected to Keplr.

#### Interface

```typescript
interface KeplrBitcoinProvider {
  getAccounts: () => Promise<string[]>; // return an array of address of current account
}
```

#### Example

```typescript
await window.bitcoin_keplr.getAccounts()
// ["bc1pwnhlsga02l88x8z6l3hgqwep9cakmsp67fh6t664p0juk9dfnd6qff48zw"]
```

### getPublicKey

Get the public key of current account.

#### Interface

```typescript
interface KeplrBitcoinProvider {
  getPublicKey: () => Promise<string>; // return a public key of current account
}
```

#### Example

```typescript
await window.bitcoin_keplr.getPublicKey()
// "02560453f4cf8e97515f7cfcdb337745aaddc952f0adf9f2583db402c1a6a6215e"
```

### getAddress

Get the address of current account.

#### Interface

```typescript
interface KeplrBitcoinProvider {
  getAddress: () => Promise<string>; // return a address of current account
}
```

#### Example

```typescript
await window.bitcoin_keplr.getAddress()
// "bc1pwnhlsga02l88x8z6l3hgqwep9cakmsp67fh6t664p0juk9dfnd6qff48zw"
```

### disconnect

Disconnect the current account.

#### Interface

```typescript
interface KeplrBitcoinProvider {
  disconnect: () => Promise<void>;
}
```

#### Example

```typescript
await window.bitcoin_keplr.disconnect()
```

## Getting Bitcoin Balance

### getBalance

Get balance of current account.

#### Interface

```typescript
interface KeplrBitcoinProvider {  
  getBalance: () => Promise<{
    confirmed: number; // the confirmed satoshis
    unconfirmed: number; // the unconfirmed satoshis
    total: number; // the total satoshis
  }>;
}
```

#### Example

```typescript
await window.bitcoin_keplr.getBalance()
// {
//   confirmed: 30000,
//   unconfirmed: 20000,
//   total: 50000
// }
```

### getInscriptions

**Not implemented yet.**

## Getting Network Info and Switching Current Network

### getNetwork

Get the current network.

#### Interface

```typescript
interface KeplrBitcoinProvider {  
  getNetwork: () => Promise<"livenet" | "signet" | "testnet">; // return a string of current network id
}
```

#### Example

```typescript
await window.bitcoin_keplr.getNetwork()
// "livenet"
```

### switchNetwork

Switch the current network.

#### Interface

```typescript
interface KeplrBitcoinProvider {  
  switchNetwork: (
    network: "livenet" | "signet" | "testnet"
  ) => Promise<"livenet" | "signet" | "testnet">; // return a network id to switch
}
```

#### Example

```typescript
await window.bitcoin_keplr.switchNetwork("signet")
// "signet"
```

### getChain

Get the current network info.

#### Interface

```typescript
interface KeplrBitcoinProvider {  
  getChain: () => Promise<{ // return the current network info
    enum: "BITCOIN_MAINNET" | "BITCOIN_SIGNET" | "BITCOIN_TESTNET";
    name: string;
    network: "mainnet" | "signet" | "testnet";
  }>;
}
```

#### Example

```typescript
await window.bitcoin_keplr.getChain()
// {
//   enum: "BITCOIN_TESTNET",
//   name: "Bitcoin Testnet",
//   network: "testnet"
// }
```

### switchChain

Switch current network.

#### Interface

```typescript
interface KeplrBitcoinProvider {  
  switchChain: (
    chain: "BITCOIN_MAINNET" | "BITCOIN_SIGNET" | "BITCOIN_TESTNET"
  ) => Promise<"BITCOIN_MAINNET" | "BITCOIN_SIGNET" | "BITCOIN_TESTNET">; // return a network enum to switch
}
```

#### Example

```typescript
await window.bitcoin_keplr.switchChain("BITCOIN_MAINNET")
// "BITCOIN_MAINNET"
```

## Requesting Bitcoin Signatures

### signPsbt

Signing psbt: this will traverse all inputs that match the current address to sign.

#### Interface

```typescript
interface KeplrBitcoinProvider {
  signPsbt: (
    psbtHex: string, // the hex string of psbt to sign
    options?: {
      autoFinalized?: boolean; // whether finalize psbt after signing, default is true
      toSignInputs?: Array<{ // specify which inputs to sign
        index: number; // which input to sign
        address?: string; // which corresponding private key to use for signing (at least specify either an address or a public key)
        publicKey?: string; // which corresponding private key to use for signing (at least specify either an address or a public key) 
        sighashTypes?: number[]; // sighash types for the input
        disableTweakSigner?: boolean; // set true to use original private key when signing taproot inputs, default is false
        useTweakedSigner?: boolean; // force whether to use tweaked signer. higher priority than disableTweakSigner
      }>;
    }
  ) => Promise<string>; // return a hex string of signed psbt
}
```

#### Example

```typescript
const psbtHex = "70736274ff01007d..." 
await window.bitcoin_keplr.signPsbt(psbtHex, {
  autoFinalized: false,
  toSignInputs: [{
    index: 1,
    address: "bc1pwnhlsga02l88x8z6l3hgqwep9cakmsp67fh6t664p0juk9dfnd6qff48zw",
  }]
})
// "70736274ff01007d..."
```

### signPsbts

Signing psbts: this will traverse all inputs that match the current address to sign.

#### Interface

```typescript
interface KeplrBitcoinProvider {
  signPsbts: (
    psbtsHexes: string[], // the hex strings of psbts to sign
    options?: {
      autoFinalized?: boolean; // whether finalize psbt after signing, default is true
      toSignInputs?: Array<{ // specify which inputs to sign
        index: number; // which input to sign
        address?: string; // which corresponding private key to use for signing (at least specify either an address or a public key)
        publicKey?: string; // which corresponding private key to use for signing (at least specify either an address or a public key) 
        sighashTypes?: number[]; // sighash types for the input
        disableTweakSigner?: boolean; // set true to use original private key when signing taproot inputs, default is false
        useTweakedSigner?: boolean; // force whether to use tweaked signer. higher priority than disableTweakSigner
      }>;
    }
  ) => Promise<string[]>; // return an array of hex strings of signed psbts
}
```

#### Example

```typescript
const psbtHex = "70736274ff01007d..." 
await window.bitcoin_keplr.signPsbt(psbtHex, {
  autoFinalized: false,
  toSignInputs: [{
    index: 1,
    address: "bc1pwnhlsga02l88x8z6l3hgqwep9cakmsp67fh6t664p0juk9dfnd6qff48zw",
  }]
})
// ["70736274ff01007d..."]
```

### signMessage

Sign a message using either ECDSA or BIP322-Simple signing method.

#### Interface

```typescript
interface KeplrBitcoinProvider {
  signMessage: (
    message: string, // a string to sign
    type?: "ecdsa" | "bip322-simple" // signing method type, default is "ecdsa"
  ) => Promise<string>; // return a signature of signed message
}
```

#### Example

```typescript
const message = "Hello Keplr" 
await window.bitcoin_keplr.signMessage(message)
// "AUACrYkJs6H1EWzKRzWYuLoHqpbGz47qbiurlRffBgl3mZvE7KLpdwYVkrChzkF8ycFHNJPpTl8gHG1Cd67WyNZO"
```

## Sending Bitcoin Transaction

### sendBitcoin

Send BTC

#### Interface

```typescript
interface KeplrBitcoinProvider {
  sendBitcoin: (
    to: string, // the address to send
    amount: number // the satoshis to send
  ) => Promise<string>; // return the tx id
}
```

#### Example

```typescript
await window.bitcoin_keplr.sendBitcoin("bc1pwnhlsga02l88x8z6l3hgqwep9cakmsp67fh6t664p0juk9dfnd6qff48zw", 10000)
// "acc16b5e9e69ea8f1de96d839a0e2cb9bc2ddc6dd8d19115f6bbfca81852aac2"
```

### pushTx

Push Transaction

#### Interface

```typescript
interface KeplrBitcoinProvider {
  pushTx: (
    rawTxHex: string // hex string of raw tx to push
  ) => Promise<string>; // return the tx id
}
```

#### Example

```typescript
const rawTxHex = "0200000000010135bd7d..."
await window.bitcoin_keplr.pushTx(rawTxHex, 10000)
// "acc16b5e9e69ea8f1de96d839a0e2cb9bc2ddc6dd8d19115f6bbfca81852aac2"
```
