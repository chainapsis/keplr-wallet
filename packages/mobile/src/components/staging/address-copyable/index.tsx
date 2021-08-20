import React, { FunctionComponent } from "react";
import { StyleSheet, Text, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";
import { RectButton } from "react-native-gesture-handler";
import { Bech32Address } from "@keplr-wallet/cosmos";
import Clipboard from "expo-clipboard";

export const AddressCopyable: FunctionComponent<{
  style?: ViewStyle;
  address: string;
  maxCharacters: number;
}> = ({ style: propStyle, address, maxCharacters }) => {
  const style = useStyle();

  return (
    <RectButton
      style={StyleSheet.flatten([
        style.flatten([
          "padding-x-12",
          "padding-y-2",
          "border-radius-12",
          "background-color-primary-10",
        ]),
        propStyle,
      ])}
      onPress={() => {
        Clipboard.setString(address);
      }}
      rippleColor={style.get("color-button-primary-outline-ripple").color}
      underlayColor={style.get("color-button-primary-outline-underlay").color}
      activeOpacity={1}
    >
      <Text style={style.flatten(["subtitle3", "color-primary-400"])}>
        {Bech32Address.shortenAddress(address, maxCharacters)}
      </Text>
    </RectButton>
  );
};
