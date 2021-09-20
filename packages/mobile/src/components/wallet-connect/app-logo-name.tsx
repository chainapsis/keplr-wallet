import React, { FunctionComponent, useMemo } from "react";
import WalletConnect from "@walletconnect/client";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import FastImage, { ImageStyle } from "react-native-fast-image";
import { useStyle } from "../../styles";
import { VectorCharacter } from "../vector-character";

export const WCAppLogoAndName: FunctionComponent<{
  containerStyle?: ViewStyle;
  logoStyle?: ImageStyle;
  altLogoStyle?: ViewStyle;

  peerMeta: WalletConnect["peerMeta"];
}> = ({ containerStyle, logoStyle, altLogoStyle, peerMeta }) => {
  const style = useStyle();

  const appName = peerMeta?.name || peerMeta?.url || "unknown";

  const icons = peerMeta?.icons;
  const logoUrl = useMemo(() => {
    if (icons && icons.length > 0) {
      return icons[icons.length - 1];
    }
  }, [icons]);

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(["items-center"]),
        containerStyle,
      ])}
    >
      {logoUrl ? (
        <FastImage
          style={StyleSheet.flatten([
            style.flatten(["width-44", "height-44", "margin-bottom-16"]),
            logoStyle,
          ])}
          resizeMode={FastImage.resizeMode.contain}
          source={{
            uri: logoUrl,
            cache: FastImage.cacheControl.web,
          }}
        />
      ) : (
        <View
          style={StyleSheet.flatten([
            style.flatten([
              "width-44",
              "height-44",
              "margin-bottom-16",
              "border-radius-64",
              "justify-center",
              "items-center",
              "background-color-text-black-very-very-low",
            ]),
            altLogoStyle,
          ])}
        >
          <VectorCharacter
            height={20}
            color={style.get("color-white").color}
            char={appName[0]}
          />
        </View>
      )}
      <Text style={style.flatten(["h6", "color-text-black-medium"])}>
        {appName}
      </Text>
    </View>
  );
};
