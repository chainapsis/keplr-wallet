import React, { FunctionComponent, ReactElement } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";
import { Button } from "../button";
import { RightArrowIcon } from "../icon";
import { RectButton } from "../rect-button";

export const CardHeaderWithButton: FunctionComponent<{
  title: string;
  paragraph?: string;
  buttonText: string;
  icon?: ReactElement;

  onPress?: () => void;

  buttonColor?: "primary" | "secondary" | "danger";
  buttonMode?: "fill" | "light" | "outline" | "text";
  buttonStyle?: ViewStyle;
  buttonContainerStyle?: ViewStyle;
  buttonDisabled?: boolean;
  buttonLoading?: boolean;
}> = ({
  title,
  paragraph,
  buttonText,
  icon,
  onPress,
  buttonColor = "primary",
  buttonMode = "fill",
  buttonStyle,
  buttonContainerStyle,
  buttonDisabled = false,
  buttonLoading = false,
}) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "flex",
        "flex-row",
        "items-center",
        "padding-x-card-horizontal",
        "padding-y-card-vertical",
      ])}
    >
      {icon && <View style={style.flatten(["margin-right-12"])}>{icon}</View>}
      <View style={style.flatten(["flex", "justify-center"])}>
        <Text style={style.flatten(["h5", "color-text-black-very-high"])}>
          {title}
        </Text>
        {paragraph ? (
          <Text
            style={style.flatten([
              "body2",
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
          style={buttonStyle}
          containerStyle={buttonContainerStyle}
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

export const CardHeader: FunctionComponent<{
  containerStyle?: ViewStyle;

  title: string;
}> = ({ containerStyle, title }) => {
  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(["padding-x-card-horizontal", "padding-y-card-vertical"]),
        containerStyle,
      ])}
    >
      <Text style={style.flatten(["h4", "color-text-black-very-high"])}>
        {title}
      </Text>
    </View>
  );
};

export const CardHeaderFullButton: FunctionComponent<{
  containerStyle?: ViewStyle;

  title: string;
  buttonText?: string;
  onPress?: () => void;
}> = ({ containerStyle, title, buttonText, onPress }) => {
  const style = useStyle();

  return (
    <RectButton
      style={StyleSheet.flatten([
        style.flatten([
          "padding-x-card-horizontal",
          "padding-top-card-vertical",
          "padding-bottom-card-vertical-half",
        ]),
        containerStyle,
      ])}
      onPress={onPress}
    >
      <View style={style.flatten(["flex", "flex-row", "items-center"])}>
        <Text style={style.flatten(["h4", "color-text-black-very-high"])}>
          {title}
        </Text>
        <View style={style.flatten(["flex-1"])} />
        {buttonText ? (
          <Text
            style={style.flatten([
              "text-button2",
              "color-text-black-very-very-low",
              "margin-right-8",
            ])}
          >
            {buttonText}
          </Text>
        ) : null}
        <RightArrowIcon
          color={style.get("color-text-black-very-very-low").color}
          height={16}
        />
      </View>
    </RectButton>
  );
};
