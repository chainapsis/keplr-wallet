import React, { FunctionComponent } from "react";
import {
  StyleProp,
  TextStyle,
  ViewStyle,
  GestureResponderEvent,
} from "react-native";
import { Button } from "react-native-elements";

type DefalutButtonProps = {
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
};

export const DefaultButton: FunctionComponent<DefalutButtonProps> = ({
  containerStyle,
  buttonStyle,
  titleStyle,
  title,
  disabled,
  loading,
  onPress,
}) => {
  return (
    <Button
      containerStyle={{
        flex: 1,
        ...(containerStyle as Record<string, unknown>),
      }}
      buttonStyle={{
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        ...(buttonStyle as Record<string, unknown>),
      }}
      titleStyle={{
        fontWeight: "500",
        ...(titleStyle as Record<string, unknown>),
      }}
      title={title}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
    />
  );
};
