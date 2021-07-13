import React, { FunctionComponent } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";
import { Button } from "../button";
import { RectButton } from "react-native-gesture-handler";
import { RightArrowIcon } from "../icon";

export const CardHeaderWithButton: FunctionComponent<{
  title: string;
  paragraph?: string;
  buttonText: string;

  onPress?: () => void;

  buttonColor?: "primary" | "secondary" | "danger";
  buttonMode?: "fill" | "outline" | "text";
  buttonStyle?: ViewStyle;
  buttonDisabled?: boolean;
  buttonLoading?: boolean;
}> = ({
  title,
  paragraph,
  buttonText,
  onPress,
  buttonColor = "primary",
  buttonMode = "fill",
  buttonStyle,
  buttonDisabled = false,
  buttonLoading = false,
}) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "flex",
        "flex-row",
        "padding-16",
        "padding-bottom-12",
      ])}
    >
      <View style={style.flatten(["flex", "justify-center"])}>
        <Text style={style.flatten(["h5", "color-text-black-high"])}>
          {title}
        </Text>
        {paragraph ? (
          <Text
            style={style.flatten([
              "subtitle2",
              "color-text-black-low",
              "margin-top-4",
            ])}
          >
            {paragraph}
          </Text>
        ) : null}
      </View>
      <View style={style.flatten(["flex-1"])} />
      <View>
        <Button
          style={StyleSheet.flatten([
            style.flatten(["padding-x-24"]),
            buttonStyle,
          ])}
          onPress={onPress}
          size="small"
          text={buttonText}
          color={buttonColor}
          mode={buttonMode}
          disabled={buttonDisabled}
          loading={buttonLoading}
        />
      </View>
    </View>
  );
};

export const CardHeaderFullButton: FunctionComponent<{
  title: string;
  buttonText: string;
}> = ({ title, buttonText }) => {
  const style = useStyle();

  return (
    <RectButton
      style={style.flatten([
        "padding-16",
        "padding-bottom-12",
        "border-radius-top-left-8",
        "border-radius-top-right-8",
      ])}
    >
      <View style={style.flatten(["flex", "flex-row", "items-center"])}>
        <Text style={style.flatten(["h5", "color-text-black-high"])}>
          {title}
        </Text>
        <View style={style.flatten(["flex-1"])} />
        <Text
          style={style.flatten([
            "text-button2",
            "color-text-black-very-very-low",
            "margin-right-8",
          ])}
        >
          {buttonText}
        </Text>
        <RightArrowIcon
          color={style.get("color-text-black-very-very-low").color}
          height={12}
        />
      </View>
    </RectButton>
  );
};
