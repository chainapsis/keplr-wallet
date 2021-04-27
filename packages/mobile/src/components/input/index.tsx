import React, { FunctionComponent } from "react";
import { Input } from "react-native-elements";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { sf, bcError, bw1 } from "../../styles";

interface InputProps {
  label?: string;
  value?: string;
  errorMessage?: string;
  secureTextEntry?: boolean;
  autoCompleteType?:
    | "name"
    | "username"
    | "password"
    | "cc-csc"
    | "cc-exp"
    | "cc-exp-month"
    | "cc-exp-year"
    | "cc-number"
    | "email"
    | "postal-code"
    | "street-address"
    | "tel"
    | "off"
    | undefined;
  numberOfLines?: number;
  multiline?: boolean;
  disabled?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters" | undefined;
  onChangeText: ((text: string) => void) | undefined;
  inputContainerStyle?: [];
  labelStyle?: StyleProp<TextStyle>[];
  errorStyle?: StyleProp<TextStyle>[];
  inputStyle?: StyleProp<TextStyle>[];
  disabledInputStyle?: StyleProp<ViewStyle>[];
  rightIcon?: any;
}

export const DefaultInput: FunctionComponent<InputProps> = ({
  label,
  value,
  errorMessage,
  secureTextEntry,
  autoCompleteType,
  numberOfLines,
  multiline,
  disabled,
  autoCapitalize,
  onChangeText,
  inputContainerStyle = [],
  labelStyle = [],
  errorStyle = [],
  inputStyle = [],
  disabledInputStyle = [],
  rightIcon,
}) => {
  return (
    <Input
      label={label}
      value={value}
      errorMessage={errorMessage}
      secureTextEntry={secureTextEntry}
      autoCompleteType={autoCompleteType}
      numberOfLines={numberOfLines}
      multiline={multiline}
      disabled={disabled}
      autoCapitalize={autoCapitalize}
      onChangeText={onChangeText}
      inputContainerStyle={
        errorMessage
          ? sf([bcError, bw1, ...inputContainerStyle])
          : sf([...inputContainerStyle])
      }
      labelStyle={sf([...labelStyle])}
      errorStyle={sf([...errorStyle])}
      inputStyle={sf([...inputStyle])}
      disabledInputStyle={sf([...disabledInputStyle])}
      rightIcon={rightIcon}
    />
  );
};
