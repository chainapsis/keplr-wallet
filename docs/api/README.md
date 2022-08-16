---
title: Basic API
order: 1
---

## How to detect Keplr

You can determine whether Keplr is installed on the user device by checking `window.keplr`. If `window.keplr` returns `undefined` after document.load, Keplr is not installed. There are several ways to wait for the load event to check the status. Refer to the examples below:

You can register the function to `window.onload`:

```javascript
window.onload = async () => {
    if (!window.keplr) {
        alert("Please install keplr extension");
    } else {
        const chainId = "cosmoshub-4";

        // Enabling before using the Keplr is recommended.
        // This method will ask the user whether to allow access if they haven't visited this website.
        // Also, it will request that the user unlock the wallet if the wallet is locked.
        await window.keplr.enable(chainId);
    
        const offlineSigner = window.keplr.getOfflineSigner(chainId);
    
        // You can get the address/public keys by `getAccounts` method.
        // It can return the array of address/public key.
        // But, currently, Keplr extension manages only one address/public key pair.
        // XXX: This line is needed to set the sender address for SigningCosmosClient.
        const accounts = await offlineSigner.getAccounts();
    
        // Initialize the gaia api with the offline signer that is injected by Keplr extension.
        const cosmJS = new SigningCosmosClient(
            "https://lcd-cosmoshub.keplr.app",
            accounts[0].address,
            offlineSigner,
        );
    }
}
```

or track the document's ready state through the document event listener:

```javascript
async getKeplr(): Promise<Keplr | undefined> {
    if (window.keplr) {
        return window.keplr;
    }
    
    if (document.readyState === "complete") {
        return window.keplr;
    }
    
    return new Promise((resolve) => {
        const documentStateChange = (event: Event) => {
            if (
                event.target &&
                (event.target as Document).readyState === "complete"
            ) {
                resolve(window.keplr);
                document.removeEventListener("readystatechange", documentStateChange);
            }
        };
        
        document.addEventListener("readystatechange", documentStateChange);
    });
}
```

There may be multiple ways to achieve the same result, and no preferred method.

## Keplr-specific features

If you were able to connect Keplr with CosmJS, you may skip to the [Use Keplr with CosmJS](./cosmjs.md) section.

While Keplr supports an easy way to connect to CosmJS, there are additional functions specific to Keplr which provides additional features.

### Using with Typescript
**`window.d.ts`**
```javascript
import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {}
}
```

The `@keplr-wallet/types` package has the type definition related to Keplr.  
If you're using TypeScript, run `npm install --save-dev @keplr-wallet/types` or `yarn add -D @keplr-wallet/types` to install `@keplr-wallet/types`.  
Then, you can add the `@keplr-wallet/types` window to a global window object and register the Keplr related types.

> Usage of any other packages besides @keplr-wallet/types is not recommended.
> - Any other packages besides @keplr-wallet/types are actively being developed, backward compatibility is not in the scope of support.
> - Since there are active changes being made, documentation is not being updated to the most recent version of the package as of right now. Documentations would be updated as packages get stable.

### Enable Connection

```javascript
enable(chainIds: string | string[]): Promise<void>
```

The `window.keplr.enable(chainIds)` method requests the extension to be unlocked if it's currently locked. If the user hasn't given permission to the webpage, it will ask the user to give permission for the webpage to access Keplr.

`enable` method can receive one or more chain-id as an array. When the array of chain-id is passed, you can request permissions for all chains that have not yet been authorized at once.

If the user cancels the unlock or rejects the permission, an error will be thrown.

### Get Address / Public Key

```javascript
getKey(chainId: string): Promise<{
    // Name of the selected key store.
    name: string;
    algo: string;
    pubKey: Uint8Array;
    address: Uint8Array;
    bech32Address: string;
}>
```

If the webpage has permission and Keplr is unlocked, this function will return the address and public key in the following format:

```javascript
{
    // Name of the selected key store.
    name: string;
    algo: string;
    pubKey: Uint8Array;
    address: Uint8Array;
    bech32Address: string;
    isNanoLedger: boolean;
}
```

It also returns the nickname for the key store currently selected, which should allow the webpage to display the current key store selected to the user in a more convenient mane.  
`isNanoLedger` field in the return type is used to indicate whether the selected account is from the Ledger Nano. Because current Cosmos app in the Ledger Nano doesn't support the direct (protobuf) format msgs, this field can be used to select the amino or direct signer. [Ref](./cosmjs.md#types-of-offline-signers)

### Sign Amino

```javascript
signAmino(chainId: string, signer: string, signDoc: StdSignDoc): Promise<AminoSignResponse>
```

Similar to CosmJS `OfflineSigner`'s `signAmino`, but Keplr's `signAmino` takes the chain-id as a required parameter. Signs Amino-encoded `StdSignDoc`.

