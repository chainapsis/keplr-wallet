import React, { FunctionComponent, useMemo } from "react";
import WalletConnect from "@walletconnect/client";
import FastImage, { ImageStyle } from "react-native-fast-image";
import { StyleSheet, View, ViewStyle } from "react-native";
import { VectorCharacter } from "../vector-character";
import { useStyle } from "../../styles";
import { observer } from "mobx-react-lite";

export const WCAppLogo: FunctionComponent<{
  peerMeta: WalletConnect["peerMeta"];
  logoStyle?: ImageStyle;
  altLogoStyle?: ViewStyle;
}> = observer(({ peerMeta, logoStyle, altLogoStyle }) => {
  const style = useStyle();

  const appName = peerMeta?.name || peerMeta?.url || "unknown";

  const icons = peerMeta?.icons;
  const logoUrl = useMemo(() => {
    if (icons && icons.length > 0) {
      return icons[icons.length - 1];
    }
  }, [icons]);

  return logoUrl ? (
    <FastImage
      style={StyleSheet.flatten([
        style.flatten(["width-44", "height-44"]),
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
  );
});
