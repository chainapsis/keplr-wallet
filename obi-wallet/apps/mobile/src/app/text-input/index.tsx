import { Text, TextInput as OriginalTextInput } from "@obi-wallet/common";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

const styles = StyleSheet.create({
  label: {
    color: "#787B9C",
    fontSize: 10,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    height: 56,
    borderWidth: 1,
    borderColor: "#2F2B4C",
    paddingLeft: 20,
    fontSize: 14,
    fontWeight: "500",
    color: "#F6F5FF",
    borderRadius: 12,
  },
});

export function TextInput({
  label,
  style,
  inputStyle,
  ...props
}: TextInputProps & {
  label?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <OriginalTextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor="#4B4E6E"
        {...props}
      />
    </View>
  );
}
