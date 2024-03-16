---
title: Keplr API Usage
order: 3
---

## Keplr API Documentation

### Overview
While Keplr provides an effortless integration with CosmJS, it also has its exclusive features. This guide details those Keplr-specific methods and functionalities.

### Enable Connection

To connect and gain permission:
```javascript
enable(chainIds: string | string[]): Promise<void>
```

- If Keplr is locked, this prompts the user to unlock.
- If the webpage hasn't been granted permission, the user will be asked to provide it.
- Accepts one or multiple chain-ids.
- Errors will be thrown if the user cancels the unlock or denies permission.

### Retrieve Address & Public Key
Acquire the user's public key and address:

```javascript
getKey(chainId: string): Promise<{
    name: string;
    algo: string;
    pubKey: Uint8Array;
    address: Uint8Array;
    bech32Address: string;
    isNanoLedger: boolean;
}>
```

The function also returns the current key store's nickname, which useful for dApps to display to users. The `isNanoLedger` flag indicates if the account is linked to a Ledger Nano device.

Note that the current Ledger Cosmos app doesn't support the signDirect and only signAmino. The value returned from this field can be used to select signDirect or signAmino.
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

- **`preferNoSetFee`**:
  When you set `preferNoSetFee` to `true`, it signals to Keplr that the frontend website or application has a preference for the fee it has suggested, and Keplr should prioritize this fee when initiating a transaction. Without this flag or when set to `false`, Keplr might override the fee specified by the frontend, potentially using its internal mechanisms to determine the optimal fee.

- **Use case for `preferNoSetFee`**:
  - **User-Centric Experience**: A dapp might want to subsidize the transaction fee for the user and thus set a specific fee, making sure the user doesn't have to pay. In such cases, they wouldn't want the wallet (Keplr, in this case) to modify that fee.
  - **Optimal Fee Calculations**: A frontend might use its algorithms to calculate an optimal fee based on network congestion, aiming for a balance between fast confirmation times and cost. This calculated fee should not be overridden by the wallet.


If `preferNoSetMemo` is set to true, Keplr will not override the memo and set fix memo as the front-end set memo.

- **`preferNoSetMemo`**:
  The memo field in transactions is typically used for adding arbitrary comments or information. By setting `preferNoSetMemo` to `true`, you're instructing Keplr not to override the memo set by the frontend. This means whatever memo the frontend specifies will be retained in the transaction without Keplr attempting to modify it.

- **Use case for `preferNoSetMemo`**:
  - **Specific Instructions**: In some platforms, the memo could be used to relay specific instructions or identifiers. For instance, when sending tokens to an exchange, a memo might be used to specify which user account the tokens should be credited to. In such scenarios, it's crucial the memo isn't altered.
  - **Traceability**: Dapps might add specific identifiers in memos for tracing transactions back to particular actions/events within the app. An overridden memo could disrupt this traceability.


You can set the values as follows:
```javascript
window.keplr.defaultOptions = {
    sign: {
        preferNoSetFee: true,      // Indicating preference for frontend-specified fee
        preferNoSetMemo: true,    // Indicating preference for frontend-specified memo
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

