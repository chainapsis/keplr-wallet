import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Transport from "@ledgerhq/hw-transport";
import { CosmosApp } from "@keplr-wallet/ledger-cosmos";
import { KeplrError } from "@keplr-wallet/router";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";
import { Buffer } from "buffer/";
import { StdSignDoc } from "@keplr-wallet/types";
import { serializeSignDoc } from "@keplr-wallet/cosmos";
import { signatureImport } from "secp256k1";

export const ErrModule = "ledger-sign";
export const ErrFailedInit = 1;
export const ErrCodeUnsupportedApp = 2;
export const ErrCodeDeviceLocked = 3;
export const ErrFailedGetPublicKey = 4;
export const ErrPublicKeyUnmatched = 5;
export const ErrFailedSign = 6;
export const ErrSignRejected = 7;

export const connectAndSignWithLedger = async (
  propApp: string,
  expectedPubKey: Uint8Array,
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  },
  signDoc: StdSignDoc
): Promise<Uint8Array> => {
  if (propApp !== "Cosmos" && propApp !== "Terra") {
    throw new KeplrError(
      ErrModule,
      ErrCodeUnsupportedApp,
      `Unsupported app: ${propApp}`
    );
  }

  let transport: Transport;
  try {
    transport = await TransportWebUSB.create();
  } catch (e) {
    throw new KeplrError(ErrModule, ErrFailedInit, "Failed to init transport");
  }
  let app = new CosmosApp(propApp, transport);

  try {
    const version = await app.getVersion();
    if (version.device_locked) {
      throw new KeplrError(ErrModule, ErrCodeDeviceLocked, "Device is locked");
    }
  } catch (e) {
    await transport.close();

    throw e;
  }

  let isAppOpened = false;
  try {
    const appInfo = await app.getAppInfo();
    if (appInfo.error_message === "No errors" && appInfo.app_name === propApp) {
      isAppOpened = true;
    }
  } catch (e) {
    // Ignore error
    console.log(e);
  }

  try {
    if (!isAppOpened) {
      await CosmosApp.openApp(transport, propApp);

      const maxRetry = 25;
      let i = 0;
      while (i < maxRetry) {
        // Reinstantiate the app with the new transport.
        // This is needed because the connection can be closed if app opened. (Maybe ledger's permission system handles dashboard, and each app differently.)
        transport = await TransportWebUSB.create();
        app = new CosmosApp(propApp, transport);

        const appInfo = await app.getAppInfo();
        if (
          appInfo.error_message === "No errors" &&
          appInfo.app_name === propApp
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

  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const res = await app.getPublicKey(
      bip44Path.account,
      bip44Path.change,
      bip44Path.addressIndex
    );
    if (res.error_message === "No errors") {
      const pubKey = new PubKeySecp256k1(res.compressed_pk);
      const expected = new PubKeySecp256k1(expectedPubKey);
      if (
        Buffer.from(pubKey.toBytes()).toString() !==
        Buffer.from(expected.toBytes()).toString()
      ) {
        throw new KeplrError(
          ErrModule,
          ErrPublicKeyUnmatched,
          "Public key unmatched"
        );
      }

      const signResponse = await app.sign(
        bip44Path.account,
        bip44Path.change,
        bip44Path.addressIndex,
        serializeSignDoc(signDoc)
      );
      if (signResponse.error_message === "No errors") {
        return signatureImport(signResponse.signature);
      } else {
        if (signResponse.error_message === "Transaction rejected") {
          throw new KeplrError(
            ErrModule,
            ErrSignRejected,
            signResponse.error_message
          );
        }

        throw new KeplrError(
          ErrModule,
          ErrFailedSign,
          signResponse.error_message
        );
      }
    } else {
      throw new KeplrError(ErrModule, ErrFailedGetPublicKey, res.error_message);
    }
  } finally {
    await transport.close();
  }
};
