import React, { FunctionComponent, useState } from "react";
import { FullScreenCameraView } from "../../../components/camera";
import { RNCamera } from "react-native-camera";
import { useSmartNavigation } from "../../../navigation";
import WalletConnect from "@walletconnect/client";
import AES, { Counter } from "aes-js";
import { Buffer } from "buffer/";
import { ExportKeyRingData } from "@keplr-wallet/background";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { registerExportedKeyRingDatas } from "./utils";

export interface QRCodeSharedData {
  // The uri for the wallet connect
  wcURI: string;
  // The temporary password for encrypt/descrypt the key datas.
  // This must not be shared the other than the extension and mobile.
  sharedPassword: string;
}

export interface WCExportKeyRingDatasResponse {
  encrypted: {
    // ExportKeyRingData[]
    // Json format and hex encoded
    ciphertext: string;
    // Hex encoded
    iv: string;
  };
}

export const ImportFromExtensionScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
        }
      >,
      string
    >
  >();

  const smartNavigation = useSmartNavigation();

  const [isLoading, setIsLoading] = useState(false);

  const onBarCodeRead = async ({ data }: { data: string }) => {
    if (isLoading) {
      return;
    }

    try {
      const sharedData = JSON.parse(data) as Partial<QRCodeSharedData>;
      if (!sharedData.wcURI || !sharedData.sharedPassword) {
        throw new Error("Invalid qr code");
      }

      setIsLoading(true);

      const connector = new WalletConnect({
        uri: sharedData.wcURI,
      });

      if (connector.connected) {
        await connector.killSession();
      }

      await new Promise<void>((resolve, reject) => {
        connector.on("session_request", (error) => {
          if (error) {
            reject(error);
          } else {
            connector.approveSession({ accounts: [], chainId: 77777 });

            resolve();
          }
        });
      });

      const result = (
        await connector.sendCustomRequest({
          id: Math.floor(Math.random() * 100000),
          method: "keplr_request_export_keyring_datas_wallet_connect_v1",
        })
      )[0] as WCExportKeyRingDatasResponse;

      const counter = new Counter(0);
      counter.setBytes(Buffer.from(result.encrypted.iv, "hex"));
      const aesCtr = new AES.ModeOfOperation.ctr(
        Buffer.from(sharedData.sharedPassword, "hex"),
        counter
      );

      const decrypted = aesCtr.decrypt(
        Buffer.from(result.encrypted.ciphertext, "hex")
      );

      const exportedKeyRingDatas = JSON.parse(
        Buffer.from(decrypted).toString()
      ) as ExportKeyRingData[];

      if (keyRingStore.multiKeyStoreInfo.length > 0) {
        // If already has accounts,
        await registerExportedKeyRingDatas(
          route.params.registerConfig,
          exportedKeyRingDatas,
          ""
        );

        smartNavigation.reset({
          index: 0,
          routes: [
            {
              name: "Register.End",
              params: {},
            },
          ],
        });
      } else {
        // TODO
      }
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      smartNavigation.goBack();
    }
  };

  return (
    <FullScreenCameraView
      type={RNCamera.Constants.Type.back}
      barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
      captureAudio={false}
      onBarCodeRead={onBarCodeRead}
      isLoading={isLoading}
    />
  );
});
