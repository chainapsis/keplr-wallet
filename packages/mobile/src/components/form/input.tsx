import React, { FunctionComponent } from "react";
import { Input as RNInput } from "react-native-elements";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { sf, bcError, bw1 } from "../../styles";

export const Input: FunctionComponent<
  React.ComponentProps<typeof RNInput> & {
    inputContainerStyle?: StyleProp<ViewStyle>[];
    labelStyle?: StyleProp<TextStyle>[];
    errorStyle?: StyleProp<TextStyle>[];
    inputStyle?: StyleProp<TextStyle>[];
    disabledInputStyle?: StyleProp<ViewStyle>[];
  }
> = (props) => {
  const attributes = { ...props };
  delete attributes.inputContainerStyle;
  delete attributes.labelStyle;
  delete attributes.errorStyle;
  delete attributes.inputStyle;
  delete attributes.disabledInputStyle;

  const inputContainerStyle = props.inputContainerStyle ?? [];
  const labelStyle = props.labelStyle ?? [];
  const errorStyle = props.errorStyle ?? [];
  const inputStyle = props.inputStyle ?? [];
  const disabledInputStyle = props.disabledInputStyle ?? [];

  return (
    <RNInput
      {...attributes}
      inputContainerStyle={
        props.errorMessage
          ? sf([bcError, bw1, ...inputContainerStyle])
          : sf([...inputContainerStyle])
      }
      labelStyle={sf([...labelStyle])}
      errorStyle={sf([...errorStyle])}
      inputStyle={sf([...inputStyle])}
      disabledInputStyle={sf([...disabledInputStyle])}
    />
  );
};
