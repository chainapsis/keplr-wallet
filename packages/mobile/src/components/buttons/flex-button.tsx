import React, { FunctionComponent } from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { BaseButton } from "./base-button";
import {
  bw1,
  flex1,
  px4,
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
  fcWhite,
  bgcPrimary200,
  bgcPrimary,
} from "../../styles";

export const FlexButton: FunctionComponent<
  React.ComponentProps<typeof BaseButton> & {
    containerStyle?: StyleProp<ViewStyle>[];
    wrapperStyle?: StyleProp<ViewStyle>[];
    buttonStyle?: StyleProp<ViewStyle>[];
    titleStyle?: StyleProp<TextStyle>[];
    disabledButtonStyle?: StyleProp<ViewStyle>[];
    disabledTitleStyle?: StyleProp<TextStyle>[];
  }
> = (props) => {
  const attributes = { ...props };
  delete attributes.containerStyle;
  delete attributes.wrapperStyle;
  delete attributes.buttonStyle;
  delete attributes.titleStyle;
  delete attributes.disabledButtonStyle;
  delete attributes.disabledTitleStyle;

  const containerStyle = props.containerStyle ?? [];
  const wrapperStyle = props.wrapperStyle ?? [];
  const buttonStyle = props.buttonStyle ?? [];
  const titleStyle = props.titleStyle ?? [];
  const disabledButtonStyle = props.disabledButtonStyle ?? [];
  const disabledTitleStyle = props.disabledTitleStyle ?? [];

  return (
    <BaseButton
      {...attributes}
      containerStyle={[flex1, ...containerStyle]}
      wrapperStyle={[px4, py3, ...wrapperStyle]}
      buttonStyle={[bgcPrimary, ...buttonStyle]}
      titleStyle={[fcWhite, buttonFont1, ...titleStyle]}
      disabledButtonStyle={[bgcPrimary200, ...disabledButtonStyle]}
      disabledTitleStyle={[fcWhite, buttonFont1, ...disabledTitleStyle]}
    />
  );
};

export const FlexWhiteButton: FunctionComponent<
  React.ComponentProps<typeof BaseButton> & {
    containerStyle?: StyleProp<ViewStyle>[];
    wrapperStyle?: StyleProp<ViewStyle>[];
    buttonStyle?: StyleProp<ViewStyle>[];
    titleStyle?: StyleProp<TextStyle>[];
    disabledButtonStyle?: StyleProp<ViewStyle>[];
    disabledTitleStyle?: StyleProp<TextStyle>[];
    color?: "primary" | "secondary" | "error" | "warning";
  }
> = (props) => {
  const attributes = { ...props };
  delete attributes.containerStyle;
  delete attributes.wrapperStyle;
  delete attributes.buttonStyle;
  delete attributes.titleStyle;
  delete attributes.disabledButtonStyle;
  delete attributes.disabledTitleStyle;

  const containerStyle = props.containerStyle ?? [];
  const wrapperStyle = props.wrapperStyle ?? [];
  const buttonStyle = props.buttonStyle ?? [];
  const titleStyle = props.titleStyle ?? [];
  const disabledButtonStyle = props.disabledButtonStyle ?? [];
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

  const disabled = props.disabled || false;

  return (
    <BaseButton
      {...attributes}
      containerStyle={[
        flex1,
        bw1,
        disabled ? disabledBorderColor : borderColor,
        ...containerStyle,
      ]}
      wrapperStyle={[bgcWhite, px4, py3, ...wrapperStyle]}
      buttonStyle={[...buttonStyle]}
      titleStyle={[fontColor, buttonFont1, ...titleStyle]}
      disabledButtonStyle={[...disabledButtonStyle]}
      disabledTitleStyle={[
        disabledFontColor,
        buttonFont1,
        ...disabledTitleStyle,
      ]}
    />
  );
};
