import React from "react";
import { StyleSheet, Text as T, TextProps } from "react-native";

const styles = StyleSheet.create({
  font: {
    fontFamily: "Poppins",
  },
});

export function Text({
  children,
  style,
  ...props
}: TextProps & { children: React.ReactNode }) {
  return (
    <T style={[styles.font, style]} {...props}>
      {children}
    </T>
  );
}
