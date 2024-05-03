import React, { FunctionComponent, ReactElement } from "react";
import { Text, View, ViewStyle } from "react-native";
import { SearchIcon } from "../icon/search-icon";
import { useStyle } from "styles/index";

export const EmptyView: FunctionComponent<{
  text?: string;
  icon?: ReactElement;
  containerStyle?: ViewStyle;
  textStyle?: ViewStyle;
}> = ({ text = "No search data", icon, containerStyle, textStyle }) => {
  const style = useStyle();
  return (
    <View
      style={
        [
          style.flatten([
            "items-center",
            "absolute",
            "height-full",
            "width-full",
            "justify-center",
          ]),
          containerStyle,
        ] as ViewStyle
      }
    >
      {icon ? (
        icon
      ) : (
        <SearchIcon
          color={style.flatten(["color-platinum-100"]).color}
          size={56}
        />
      )}
      <Text
        style={
          [
            style.flatten([
              "subtitle2",
              "color-gray-100",
              "dark:color-platinum-300",
              "margin-18",
            ]),
            textStyle,
          ] as ViewStyle
        }
      >
        {text}
      </Text>
    </View>
  );
};
