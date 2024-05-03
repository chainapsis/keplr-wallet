import React, { FunctionComponent, ReactElement } from "react";
import { Text, View, ViewStyle } from "react-native";
import { IconButton } from "../button/icon";
import { useStyle } from "styles/index";

export const PasswordValidateView: FunctionComponent<{
  icon?: ReactElement | undefined;
  text?: string;
  containerStyle?: ViewStyle;
  iconStyle?: ViewStyle;
  textStyle?: ViewStyle;
}> = ({ icon, text, containerStyle, iconStyle, textStyle }) => {
  const style = useStyle();
  return (
    <View
      style={
        [
          style.flatten(["flex-row", "items-center", "margin-y-2"]),
          containerStyle,
        ] as ViewStyle
      }
    >
      <IconButton
        icon={icon}
        backgroundBlur={false}
        iconStyle={
          [
            style.flatten(
              ["padding-6", "border-color-gray-300"],
              [icon == undefined && "border-width-1"]
            ),
            iconStyle,
          ] as ViewStyle
        }
      />

      <Text
        style={
          [
            style.flatten([
              "color-gray-300",
              "margin-left-10",
              "text-caption1",
            ]),
            textStyle,
          ] as ViewStyle
        }
      >
        {text}
      </Text>
    </View>
  );
};
