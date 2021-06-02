import React, { FunctionComponent, useCallback } from "react";

import { Text } from "react-native-elements";
import { View } from "react-native";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  alignItemsCenter,
  bcWhiteGrey,
  br3,
  bw1,
  caption1,
  flexDirectionRow,
  mr2,
  px2,
  sf,
} from "../../styles";
import { useNotification } from "../../components/notification";
import Clipboard from "expo-clipboard";
import { RectButton } from "react-native-gesture-handler";
import { WalletStatus } from "@keplr-wallet/stores";
import { useStore } from "../../stores";
import Icon from "react-native-vector-icons/Ionicons";

export interface AddressProps {
  maxCharacters: number;
  address: string;
  hasNotification?: boolean;
}

export const Address: FunctionComponent<AddressProps> = ({
  maxCharacters,
  address,
  hasNotification,
}) => {
  const notification = useNotification();
  const { accountStore, chainStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const copyAddress = useCallback(async () => {
    if (accountInfo.walletStatus === WalletStatus.Loaded) {
      await Clipboard.setString(accountInfo.bech32Address);
      if (hasNotification) {
        notification.push({
          placement: "top-center",
          type: "success",
          duration: 1,
          content: "copy address",
        });
      }
    }
  }, [accountInfo.walletStatus, accountInfo.bech32Address]);

  return (
    <RectButton rippleColor="#AAAAAA" onPress={copyAddress}>
      <View
        accessible
        style={sf([
          bw1,
          bcWhiteGrey,
          px2,
          br3,
          flexDirectionRow,
          alignItemsCenter,
        ])}
      >
        <Text style={sf([caption1, mr2])}>
          {Bech32Address.shortenAddress(address, maxCharacters)}
        </Text>
        <Icon name="copy-outline" size={10} />
      </View>
    </RectButton>
  );
};
