import React, { FunctionComponent, useCallback, useRef, useState } from "react";
import { RNCamera } from "react-native-camera";
import { useStyle } from "../../styles";
import { PageWithView } from "../../components/page";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSmartNavigation } from "../../navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/button";
import Svg, { Path } from "react-native-svg";
import { Share, View } from "react-native";
import { ChainSelectorModal } from "../../components/chain-selector";
import { registerModal } from "../../modals/base";
import { CardModal } from "../../modals/card";
import { AddressCopyable } from "../../components/address-copyable";
import QRCode from "react-native-qrcode-svg";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";

export const CameraScreen: FunctionComponent = observer(() => {
  const { chainStore, walletConnectStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const oncePerRead = useRef(false);

  const isFocused = useIsFocused();

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
      {isFocused ? (
        <RNCamera
          style={style.flatten(["absolute-fill"])}
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
                  const chainInfo = chainStore.chainInfos.find(
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
        />
      ) : null}
      <ChainSelectorModal
        isOpen={isSelectChainModalOpen}
        close={() => setIsSelectChainModalOpen(false)}
        chainIds={chainStore.chainInfos.map((chainInfo) => chainInfo.chainId)}
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
      <SafeAreaView
        style={style.flatten([
          "absolute-fill",
          "items-center",
          "justify-center",
        ])}
      >
        <View style={style.flatten(["margin-bottom-64"])}>
          <Svg width="217" height="217" fill="none" viewBox="0 0 217 217">
            <Path
              stroke={style.get("color-primary-300").color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="6"
              d="M34 3H3v31M3 183v31h31M183 3h31v31M214 183v31h-31"
            />
          </Svg>
        </View>
        <Button
          text="Show My QRCode"
          mode="light"
          size="large"
          containerStyle={style.flatten(["border-radius-64", "opacity-90"])}
          style={style.flatten(["padding-x-52"])}
          textStyle={style.flatten(["normal-case"])}
          onPress={() => {
            setIsSelectChainModalOpen(true);
          }}
        />
      </SafeAreaView>
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
      <CardModal title="Scan QRcode">
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
