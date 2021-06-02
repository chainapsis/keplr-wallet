import React, { FunctionComponent, useCallback } from "react";
import { StyleProp, TextStyle, ViewStyle, View } from "react-native";
import { Text } from "react-native-elements";
import { RectButton } from "react-native-gesture-handler";
import {
  alignItemsCenter,
  br1,
  flex1,
  justifyContentCenter,
  overflowHidden,
  sf,
} from "../../styles";

export const BaseButton: FunctionComponent<
  React.ComponentProps<typeof RectButton> & {
    containerStyle?: StyleProp<ViewStyle>[];
    wrapperStyle?: StyleProp<ViewStyle>[];
    buttonStyle?: StyleProp<ViewStyle>[];
    titleStyle?: StyleProp<TextStyle>[];
    disabledButtonStyle?: StyleProp<ViewStyle>[];
    disabledTitleStyle?: StyleProp<TextStyle>[];
    title: string;
    disabled?: boolean;
    loading?: boolean;
  }
> = (props) => {
  const attributes = { ...props };
  delete attributes.containerStyle;
  delete attributes.wrapperStyle;
  delete attributes.buttonStyle;
  delete attributes.titleStyle;
  delete attributes.disabledButtonStyle;
  delete attributes.disabledTitleStyle;
  delete attributes.onPress;

  // Default Container Style and Wrapper Style (works regardless of whether not disabled or disabled)
  const containerStyle = props.containerStyle ?? [];
  const wrapperStyle = props.wrapperStyle ?? [];
  // only Not Disabled Inner Button and Title Style
  const buttonStyle = props.buttonStyle ?? [];
  const titleStyle = props.titleStyle ?? [];
  // only Disabled Inner Button and Title Style
  const disabledButtonStyle = props.disabledButtonStyle ?? [];
  const disabledTitleStyle = props.disabledTitleStyle ?? [];

  const onPress = props.onPress;
  const title = props.title;
  const disabled = props.disabled || false;
  const loading = props.loading || false;

  const handleOnPress = useCallback(
    (pointerInside: boolean) => {
      if (!loading && !disabled) {
        onPress ? onPress(pointerInside) : null;
      }
    },
    [disabled, loading, onPress]
  );

  const currentButtonStyle = disabled ? disabledButtonStyle : buttonStyle;
  const currentTitleStyle = disabled ? disabledTitleStyle : titleStyle;

  return (
    // RectButton Style borderWidth and borderColor in android don't work
    // So Add Outermost View container for drawing White Flex Button
    <View style={sf([overflowHidden, br1, ...containerStyle])}>
      <RectButton
        {...attributes}
        onPress={handleOnPress}
        style={sf([
          flex1,
          justifyContentCenter,
          alignItemsCenter,
          ...wrapperStyle,
          ...currentButtonStyle,
        ])}
      >
        <View accessible>
          {loading ? (
            <Text style={sf([...currentTitleStyle])}>Loading...</Text>
          ) : (
            <Text style={sf([...currentTitleStyle])}>{title}</Text>
          )}
        </View>
      </RectButton>
    </View>
  );
};
