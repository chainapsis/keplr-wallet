import React, { FunctionComponent, useCallback, useState } from "react";
import { useStyle } from "styles/index";
import { PageWithView } from "components/page";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import { useSmartNavigation } from "navigation/smart-navigation";
import { Button } from "components/button";
import { Share, StyleSheet, View, ViewStyle } from "react-native";
import { ChainSelectorModal } from "components/chain-selector";
import { CardModal } from "modals/card";
import { AddressCopyable } from "components/address-copyable";
import QRCode from "react-native-qrcode-svg";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { FullScreenCameraView } from "components/camera";

import {
  IRecipientConfig,
  IRecipientConfigWithICNS,
} from "@keplr-wallet/hooks";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { CameraType } from "expo-camera/src/Camera.types";
import { BarCodeScanner } from "expo-barcode-scanner";
import { CHAIN_ID_DORADO } from "../../config";
import Toast from "react-native-toast-message";

export const CameraScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          showMyQRButton?: boolean;
          recipientConfig?: IRecipientConfig | IRecipientConfigWithICNS;
        }
      >,
      string
    >
  >();

  const showQRButton = route.params.showMyQRButton ? true : false;

  const { chainStore, walletConnectStore } = useStore();

  const navigation = useNavigation();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const [isLoading, setIsLoading] = useState(false);
  // To prevent the reading while changing to other screen after processing the result.
  // Expectedly, screen should be moved to other after processing the result.
  const [isCompleted, setIsCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // If the other screen is pushed according to the qr code data,
      // the `isCompleted` state would remain as true because the screen in the stack is not unmounted.
      // So, we should reset the `isComplete` state whenever getting focused.
      setIsCompleted(false);
    }, [])
  );

  const [isSelectChainModalOpen, setIsSelectChainModalOpen] = useState(false);
  const [isAddressQRCodeModalOpen, setIsAddressQRCodeModalOpen] =
    useState(false);
  const [showingAddressQRCodeChainId, setShowingAddressQRCodeChainId] =
    useState(chainStore.current.chainId);

  return (
    <PageWithView disableSafeArea={true} backgroundMode={null}>
      <FullScreenCameraView
        type={CameraType.back}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
        isLoading={isLoading}
        onBarCodeScanned={async ({ data }) => {
          if (!isLoading && !isCompleted) {
            setIsLoading(true);

            try {
              if (data.startsWith("wc:")) {
                await walletConnectStore.initClient(data);

                smartNavigation.navigateSmart("Home", {});
              } else {
                const isBech32Address = (() => {
                  try {
                    // Check that the data is bech32 address.
                    // If this is not valid bech32 address, it will throw an error.
                    Bech32Address.validate(data);
                  } catch {
                    return false;
                  }
                  return true;
                })();

                if (isBech32Address) {
                  const prefix = data.slice(0, data.indexOf("1"));
                  let chainId: string | undefined;
                  if (
                    prefix.toLowerCase() === "fetch" &&
                    chainStore.current.chainId === CHAIN_ID_DORADO
                  ) {
                    chainId = chainStore.current.chainId;
                  } else {
                    const chainInfo = chainStore.chainInfosInUI.find(
                      (chainInfo) =>
                        chainInfo.bech32Config.bech32PrefixAccAddr === prefix
                    );
                    chainId = chainInfo?.chainId;
                  }

                  if (chainId) {
                    if (route.params.recipientConfig) {
                      route.params.recipientConfig.setRawRecipient(data);
                      navigation.goBack();
                    } else {
                      smartNavigation.pushSmart("SendNew", {
                        chainId: chainId,
                        recipient: data,
                      });
                    }
                  } else {
                    smartNavigation.navigateSmart("Home", {});
                  }
                } else {
                  navigation.goBack();
                  Toast.show({
                    type: "error",
                    text1: "Please scan valid QR",
                  });
                }
              }

              setIsCompleted(true);
            } catch (e) {
              console.log(e);
            } finally {
              setIsLoading(false);
            }
          }
        }}
        containerBottom={
          showQRButton ? (
            <Button
              text="Show my QR code"
              mode="light"
              size="large"
              containerStyle={
                style.flatten([
                  "margin-top-64",
                  "border-radius-64",
                  "opacity-90",
                ]) as ViewStyle
              }
              style={style.flatten(["padding-x-52"]) as ViewStyle}
              onPress={() => {
                setIsSelectChainModalOpen(true);
              }}
            />
          ) : undefined
        }
      />
      <ChainSelectorModal
        isOpen={isSelectChainModalOpen}
        close={() => setIsSelectChainModalOpen(false)}
        chainIds={chainStore.chainInfosInUI.map(
          (chainInfo) => chainInfo.chainId
        )}
        onSelectChain={(chainId) => {
          setShowingAddressQRCodeChainId(chainId);
          setIsAddressQRCodeModalOpen(true);
          setIsSelectChainModalOpen(false);
        }}
      />
      <AddressQRCodeModal
        isOpen={isAddressQRCodeModalOpen}
        close={() => setIsAddressQRCodeModalOpen(false)}
        chainId={showingAddressQRCodeChainId}
      />
    </PageWithView>
  );
});

export const AddressQRCodeModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  chainId: string;
}> = observer(({ chainId, isOpen }) => {
  const { accountStore } = useStore();

  const account = accountStore.getAccount(chainId);

  const style = useStyle();

  if (!isOpen) {
    return null;
  }

  return (
    <CardModal isOpen={isOpen} title="Scan QR code">
      <View style={style.flatten(["items-center"])}>
        <AddressCopyable address={account.bech32Address} maxCharacters={22} />
        <View style={style.flatten(["margin-y-32"]) as ViewStyle}>
          {account.bech32Address ? (
            <View
              style={
                style.flatten([
                  "padding-8",
                  "dark:background-color-white",
                ]) as ViewStyle
              }
            >
              <QRCode size={200} value={account.bech32Address} />
            </View>
          ) : (
            <View
              style={StyleSheet.flatten([
                {
                  width: 200,
                  height: 200,
                },
                style.flatten(["background-color-gray-400"]),
              ])}
            />
          )}
        </View>
        <View style={style.flatten(["flex-row"])}>
          <Button
            containerStyle={style.flatten(["flex-1"])}
            text="Share Address"
            mode="light"
            size="large"
            loading={account.bech32Address === ""}
            onPress={() => {
              Share.share({
                message: account.bech32Address,
              }).catch((e) => {
                console.log(e);
              });
            }}
          />
        </View>
      </View>
    </CardModal>
  );
});
