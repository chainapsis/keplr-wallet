import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use with SecretJS

## Prerequisites

### Detecting Keplr
Keplr API may be undefined immediately after the webpage loads. Ensure you follow the guidelines in the [How to detect Keplr](../getting-started/connect-to-keplr#how-to-detect-keplr) section before proceeding.

### Installing SecretJS Package
To install the `secretjs` package, use either npm or Yarn:

<Tabs>
  <TabItem value="npm" label="npm" default>
  
  ```bash
  npm install secretjs
  ```
  <a href="https://www.npmjs.com/package/secretjs" target="_blank">View on npm</a>
  </TabItem>

  <TabItem value="yarn" label="Yarn">
  
  ```bash
  yarn add secretjs
  ```
  <a href="https://classic.yarnpkg.com/en/package/secretjs" target="_blank">View on Yarn</a>
  </TabItem>
</Tabs>

---

## Connecting with SecretJS
The core usage of SecretJS is basically similar to using CosmJS. Refer to the [Use with CosmJS](./cosmjs) section if you need more details.

One key difference is that SecretJS utilizes Keplr's `EnigmaUtils` for encryption and decryption. This ensures that decrypted transaction messages are displayed to users in a human-readable format.

### Basic Setup
Before interacting with SecretJS, it is recommended to enable the Keplr:

```javascript
const CHAIN_ID = "secret-1";
await keplr.enable(CHAIN_ID);
```

### Initialize SecretJS
```javascript
const offlineSigner = keplr.getOfflineSigner(CHAIN_ID, signOptions);
const accounts = await offlineSigner.getAccounts();

// Retrieve EnigmaUtils for encryption/decryption.
const enigmaUtils = keplr.getEnigmaUtils(CHAIN_ID);

// Initialize the SecretJS client with Keplr's offline signer and EnigmaUtils.
const secretjs = new SecretNetworkClient({
  url,
  chainId: CHAIN_ID,
  wallet: offlineSigner,
  walletAddress: accounts[0].address,
  encryptionUtils: enigmaUtils,
});
```

:::note
Even when using SecretJS, you can leverage Keplr’s native API to customize signing options. For more details, refer to the [Sign Options](../guide/sign-a-message#sign-options) section.
:::

---

## Managing SNIP-20 Tokens in Keplr

### Adding a SNIP-20 Token
To request user permission to add a SNIP-20 token to Keplr's token list, use the following method:

```javascript
function suggestToken(
  chainId: string, 
  contractAddress: string
): Promise<void>
```
- If the user accepts, the token will be added to their Keplr wallet.
- If the user rejects, an error will be thrown.
- If the token is already registered, no action will be taken.

### Retrieving a SNIP-20 Viewing Key
To obtain the viewing key of a SNIP-20 token registered in Keplr, use:

```javascript
getSecret20ViewingKey(
  chainId: string,
  contractAddress: string
): Promise<string>;
```
- Returns the viewing key of the specified SNIP-20 token.
- Throws an error if the token is not registered in Keplr.
