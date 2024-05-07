import Transport from "@ledgerhq/hw-transport";
import { CosmosApp, getAppInfo } from "@keplr-wallet/ledger-cosmos";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";

export const LedgerUtils = {
  tryAppOpen: async (transport: Transport, app: string): Promise<Transport> => {
    let isAppOpened = false;
    try {
      const appInfo = await getAppInfo(transport);
      if (appInfo.error_message === "No errors" && appInfo.app_name === app) {
        isAppOpened = true;
      }
    } catch (e) {
      // Ignore error
      console.log(e);
    }

    try {
      if (!isAppOpened) {
        await CosmosApp.openApp(transport, app);

        const maxRetry = 25;
        let i = 0;
        while (i < maxRetry) {
          // Reinstantiate the app with the new transport.
          // This is needed because the connection can be closed if app opened. (Maybe ledger's permission system handles dashboard, and each app differently.)
          if (transport instanceof TransportWebHID) {
            transport = await TransportWebHID.create();
          } else {
            transport = await TransportWebUSB.create();
          }

          const appInfo = await getAppInfo(transport);
          if (
            appInfo.error_message === "No errors" &&
            appInfo.app_name === app
          ) {
            break;
          }

          i++;
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    } catch {
      // Ignore error
    }

    return transport;
  },
};
