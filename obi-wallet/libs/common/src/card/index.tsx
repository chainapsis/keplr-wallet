import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { createShadow } from "../styles";

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 7,
    ...createShadow(8),
  },
});

export function Card({
  children,
  style,
  ...props
}: {
  children: React.ReactNode;
} & ViewProps) {
  return (
    <View style={[cardStyles.card, style]} {...props}>
      {children}
    </View>
  );
}
