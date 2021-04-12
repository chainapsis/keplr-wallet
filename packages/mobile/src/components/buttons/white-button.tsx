import React, { FunctionComponent } from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Button, useTheme } from "react-native-elements";

type WhiteButtonProps = {
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  title: string;
  onPress: () => void;
};

export const WhiteButton: FunctionComponent<WhiteButtonProps> = ({
  containerStyle,
  buttonStyle,
  titleStyle,
  title,
  disabled,
  loading,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <Button
      containerStyle={{
        flex: 1,
        ...(containerStyle as Record<string, unknown>),
      }}
      buttonStyle={{
        borderWidth: 1,
        borderColor: theme.colors?.primary,
        borderRadius: 5,
        backgroundColor: theme.colors?.white,
        paddingVertical: 10,
        paddingHorizontal: 20,
        ...(buttonStyle as Record<string, unknown>),
      }}
      titleStyle={{
        color: theme.colors?.primary,
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
