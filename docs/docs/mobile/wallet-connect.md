import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import WcRequestExampleImage from "@site/static/img/guide/wc-request-example.png";
import ManageWcExampleImage from "@site/static/img/guide/manage-wc-example.png";

# Use with WalletConnect

Keplr Mobile supports WalletConnect, allowing seamless integration of dApps with the Keplr Wallet via QR codes. You can find an example at this [link](https://github.com/chainapsis/keplr-wallet/tree/master/packages/wc-client-example).

---

## Prerequisite

### Downloading Keplr Mobile

| Platform | Download Link |
|----------|----------------|
| iOS      | [App Store](https://apps.apple.com/us/app/keplr-wallet/id1567851089) |
| Android  | [Play Store](https://play.google.com/store/apps/details?id=com.chainapsis.keplr&hl=en) |

### Installing Required Packages

Before using WalletConnect with Keplr, install the necessary dependencies:

<Tabs>
  <TabItem value="npm" label="npm" default>
  
  ```sh
  npm install @walletconnect/sign-client @keplr-wallet/wc-client @keplr-wallet/wc-qrcode-modal
  ```

  </TabItem>
  <TabItem value="yarn" label="Yarn">
  
  ```sh
  yarn add @walletconnect/sign-client @keplr-wallet/wc-client @keplr-wallet/wc-qrcode-modal
  ```

  </TabItem>
</Tabs>

- `@keplr-wallet/wc-qrcode-modal` is a lightweight QR modal client designed for WalletConnect connections, offering customizable styling options. You can use this library for convenience or build your own custom scan UI. Please note that it depends on React.

---

## Initializing Client

To integrate with Keplr via WalletConnect, initialize the `KeplrWalletConnectV2` client as follows:

```typescript
import SignClient from "@walletconnect/sign-client";
import { KeplrWalletConnectV2 } from "@keplr-wallet/wc-client";
import { KeplrQRCodeModalV2 } from "@keplr-wallet/wc-qrcode-modal";
import { BroadcastMode, Keplr } from "@keplr-wallet/types";

let keplr: Keplr | undefined = undefined;
let promise: Promise<Keplr> | undefined = undefined;

type sendResponse = {
  tx_response: {
    txhash?: string;
    code?: number;
    raw_log?: string;
  };
};

async function sendTx(
  chainId: string,
  tx: Uint8Array,
  mode: BroadcastMode
): Promise<Uint8Array> {
  // ..Implement transaction sending logic..
}

export function getWCKeplr(): Promise<Keplr> {
  if (keplr) {
    return Promise.resolve(keplr);
  }

  const fn = async () => {
    const signClient = await SignClient.init({
      projectId: "YOUR_PROJECT_ID",
      metadata: {
        name: "Your dApp Name",
        description: "Your dApp Description",
        url: "https://your-dapp-url.com",
        icons: ["https://your-dapp-icon-url.com"]
      }
    });

    if (!signClient.session.getAll().length) {
      // Use the built-in modal client for convenience, or implement a custom scan UI
      const modal = new KeplrQRCodeModalV2(signClient);

      // You can pass the chain ids that you want to connect to the modal.
      const sessionProperties = await modal.connect(["cosmoshub-4"]);

      keplr = new KeplrWalletConnectV2(signClient, {
        sendTx,
        sessionProperties,
      });
    } else {
      keplr = new KeplrWalletConnectV2(signClient, {
        sendTx,
      });
    }

    return Promise.resolve(keplr);
  };

  if (!promise) {
    promise = fn();
  }

  return promise;
}
```

---

## User Interaction

Once the QR code appears, the user scans it using Keplr Mobile. This will prompt an approval request on their mobile screen.

<img
  src={WcRequestExampleImage}
  width="300"
  alt="Wallet Connect Request Modal Example"
/>

Users can manage their WalletConnect connections by navigating to:<br/>
`Keplr Mobile > Settings Tab > Security & Privacy > Manage WalletConnect`.

<img
  src={ManageWcExampleImage}
  width="300"
  alt="Manage Wallet Connect Example"
/>