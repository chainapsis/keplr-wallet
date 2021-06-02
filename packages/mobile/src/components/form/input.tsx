import React, { FunctionComponent } from "react";
import { StyleProp, TextStyle, ViewStyle, TextInput, View } from "react-native";
import { Text } from "react-native-elements";
import { RectButton } from "react-native-gesture-handler";
import {
  sf,
  bcError,
  bw1,
  flex1,
  justifyContentCenter,
  alignItemsCenter,
  subtitle2,
  flexDirectionRow,
  bgcWhite,
  p3,
  mb1,
  br1,
  body2,
  my1,
  fcError,
  justifyContentEnd,
  caption1,
  bgcGrey,
  bcWhiteGrey,
  brw1,
} from "../../styles";

export const Input: FunctionComponent<
  React.ComponentProps<typeof TextInput> & {
    disabled?: boolean;
    label?: string;
    errorMessage?: string;
    labelStyle?: StyleProp<TextStyle>[];
    errorStyle?: StyleProp<TextStyle>[];
    inputStyle?: StyleProp<TextStyle>[];
    disabledInputStyle?: StyleProp<ViewStyle>[];
    inputContainerStyle?: StyleProp<ViewStyle>[];
    disabledInputContainerStyle?: StyleProp<ViewStyle>[];
    hasCenterBorder?: boolean;
    rightIcon?: any;
    rightIconOnPress?: () => void;
  }
> = (props) => {
  const attributes = { ...props };
  delete attributes.labelStyle;
  delete attributes.errorStyle;
  delete attributes.inputStyle;
  delete attributes.disabledInputStyle;
  delete attributes.inputContainerStyle;
  delete attributes.disabledInputContainerStyle;

  delete attributes.rightIcon;
  delete attributes.rightIconOnPress;

  const disabled = props.disabled ?? false;
  const label = props.label ?? "";
  const errorMessage = props.errorMessage ?? "";

  const labelStyle = props.labelStyle ?? [];
  const errorStyle = props.errorStyle ?? [];
  const inputStyle = props.inputStyle ?? [];
  const disabledInputStyle = props.disabledInputStyle ?? [];
  const inputContainerStyle = props.inputContainerStyle ?? [];
  const disabledInputContainerStyle = props.disabledInputContainerStyle ?? [];

  const currentInputStyle = disabled ? disabledInputStyle : inputStyle;
  const currentInputContainerStyle = disabled
    ? disabledInputContainerStyle
    : inputContainerStyle;

  const hasCenterBorder = props.hasCenterBorder ?? false;
  const rightIcon = props.rightIcon ?? null;
  const rightIconOnPress = props.rightIconOnPress ?? undefined;

  return (
    <View>
      {label ? (
        <Text style={sf([...labelStyle, subtitle2, mb1])}>{label}</Text>
      ) : null}
      <View
        style={sf([
          flexDirectionRow,
          justifyContentCenter,
          alignItemsCenter,
          disabled ? bgcGrey : bgcWhite,
          bw1,
          br1,
          errorMessage ? bcError : bcWhiteGrey,
          ...currentInputContainerStyle,
        ])}
      >
        <View
          style={sf([
            flex1,
            hasCenterBorder ? brw1 : undefined,
            errorMessage ? bcError : bcWhiteGrey,
          ])}
        >
          <TextInput
            {...attributes}
            style={sf([p3, body2, ...currentInputStyle])}
          />
        </View>
        {rightIcon ? (
          <RectButton onPress={rightIconOnPress}>
            <View
              accessible
              style={sf([
                p3,
                justifyContentEnd,
                alignItemsCenter,
                ...currentInputContainerStyle,
              ])}
            >
              {props.rightIcon}
            </View>
          </RectButton>
        ) : null}
      </View>
      <Text style={sf([...errorStyle, my1, fcError, caption1])}>
        {errorMessage}
      </Text>
    </View>
  );
};
