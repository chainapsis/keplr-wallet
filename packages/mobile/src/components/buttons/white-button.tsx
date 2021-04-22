import React, { FunctionComponent } from "react";
import {
  StyleProp,
  TextStyle,
  ViewStyle,
  GestureResponderEvent,
} from "react-native";
import { Button } from "react-native-elements";
import {
  bw1,
  flex1,
  br1,
  px4,
  sf,
  bcPrimary,
  fcPrimary,
  bcSecondary,
  fcSecondary,
  bcWarining,
  fcWarining,
  bcError,
  fcError,
  bgcWhite,
  buttonFont1,
  py3,
} from "../../styles";

type WhiteButtonProps = {
  containerStyle?: StyleProp<ViewStyle>[];
  buttonStyle?: StyleProp<ViewStyle>[];
  titleStyle?: StyleProp<TextStyle>[];
  disabled?: boolean;
  loading?: boolean;
  color?: "primary" | "secondary" | "error" | "warning";
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
};

export const WhiteButton: FunctionComponent<WhiteButtonProps> = ({
  containerStyle = [],
  buttonStyle = [],
  titleStyle = [],
  title,
  color,
  disabled,
  loading,
  onPress,
}) => {
  const [borderColor, fontColor] = (() => {
    switch (color) {
      case "primary":
        return [bcPrimary, fcPrimary];
      case "secondary":
        return [bcSecondary, fcSecondary];
      case "warning":
        return [bcWarining, fcWarining];
      case "error":
        return [bcError, fcError];
      default:
        return [bcPrimary, fcPrimary];
    }
  })();

  return (
    <Button
      containerStyle={sf([flex1, ...containerStyle])}
      buttonStyle={sf([
        borderColor,
        bgcWhite,
        bw1,
        br1,
        px4,
        py3,
        ...buttonStyle,
      ])}
      titleStyle={sf([fontColor, buttonFont1, ...titleStyle])}
      title={title}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
    />
  );
};
