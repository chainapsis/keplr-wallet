import React, { FunctionComponent, useCallback, useRef, useState } from "react";
import { RNCamera } from "react-native-camera";
import { useStyle } from "../../styles";
import { PageWithView } from "../../components/page";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSmartNavigation } from "../../navigation";
import { Button } from "../../components/button";
import { Share, View } from "react-native";
import { ChainSelectorModal } from "../../components/chain-selector";
import { registerModal } from "../../modals/base";
import { CardModal } from "../../modals/card";
import { AddressCopyable } from "../../components/address-copyable";
import QRCode from "react-native-qrcode-svg";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useFocusEffect } from "@react-navigation/native";
import { FullScreenCameraView } from "../../components/camera";

export const CameraScreen: FunctionComponent = observer(() => {
  const { chainStore, walletConnectStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const oncePerRead = useRef(false);

  useFocusEffect(
    useCallback(() => {
      oncePerRead.current = false;
    }, [])
  );

  const [isSelectChainModalOpen, setIsSelectChainModalOpen] = useState(false);
  const [isAddressQRCodeModalOpen, setIsAddressQRCodeModalOpen] = useState(
    false
  );
  const [
    showingAddressQRCodeChainId,
    setShowingAddressQRCodeChainId,
  ] = useState(chainStore.current.chainId);

  return (
    <PageWithView disableSafeArea={true}>
      <FullScreenCameraView
        type={RNCamera.Constants.Type.back}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        captureAudio={false}
        onBarCodeRead={async ({ data }) => {
          if (
            !oncePerRead.current &&
            !isSelectChainModalOpen &&
            !isAddressQRCodeModalOpen
          ) {
            oncePerRead.current = true;

            try {
              if (data.startsWith("wc:")) {
                await walletConnectStore.initClient(data);

                smartNavigation.navigateSmart("Home", {});
              } else {
                // Check that the data is bech32 address.
                // If this is not valid bech32 address, it will throw an error.
                Bech32Address.validate(data);

                const prefix = data.slice(0, data.indexOf("1"));
                const chainInfo = chainStore.chainInfosInUI.find(
                  (chainInfo) =>
                    chainInfo.bech32Config.bech32PrefixAccAddr === prefix
                );
                if (chainInfo) {
                  smartNavigation.pushSmart("Send", {
                    chainId: chainInfo.chainId,
                    recipient: data,
                  });
                }
              }
            } catch (e) {
              console.log(e);
              oncePerRead.current = false;
            }
          }
        }}
        containerBottom={
          <Button
            text="Show my QR code"
            mode="light"
            size="large"
            containerStyle={style.flatten([
              "margin-top-64",
              "border-radius-64",
              "opacity-90",
            ])}
            style={style.flatten(["padding-x-52"])}
            textStyle={style.flatten(["normal-case"])}
            onPress={() => {
              setIsSelectChainModalOpen(true);
            }}
          />
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
}> = registerModal(
  observer(({ chainId }) => {
    const { accountStore } = useStore();

    const account = accountStore.getAccount(chainId);

    const style = useStyle();

    return (
      <CardModal title="Scan QR code">
        <View style={style.flatten(["items-center"])}>
          <AddressCopyable address={account.bech32Address} maxCharacters={22} />
          <View style={style.flatten(["margin-y-32"])}>
            <QRCode size={200} value={account.bech32Address} />
          </View>
          <View style={style.flatten(["flex-row"])}>
            <Button
              containerStyle={style.flatten(["flex-1"])}
              text="Share Address"
              mode="light"
              size="large"
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
  }),
  {
    disableSafeArea: true,
  }
);
