import React, { FunctionComponent, useMemo } from "react";
import WalletConnect from "@walletconnect/client";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import FastImage, { ImageStyle } from "react-native-fast-image";
import { useStyle } from "../../styles";
import { VectorCharacter } from "../vector-character";
import { WCAppLogo } from "./app-logo";

export const WCAppLogoAndName: FunctionComponent<{
  containerStyle?: ViewStyle;
  logoStyle?: ImageStyle;
  altLogoStyle?: ViewStyle;

  peerMeta: WalletConnect["peerMeta"];
}> = ({ containerStyle, logoStyle, altLogoStyle, peerMeta }) => {
  const style = useStyle();

  const appName = peerMeta?.name || peerMeta?.url || "unknown";

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(["items-center"]),
        containerStyle,
      ])}
    >
      <WCAppLogo
        peerMeta={peerMeta}
        logoStyle={StyleSheet.flatten([
          style.flatten(["margin-bottom-16"]),
          logoStyle,
        ])}
        altLogoStyle={StyleSheet.flatten([
          style.flatten(["margin-bottom-16"]),
          altLogoStyle,
        ])}
      />
      <Text style={style.flatten(["h6", "color-text-black-medium"])}>
        {appName}
      </Text>
    </View>
  );
};
