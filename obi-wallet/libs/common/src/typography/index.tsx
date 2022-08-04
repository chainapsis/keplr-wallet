import React from "react";
import {
  StyleSheet,
  Text as OriginalText,
  TextInput as OriginalTextInput,
  TextInputProps,
  TextProps,
} from "react-native";

const styles = StyleSheet.create({
  font: {
    fontFamily: "Inter",
  },
});

export function Text({
  children,
  style,
  ...props
}: TextProps & { children: React.ReactNode }) {
  return (
    <OriginalText style={[styles.font, style]} {...props}>
      {children}
    </OriginalText>
  );
}

export function TextInput({ style, ...props }: TextInputProps) {
  return <OriginalTextInput style={[styles.font, style]} {...props} />;
}
