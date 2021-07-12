import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { useStyle } from "../../../styles";

export const CardDivider: FunctionComponent = () => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "height-1",
        "margin-x-16",
        "background-color-divider",
      ])}
    />
  );
};
