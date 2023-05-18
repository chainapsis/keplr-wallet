import React, { FunctionComponent } from "react";
import { View } from "react-native";

export type SpacerDirection = "horizontal" | "vertical";

export const Spacer: FunctionComponent<{
  direction?: SpacerDirection;
  size: number;
}> = ({ direction = "horizontal", size }) => {
  const defaultValue = 1;

  return (
    <View
      style={{
        width: direction === "horizontal" ? size : defaultValue,
        minWidth: direction === "horizontal" ? size : defaultValue,
        height: direction === "vertical" ? size : defaultValue,
        minHeight: direction === "vertical" ? size : defaultValue,
      }}
    />
  );
};
