import React, { FunctionComponent } from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Button as RNButton } from "react-native-elements";
import {
  bw1,
  flex1,
  br1,
  px4,
  sf,
  buttonFont1,
  py3,
  fcWhite,
  bgcPrimary200,
} from "../../styles";

export const Button: FunctionComponent<
  React.ComponentProps<typeof RNButton> & {
    containerStyle?: StyleProp<ViewStyle>[];
    buttonStyle?: StyleProp<ViewStyle>[];
    titleStyle?: StyleProp<TextStyle>[];
    disabledStyle?: StyleProp<ViewStyle>[];
    disabledTitleStyle?: StyleProp<TextStyle>[];
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

  return (
    <RNButton
      {...attributes}
      containerStyle={sf([flex1, ...containerStyle])}
      buttonStyle={sf([bw1, br1, px4, py3, ...buttonStyle])}
      titleStyle={sf([buttonFont1, ...titleStyle])}
      disabledStyle={sf([bgcPrimary200, ...disabledStyle])}
      disabledTitleStyle={sf([fcWhite, ...disabledTitleStyle])}
    />
  );
};
