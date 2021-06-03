import React, { FunctionComponent, useState } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { View } from "react-native";
import { Dec } from "@keplr-wallet/unit";
import { useNavigation } from "@react-navigation/native";
import { WalletStatus } from "@keplr-wallet/stores";
import { FlexButton, FlexWhiteButton } from "../..//components/buttons";
import { Address } from "../../components/address";
import {
  alignItemsCenter,
  bgcWhiteWithoutOpacity,
  br1,
  flexDirectionRow,
  h3,
  ml3,
  mt4,
  my4,
  p4,
  sf,
} from "../../styles";
import Modal from "react-native-modal";
import { Text } from "react-native-elements";
import { FlexButtonWithHoc } from "../../modals/common";
import QRCode from "react-native-qrcode-svg";

const QRCodeView: FunctionComponent<{ onCloseModal: () => void }> = observer(
  ({ onCloseModal }) => {
    const { accountStore, chainStore } = useStore();
    const accountInfo = accountStore.getAccount(chainStore.current.chainId);

    const address =
      accountInfo.walletStatus === WalletStatus.Loaded &&
      accountInfo.bech32Address
        ? accountInfo.bech32Address
        : "...";

    return (
      <View style={sf([br1, bgcWhiteWithoutOpacity, p4])}>
        <View style={alignItemsCenter}>
          <Text style={h3}>Scan QR Code</Text>
          <View style={my4}>
            <QRCode size={178} value={address} />
          </View>
          <Address maxCharacters={22} address={address} />
        </View>
        <View style={sf([{ height: 50 }, mt4])}>
          <FlexButtonWithHoc onPress={onCloseModal} title="Done" />
        </View>
      </View>
    );
  }
);

export const TxButtonView: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore } = useStore();

  const navigation = useNavigation();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const queryBalances = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const hasAssets =
    queryBalances.balances.find((bal) => bal.balance.toDec().gt(new Dec(0))) !==
    undefined;

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  return (
    <View style={flexDirectionRow}>
      <Modal
        isVisible={isQRModalOpen}
        onBackdropPress={() => {
          setIsQRModalOpen(false);
        }}
      >
        <QRCodeView
          onCloseModal={() => {
            setIsQRModalOpen(false);
          }}
        />
      </Modal>
      <FlexWhiteButton
        title="Deposit"
        onPress={() => {
          setIsQRModalOpen(true);
        }}
      />
      {/*
        "Disabled" property in button tag will block the mouse enter/leave events.
        So, tooltip will not work as expected.
        To solve this problem, don't add "disabled" property to button tag and just add "disabled" class manually.
       */}
      <FlexButton
        containerStyle={[ml3]}
        title="Send"
        disabled={!hasAssets}
        loading={accountInfo.isSendingMsg === "send"}
        onPress={() => {
          if (hasAssets) {
            navigation.navigate("Send", { initAddress: "", initMemo: "" });
          }
        }}
      />
    </View>
  );
});