### Sign Direct / Protobuf

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

Similar to CosmJS `OfflineDirectSigner`'s `signDirect`, but Keplr's `signDirect` takes the chain-id as a required parameter. Signs Proto-encoded `StdSignDoc`.

### Request Transaction Broadcasting

```javascript
sendTx(
    chainId: string,
    tx: Uint8Array,
    mode: BroadcastMode
): Promise<Uint8Array>;
```

This function requests Keplr to delegates the broadcasting of the transaction to Keplr's LCD endpoints (rather than the webpage broadcasting the transaction).
This method returns the transaction hash if it succeeds to broadcast, if else the method will throw an error.
When Keplr broadcasts the transaction, Keplr will send the notification on the transaction's progress.

### Request Signature for Arbitrary Message

```javascript
signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
): Promise<StdSignature>;
verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
): Promise<boolean>;
```

This is an experimental implementation of [ADR-36](https://github.com/cosmos/cosmos-sdk/blob/master/docs/architecture/adr-036-arbitrary-signature.md). Use this feature at your own risk.  
  
It's main usage is to prove ownership of an account off-chain, requesting ADR-36 signature using the `signArbitrary` API.  
  
If requested sign doc with the `signAnimo` API with the ADR-36 that Keplr requires instead of using the `signArbitary` API, it would function as `signArbitary`  
- Only supports sign doc in the format of Amino. (in the case of protobuf, [ADR-36](https://github.com/cosmos/cosmos-sdk/blob/master/docs/architecture/adr-036-arbitrary-signature.md) requirements aren't fully specified for implementation)
- sign doc message should be single and the message type should be "sign/MsgSignData"
- sign doc "sign/MsgSignData" message should have "signer" and "data" as its value. "data" should be base64 encoded
- sign doc chain_id should be an empty string("")
- sign doc memo should be an empty string("")
- sign doc account_number should be "0"
- sign doc sequence should be "0"
- sign doc fee should be `{gas: "0", amount: []}`

When using the `signArbitrary` API, if the `data` parameter type is `string`, the signature page displays as plain text.  
  
Using `verifyArbitrary`, you can verify the results requested by `signArbitrary` API or `signAmino` API that has been requested with the ADR-36 spec standards.  
  
`verifyArbitrary` has been only implemented for simple usage. `verifyArbitrary` returns the result of the verification of the current selected account's sign doc. If the account is not the currently selected account, it would throw an error.  
  
It is recommended to use `verifyADR36Amino` function in the `@keplr-wallet/cosmos` package or your own implementation instead of using `verifyArbitrary` API.  

### Request Ethereum Signature
```javascript
signEthereum(
  chainId: string,
  signer: string, // Bech32 address, not hex
  data: string | Uint8Array,
  type: 'message' | 'transaction'
)
```

This is an experimental implementation of native Ethereum signing in Keplr to be used by dApps on EVM-compatible chains such as Evmos. 

It supports signing either [Personal Messages](https://eips.ethereum.org/EIPS/eip-191) or [Transactions](https://ethereum.org/en/developers/docs/transactions/), with plans to support [Typed Data](https://eips.ethereum.org/EIPS/eip-712) in the future.

Notes on Usage:
- The `signer` field must be a Bech32 address, not an Ethereum hex address
- The data should be either stringified JSON (for transactions) or a string message (for messages). Byte arrays are accepted as alternatives for either.
  
### Interaction Options

```javascript
export interface KeplrIntereactionOptions {
  readonly sign?: KeplrSignOptions;
}

export interface KeplrSignOptions {
  readonly preferNoSetFee?: boolean;
  readonly preferNoSetMemo?: boolean;
}
```
Keplr v0.8.11+ offers additional options to customize interactions between the frontend website and Keplr extension.

If `preferNoSetFee` is set to true, Keplr will prioritize the frontend-suggested fee rather than overriding the tx fee setting of the signing page.

If `preferNoSetMemo` is set to true, Keplr will not override the memo and set fix memo as the front-end set memo.

You can set the values as follows:
```javascript
window.keplr.defaultOptions = {
    sign: {
        preferNoSetFee: true,
        preferNoSetMemo: true,
    }
}
```

## Custom event

### Change Key Store Event

```javascript
keplr_keystorechange
```

When the user switches their key store/account after the webpage has received the information on the key store/account the key that the webpage is aware of may not match the selected key in Keplr which may cause issues in the interactions.

To prevent this from happening, when the key store/account is changed, Keplr emits a `keplr_keystorechange` event to the webpage's window. You can request the new key/account based on this event listener.

```javascript
window.addEventListener("keplr_keystorechange", () => {
    console.log("Key store in Keplr is changed. You may need to refetch the account info.")
})
```
