import React, { FunctionComponent } from "react";
import { View, Text, ViewStyle } from "react-native";
import { useStyle } from "styles/index";

export const Msg: FunctionComponent<{
  title: string;
}> = ({ title, children }) => {
  const style = useStyle();

  return (
    <View style={style.flatten(["padding-16"]) as ViewStyle}>
      <Text
        style={
          style.flatten([
            "h6",
            "color-white",
            "font-normal",
            "margin-bottom-2",
          ]) as ViewStyle
        }
      >
        {title}
      </Text>
      {children}
    </View>
  );
};
