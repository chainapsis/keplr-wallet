---
title: Use with CosmJs
order: 2
---

## How to detect Keplr
Keplr API may be undefined right after the webpage shown.
Please check the [How to detect Keplr](./README.md#how-to-detect-keplr) first before reading this section.

## Connecting with CosmJS

CosmJS link: [https://www.npmjs.com/package/@cosmjs/launchpad](https://www.npmjs.com/package/@cosmjs/launchpad), [https://www.npmjs.com/package/@cosmjs/stargate](https://www.npmjs.com/package/@cosmjs/stargate)

You can connect Keplr to CosmJS using the `OfflineSigner`.

```javascript
// Enabling before using the Keplr is recommended.
// This method will ask the user whether or not to allow access if they haven't visited this website.
// Also, it will request user to unlock the wallet if the wallet is locked.
await window.keplr.enable(chainId);

const offlineSigner = window.getOfflineSigner(chainId);

// You can get the address/public keys by `getAccounts` method.
// It can return the array of address/public key.
// But, currently, Keplr extension manages only one address/public key pair.
// XXX: This line is needed to set the sender address for SigningCosmosClient.
const accounts = await offlineSigner.getAccounts();

// Initialize the gaia api with the offline signer that is injected by Keplr extension.
const cosmJS = new SigningCosmosClient(
    "https://lcd-cosmoshub.keplr.app/rest",
    accounts[0].address,
    offlineSigner,
);
```

To get the `OfflineSigner`, you may use `keplr.getOfflineSigner(chainId)` or `window.getOfflineSigner(chainId)`. (`window.getOfflineSigner` is an alias that runs `keplr.getOfflineSigner` and returns the value)

The `window.keplr.enable(chainId)` method will request the user to unlock their Keplr extension if it's locked. If the user has not given permission to connect their extension to the website, it will first ask to connect the website.

If the user cancels the unlock or rejects the permission to connect, an error will be thrown.

If the extension is already unlocked and the website has permission to connect, no action will happen and resolve.

`window.keplr.enable(chainId)` is not mandatory. Even if the method wasn't called, if an API that requests access to Keplr is called the flow above will automatically run. However, it is recommended that `window.keplr.enable(chainId)` is first run.

## Use with Stargate

Keplr's `OfflineSigner` implements the `OfflineDirectSigner` interface. Use `SigningStargateClient` with Keplr's `OfflineSigner`, and Keplr will sign the transaction in Proto sign doc format.

### Example
Refer to the [keplr-example](https://github.com/chainapsis/keplr-example/blob/master/src/main.js) repository for example code on how to integrate Keplr with CosmJS.

### Interaction Options
You can use Keplr native API’s to set interaction options even when using CosmJS. Please refer to [this section](./#interaction-options).

### Adding a custom blockchain to Keplr
If Keplr doesn't natively support your blockchain within the extension, please refer to the [Suggest chain](./suggest-chain) section.
