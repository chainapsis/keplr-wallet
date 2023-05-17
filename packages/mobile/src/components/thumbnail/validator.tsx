import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import { useStyle } from "../../styles";
import { PersonIcon } from "../icon";

export const ValidatorThumbnail: FunctionComponent<{
  style?: ViewStyle;
  url?: string;
  size: number;
}> = ({ style: propStyle, url, size }) => {
  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "overflow-hidden",
          "background-color-gray-50",
          "dark:background-color-platinum-500",
          "border-width-1",
          "border-color-gray-100@20%",
          "dark:border-color-gray-400@40%",
          "items-center",
          "justify-center",
        ]),
        {
          width: size,
          height: size,
          borderRadius: size,
        },
        propStyle,
      ])}
    >
      {url ? (
        <FastImage
          style={{
            width: size,
            height: size,
          }}
          source={{
            uri: url,
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
      ) : (
        <PersonIcon
          size={size}
          color={
            style.flatten(["color-gray-300", "dark:color-platinum-300"]).color
          }
        />
      )}
    </View>
  );
};
