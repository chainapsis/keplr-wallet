import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";

export const Divider: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = ({ containerStyle }) => {
  const style = useStyle();
  return (
    <View
      style={
        [
          style.flatten([
            "height-half",
            "width-1",
            "background-color-white@20%",
          ]),
          containerStyle,
        ] as ViewStyle
      }
    />
  );
};
