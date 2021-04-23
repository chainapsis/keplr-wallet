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
  buttonFont1,
  py3,
  fcWhite,
  bgcPrimary200,
} from "../../styles";

type DefalutButtonProps = {
  containerStyle?: StyleProp<ViewStyle>[];
  buttonStyle?: StyleProp<ViewStyle>[];
  titleStyle?: StyleProp<TextStyle>[];
  disabledStyle?: StyleProp<ViewStyle>[];
  disabledTitleStyle?: StyleProp<TextStyle>[];
  disabled?: boolean;
  loading?: boolean;
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
};

export const DefaultButton: FunctionComponent<DefalutButtonProps> = ({
  containerStyle = [],
  titleStyle = [],
  buttonStyle = [],
  disabledStyle = [],
  disabledTitleStyle = [],
  title,
  disabled,
  loading,
  onPress,
}) => {
  return (
    <Button
      containerStyle={sf([flex1, ...containerStyle])}
      buttonStyle={sf([bw1, br1, px4, py3, ...buttonStyle])}
      titleStyle={sf([buttonFont1, ...titleStyle])}
      title={title}
      disabled={disabled}
      disabledStyle={sf([bgcPrimary200, ...disabledStyle])}
      disabledTitleStyle={sf([fcWhite, ...disabledTitleStyle])}
      onPress={onPress}
      loading={loading}
    />
  );
};
