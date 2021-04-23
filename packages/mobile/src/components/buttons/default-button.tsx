import React, { FunctionComponent } from "react";
import {
  StyleProp,
  TextStyle,
  ViewStyle,
  GestureResponderEvent,
} from "react-native";
import { Button } from "react-native-elements";
import { bw1, flex1, br1, px4, sf, buttonFont1, py3 } from "../../styles";

type DefalutButtonProps = {
  containerStyle?: StyleProp<ViewStyle>[];
  buttonStyle?: StyleProp<ViewStyle>[];
  titleStyle?: StyleProp<TextStyle>[];
  disabled?: boolean;
  loading?: boolean;
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
};

export const DefaultButton: FunctionComponent<DefalutButtonProps> = ({
  containerStyle = [],
  buttonStyle = [],
  titleStyle = [],
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
      onPress={onPress}
      loading={loading}
      disabled={disabled}
    />
  );
};
