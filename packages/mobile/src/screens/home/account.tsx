import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { Address } from "../../components/address";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { WalletStatus } from "@keplr-wallet/stores";

import { Text } from "react-native-elements";
import { alignItemsCenter, h4, mb2, sf } from "../../styles";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore, chainStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  return (
    <View style={alignItemsCenter}>
      <Text style={sf([h4, mb2])}>
        {accountInfo.walletStatus === WalletStatus.Loaded
          ? accountInfo.name
          : "Loading..."}
      </Text>
      <Address
        maxCharacters={22}
        address={
          accountInfo.walletStatus === WalletStatus.Loaded &&
          accountInfo.bech32Address
            ? accountInfo.bech32Address
            : "..."
        }
        hasNotification
      />
    </View>
  );
});
