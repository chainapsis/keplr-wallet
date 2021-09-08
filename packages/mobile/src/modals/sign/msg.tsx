import React, { FunctionComponent } from "react";
import { View, Text } from "react-native";
import { useStyle } from "../../styles";

export const Msg: FunctionComponent<{
  title: string;
}> = ({ title, children }) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "padding-x-16",
        "padding-y-24",
        "background-color-white",
      ])}
    >
      <Text
        style={style.flatten([
          "h6",
          "color-text-black-medium",
          "margin-bottom-2",
        ])}
      >
        {title}
      </Text>
      {children}
    </View>
  );
};
