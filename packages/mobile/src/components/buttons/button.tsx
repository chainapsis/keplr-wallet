import React, { FunctionComponent } from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { BaseButton } from "./base-button";
import { fcWhite, bgcPrimary200, bgcPrimary, buttonFont2 } from "../../styles";

export const Button: FunctionComponent<
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
      containerStyle={containerStyle}
      wrapperStyle={wrapperStyle}
      buttonStyle={[bgcPrimary, ...buttonStyle]}
      titleStyle={[fcWhite, buttonFont2, ...titleStyle]}
      disabledButtonStyle={[bgcPrimary200, ...disabledButtonStyle]}
      disabledTitleStyle={[fcWhite, buttonFont2, ...disabledTitleStyle]}
    />
  );
};
