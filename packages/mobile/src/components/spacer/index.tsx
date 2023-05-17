import React, { FunctionComponent } from "react";
import { View } from "react-native";

export const Spacer: FunctionComponent<{
  horizontal?: boolean;
  size: number;
}> = ({ horizontal = true, size }) => {
  const defaultValue = "auto";

  return (
    <View
      style={{
        width: horizontal ? size : defaultValue,
        height: !horizontal ? size : defaultValue,
      }}
    />
  );
};
