import React, { FunctionComponent } from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Button as RNButton } from "react-native-elements";
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
  bcPrimary200,
  fcPrimary200,
  bcSecondary200,
  fcSecondary200,
} from "../../styles";

export const WhiteButton: FunctionComponent<
  React.ComponentProps<typeof RNButton> & {
    containerStyle?: StyleProp<ViewStyle>[];
    buttonStyle?: StyleProp<ViewStyle>[];
    titleStyle?: StyleProp<TextStyle>[];
    disabledStyle?: StyleProp<ViewStyle>[];
    disabledTitleStyle?: StyleProp<TextStyle>[];
    color?: "primary" | "secondary" | "error" | "warning";
  }
> = (props) => {
  const attributes = { ...props };
  delete attributes.containerStyle;
  delete attributes.buttonStyle;
  delete attributes.titleStyle;
  delete attributes.disabledStyle;
  delete attributes.disabledTitleStyle;

  const containerStyle = props.containerStyle ?? [];
  const buttonStyle = props.buttonStyle ?? [];
  const titleStyle = props.titleStyle ?? [];
  const disabledStyle = props.disabledStyle ?? [];
  const disabledTitleStyle = props.disabledTitleStyle ?? [];

  const [borderColor, fontColor] = (() => {
    switch (props.color) {
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

  const [disabledBorderColor, disabledFontColor] = (() => {
    switch (props.color) {
      case "primary":
        return [bcPrimary200, fcPrimary200];
      case "secondary":
        return [bcSecondary200, fcSecondary200];
      case "warning":
        return [bcWarining, fcWarining];
      case "error":
        return [bcError, fcError];
      default:
        return [bcPrimary, fcPrimary];
    }
  })();

  return (
    <RNButton
      {...attributes}
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
      disabledStyle={sf([disabledBorderColor, bgcWhite, ...disabledStyle])}
      disabledTitleStyle={sf([disabledFontColor, ...disabledTitleStyle])}
    />
  );
};
