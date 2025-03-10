import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';

# Use with CosmJS

## Prerequisites

### Detecting Keplr
Keplr API may be undefined immediately after the webpage loads. Ensure you follow the guidelines in the [How to detect Keplr](../getting-started/connect-to-keplr#how-to-detect-keplr) section before proceeding.

### Installing CosmJS Packages
Select the appropriate CosmJS package based on the Cosmos SDK version:

<Tabs>
  <TabItem value="npm" label="npm" default>

  | Package | Cosmos SDK Version |
  |---------|--------------------|
  | [@cosmjs/launchpad](https://www.npmjs.com/package/@cosmjs/launchpad) | 0.37 (cosmoshub-3), 0.38, 0.39 (Launchpad) |
  | [@cosmjs/stargate](https://www.npmjs.com/package/@cosmjs/stargate) | 0.40+ (Stargate) |

  </TabItem>

  <TabItem value="yarn" label="Yarn">

  | Package | Cosmos SDK Version |
  |---------|--------------------|
  | [@cosmjs/launchpad](https://classic.yarnpkg.com/en/package/@cosmjs/launchpad) | 0.37 (cosmoshub-3), 0.38, 0.39 (Launchpad) |
  | [@cosmjs/stargate](https://classic.yarnpkg.com/en/package/@cosmjs/cosmwasm-stargate) | 0.40+ (Stargate) |

  </TabItem>
</Tabs>

---

## Connecting Keplr with CosmJS

Keplr can be integrated with CosmJS using the `OfflineSigner`.

```javascript
// It is recommended to enable Keplr before using OfflineSigner.
// If the user hasn't visited this website before, this method will prompt the user to allow access.
// Additionally, it will request the user to unlock the wallet if it is locked.
await keplr.enable(chainId);

const offlineSigner = window.getOfflineSigner(chainId, signOptions);

// You can obtain the address/public keys using the `getAccounts` method.
// It returns an array of address/public key pairs.
// However, currently, the Keplr extension manages only one address/public key pair.
// Note: This line is necessary to set the sender address for the SigningCosmosClient.
const accounts = await offlineSigner.getAccounts();

// Initialize the Gaia API with the offline signer provided by the Keplr extension.
const cosmJS = new SigningCosmosClient(
    "https://lcd-cosmoshub.keplr.app/rest",
    accounts[0].address,
    offlineSigner,
);
```

### Key Considerations
- `keplr.enable(chainId)`: Requests the user to unlock Keplr and grant website access.
- If the user rejects or cancels, an error is thrown.
- If Keplr is already unlocked and authorized, the method resolves without prompting the user.
- Even without calling `keplr.enable(chainId)`, any Keplr API request will trigger the same flow automatically. However, it's recommended to call it explicitly.

---

## Types of Offline Signers in CosmJS

Keplr supports both types of offline signers described below. If you're leveraging Keplr in `window` directly, either `keplr.getOfflineSigner(chainId)` or `window.getOfflineSigner(chainId)` is available.

1. **OfflineAminoSigner**: Used for signing `SignDoc` serialized with Amino
    ```typescript
    interface OfflineAminoSigner {
      /**
       * Get AccountData array from wallet. Rejects if not enabled.
       */
      readonly getAccounts: () => Promise<readonly AccountData[]>;
      /**
       * Request signature from whichever key corresponds to provided bech32-encoded address. Rejects if not enabled.
       *
       * The signer implementation may offer the user the ability to override parts of the signDoc. It must
       * return the doc that was signed in the response.
       *
       * @param signerAddress The address of the account that should sign the transaction
       * @param signDoc The content that should be signed
       */
      readonly signAmino: (
        signerAddress: string,
        signDoc: StdSignDoc
      ) => Promise<AminoSignResponse>;
    }
    ```
2. **OfflineDirectSigner**: Used for signing Protobuf-encoded `SignDoc`
    ```typescript
    interface OfflineDirectSigner {
      readonly getAccounts: () => Promise<readonly AccountData[]>;
      readonly signDirect: (
        signerAddress: string,
        signDoc: SignDoc
      ) => Promise<DirectSignResponse>;
    }
    ```
## Using signers

### Choosing the Right Signer
To get the basic information about the signing modes, refer to the [Signing Modes](../guide/sign-a-message#signing-modes-in-the-cosmos-sdk) section.

### Getting Both Signers

It returns `signAmino` and `signDirect` methods for both Stargate and Launchpad.

```typescript
getOfflineSigner(
  chainId: string,
  signOptions?: KeplrSignOptions
): OfflineAminoSigner & OfflineDirectSigner;
```

### Forcing Amino Signers
To enforce Amino signing, use:
```typescript
getOfflineSignerOnlyAmino(
  chainId: string,
  signOptions?: KeplrSignOptions
): OfflineAminoSigner;
```
This ensures that all CosmJS requests compatible with Amino will be signed in Amino format.

### Auto-selecting a Signer
To automatically choose the appropriate signer based on the account type:
```typescript
getOfflineSignerAuto(
  chainId: string,
  signOptions?: KeplrSignOptions
): Promise<OfflineAminoSigner | OfflineDirectSigner>;
```

- Returns an **Amino signer** if the account is Ledger-based.
- Returns a **Protobuf-compatible signer** if the account is mnemonic/private key-based.
- If account type changes (e.g., a user switches wallets), update the signer using this API when the [`keplr_keystorechange`](../guide/custom-event#key-store-change) event is triggered.

### KeplrSignOptions
Use the additional signing options for special needs.
  - `preferNoSetFee`: If true, the fee configured by the dApp will be prioritized over the fee set by the user.
  - `preferNoSetMemo`: If true, the memo will be set by the dApp and the user will not be able to modify it.
  - `disableBalanceCheck`: If true, the transaction won't be blocked even if the balance is insufficient.

---

## Using Keplr with Stargate

Keplr's `OfflineSigner` implements the `OfflineDirectSigner` interface, allowing transactions to be signed in Protobuf format using `SigningStargateClient`.

#### Interaction Options
Even when using CosmJS, you can configure Keplr's interaction options. See [signOptions](../guide/sign-a-message#sign-options) for details.

#### Adding a Custom Blockchain
If your blockchain is not natively supported in Keplr, follow the instructions in the [Suggest Chain](../guide/suggest-chain) section to add it manually.
