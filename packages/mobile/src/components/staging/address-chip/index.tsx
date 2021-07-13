import React, { FunctionComponent } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";
import { RectButton } from "react-native-gesture-handler";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { CopyIcon } from "../icon";
import Clipboard from "expo-clipboard";

export const AddressChip: FunctionComponent<{
  style?: ViewStyle;
  address: string;
  maxCharacters: number;
}> = ({ style: propStyle, address, maxCharacters }) => {
  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "height-address-chip",
          "overflow-hidden",
          "border-width-1",
          "border-color-border-white",
          "border-radius-32",
        ]),
        propStyle,
      ])}
    >
      <RectButton
        style={style.flatten(["padding-x-8", "padding-y-1"])}
        onPress={() => {
          Clipboard.setString(address);
        }}
      >
        <View style={style.flatten(["flex", "flex-row", "items-center"])}>
          <Text
            style={style.flatten([
              "text-caption2",
              "color-text-black-medium",
              "margin-right-8",
            ])}
          >
            {Bech32Address.shortenAddress(address, maxCharacters)}
          </Text>
          <CopyIcon
            size={10}
            color={style.get("color-text-black-medium").color}
          />
        </View>
      </RectButton>
    </View>
  );
};
