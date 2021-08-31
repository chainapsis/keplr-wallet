import React, { FunctionComponent } from "react";
import { StyleSheet, Text, ViewStyle, View } from "react-native";
import { useStyle } from "../../../styles";
import { Bech32Address } from "@keplr-wallet/cosmos";
import Clipboard from "expo-clipboard";
import { RectButton } from "../rect-button";
import { CopyIcon, CheckIcon } from "../icon";
import { useSimpleTimer } from "../../../hooks/use-simple-timer";

export const AddressCopyable: FunctionComponent<{
  style?: ViewStyle;
  address: string;
  maxCharacters: number;
}> = ({ style: propStyle, address, maxCharacters }) => {
  const style = useStyle();
  const { isTimedOut, setTimer } = useSimpleTimer();

  return (
    <RectButton
      style={StyleSheet.flatten([
        style.flatten([
          "padding-left-12",
          "padding-right-8",
          "padding-y-2",
          "border-radius-12",
          "background-color-primary-10",
          "flex-row",
          "items-center",
        ]),
        propStyle,
      ])}
      onPress={() => {
        Clipboard.setString(address);
        setTimer(3000);
      }}
      rippleColor={style.get("color-button-primary-outline-ripple").color}
      underlayColor={style.get("color-button-primary-outline-underlay").color}
      activeOpacity={1}
    >
      <Text style={style.flatten(["subtitle3", "color-primary-400"])}>
        {Bech32Address.shortenAddress(address, maxCharacters)}
      </Text>
      <View style={style.flatten(["margin-left-4", "width-20"])}>
        {isTimedOut ? (
          <View style={style.flatten(["margin-left-2"])}>
            <CheckIcon color={style.get("color-primary").color} />
          </View>
        ) : (
          <CopyIcon color={style.get("color-primary").color} size={19} />
        )}
      </View>
    </RectButton>
  );
};
