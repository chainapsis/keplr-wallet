import React, { FunctionComponent, useCallback } from "react";
import { View } from "react-native";
import { Address } from "../../components/address";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { WalletStatus } from "@keplr-wallet/stores";
import Clipboard from "expo-clipboard";
import { RectButton } from "react-native-gesture-handler";
import { Text } from "react-native-elements";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore, chainStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const copyAddress = useCallback(async () => {
    if (accountInfo.walletStatus === WalletStatus.Loaded) {
      await Clipboard.setString(accountInfo.bech32Address);
    }
  }, [accountInfo.walletStatus, accountInfo.bech32Address]);

  return (
    <View style={{ alignItems: "center" }}>
      <Text h3>
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
