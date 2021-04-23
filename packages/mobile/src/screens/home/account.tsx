import React, { FunctionComponent, useCallback } from "react";
import { View } from "react-native";
import { Address } from "../../components/address";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { WalletStatus } from "@keplr-wallet/stores";
import Clipboard from "expo-clipboard";
import { RectButton } from "react-native-gesture-handler";
import { Text } from "react-native-elements";
import { useNotification } from "../../components/notification";
import { alignItemsCenter, h4, mb2, sf } from "../../styles";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore, chainStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const notification = useNotification();

  const copyAddress = useCallback(async () => {
    if (accountInfo.walletStatus === WalletStatus.Loaded) {
      await Clipboard.setString(accountInfo.bech32Address);
      notification.push({
        placement: "top-center",
        type: "success",
        duration: 1,
        content: "copy address",
      });
    }
  }, [accountInfo.walletStatus, accountInfo.bech32Address]);

  return (
    <View style={alignItemsCenter}>
      <Text style={sf([h4, mb2])}>
        {accountInfo.walletStatus === WalletStatus.Loaded
          ? accountInfo.name
          : "Loading..."}
      </Text>
      <RectButton rippleColor="#AAAAAA" onPress={copyAddress}>
        <Address
          maxCharacters={22}
          address={
            accountInfo.walletStatus === WalletStatus.Loaded &&
            accountInfo.bech32Address
              ? accountInfo.bech32Address
              : "..."
          }
        />
      </RectButton>
    </View>
  );
});
