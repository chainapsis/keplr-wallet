import React, { FunctionComponent, useState } from "react";
import { FullScreenCameraView } from "../../../components/camera";
import { RNCamera } from "react-native-camera";
import { useSmartNavigation } from "../../../navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  AddressBookConfigMap,
  AddressBookData,
  RegisterConfig,
} from "@keplr-wallet/hooks";
import {
  parseQRCodeDataForImportFromMobile,
  importFromMobile,
  registerExportedAddressBooks,
  registerExportedKeyRingDatas,
} from "../../../utils/import-from-mobile";
import { AsyncKVStore } from "../../../common";

export * from "./intro";
export * from "./set-password";

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
  addressBooks: { [chainId: string]: AddressBookData[] | undefined };
}

export const ImportFromExtensionScreen: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore } = useStore();

  const [addressBookConfigMap] = useState(
    () => new AddressBookConfigMap(new AsyncKVStore("address_book"), chainStore)
  );

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
      const sharedData = parseQRCodeDataForImportFromMobile(data);

      setIsLoading(true);

      const imported = await importFromMobile(
        sharedData,
        chainStore.chainInfosInUI.map((chainInfo) => chainInfo.chainId)
      );

      if (keyRingStore.multiKeyStoreInfo.length > 0) {
        // If already has accounts,
        await registerExportedKeyRingDatas(
          keyRingStore,
          route.params.registerConfig,
          imported.KeyRingDatas,
          ""
        );

        await registerExportedAddressBooks(
          addressBookConfigMap,
          imported.addressBooks
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
        // If there is no account,
        // should set the password.
        smartNavigation.replaceSmart(
          "Register.ImportFromExtension.SetPassword",
          {
            registerConfig: route.params.registerConfig,
            exportKeyRingDatas: imported.KeyRingDatas,
            addressBooks: imported.addressBooks,
          }
        );
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
