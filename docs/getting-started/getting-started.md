---
title: Getting Started
order: 2
---

## Detecting Keplr

### 1. Detecting Keplr:

Keplr can be detected on a user's device using the `window.keplr` object. If it returns `undefined` after the document loads, it indicates Keplr is not installed. 

There are two methods to detect Keplr:

#### Using `window.onload`:
This method ensures that your code runs once the entire page (images or iframes), not just the DOM, is ready.

```javascript
window.onload = async () => {
    // Check if Keplr is installed
    if (!window.keplr) {
        alert("Please install Keplr extension");
    } else {
        // If Keplr is detected, you can proceed with further operations
        // ... more code
    }
}
```

#### Using Document's Ready State:

This method checks for Keplr once the DOM is completely loaded. It doesn't wait for other resources to finish, like images.

```javascript
document.addEventListener("readystatechange", event => {
    // Ensure the entire document is fully loaded
    if (document.readyState === "complete") {
        // Check if Keplr is installed
        if (window.keplr) {
            // If Keplr is detected, you can proceed with further operations
            // ... more code
        }
    }
});
```

While various methods can help in achieving this, there isn't one universally preferred method. Choose the one that best fits your application's architecture.

#### 2. Enabling and Unlocking Keplr Wallet:

Upon detecting Keplr, the next step is to enable it for the specific chain you are targeting. This process involves asking the user for permission if they haven't previously granted access to this website. Additionally, if the user's wallet is locked, Keplr will request the user to unlock it. Note that enabling/connection is done at a chain-by-chain basis.

The code snippet below demonstrates this:

```javascript
const chainId = "cosmoshub-4";

// Enabling Keplr before using it is recommended.
// This method will ask the user for permission to access the website.
// Also, it prompts the user to unlock their wallet if it's locked.
await window.keplr.enable(chainId);
```

Once enabled, you can initialize the offline signer which allows transactions to be signed offline for added security. Additionally, Keplr currently manages a single address/public key pair, which you can retrieve using the getAccounts method. This is necessary to set the sender's address for the SigningCosmosClient.

```javascript
const offlineSigner = window.keplr.getOfflineSigner(chainId);

// Retrieve the address/public key.
const accounts = await offlineSigner.getAccounts();

// Initialize the gaia API with the offline signer provided by Keplr.
const cosmJS = new SigningCosmosClient(
    "https://rest.cosmos.directory/cosmoshub",
    accounts[0].address,
    offlineSigner
);
```

Note: Ensure that the necessary JavaScript libraries and dependencies (like `SigningCosmosClient`) are imported and available in your script.

#### Initializing the Offline Signer:

The offlineSigner is a software component designed to handle the signing of transactions without requiring an active internet connection. It's called "offline" because the actual signing process doesn't rely on being online, as the signing interaction between the transaction and the private key happens within the user's computer through the wallet.

Once Keplr is enabled, you can get an instance of the offline signer associated with the specific chain.

```javascript
const offlineSigner = window.keplr.getOfflineSigner(chainId);
```

#### Fetching Public Keys and Addresses:

Keplr provides the getAccounts method to obtain the user's address and public keys. As of the current Keplr version, it manages only a single address/public key pair. This is crucial to note because the array returned will have only one element.

```javascript
const accounts = await offlineSigner.getAccounts();
```

#### Initializing the Cosmos Hub (Gaia) API with the Offline Signer:

With the offline signer and the user's account information, you can initialize the Gaia API (or any other supported Cosmos API). This allows you to perform various operations on the chain, such as sending transactions.

```javascript
const cosmJS = new SigningCosmosClient(
    "https://lcd-cosmoshub.keplr.app",
    accounts[0].address,
    offlineSigner,
);
```

Note: This guide assumes that you're working with the cosmoshub-4 chain and the related Gaia API endpoint. Adjust the chain ID and endpoints based on your specific requirements.

#### Integrating with TypeScript: Enhancing Keplr Type Support

For developers leveraging TypeScript, Keplr offers a robust type definition through the @keplr-wallet/types package, ensuring accurate type checking and improved IDE support. This package is essential to facilitate better TypeScript integration.

**Step-by-Step Integration:**

1. Installing the Types Package:

To get started, you first need to install the type definitions package. Depending on your package manager of choice, you can use:
```javascript
npm install --save-dev @keplr-wallet/types
```
or
```javascript
yarn add -D @keplr-wallet/types
```

2. Extending the Global Window Object:
To use Keplr's types seamlessly, extend the global Window object. Create a window.d.ts declaration file and add the following:
```javascript
import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
    interface Window extends KeplrWindow {}
}
```
This ensures that TypeScript recognizes the Keplr specific methods and properties attached to the window object, offering a more integrated development experience.

Note: Rely exclusively on @keplr-wallet/types for Keplr's type definitions. This is the only official and recommended type package.

Other packages related to Keplr is actively used within Keplr Wallet's core logic. However, active changes may be made, backward compatibility is not guaranteed, and we do not provide documentation due to lack of resources at this time. While it is a robust library, use it at your own discretion.