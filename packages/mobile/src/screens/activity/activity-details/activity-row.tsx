import { useStyle } from "styles/index";
import { Text, View, ViewStyle } from "react-native";
import React from "react";

export const DetailRow = ({ label, value }: { label: string; value: any }) => {
  const style = useStyle();
  return (
    <View
      style={
        style.flatten(["flex-row", "items-center", "padding-16"]) as ViewStyle
      }
    >
      <Text style={style.flatten(["color-white"]) as ViewStyle}>{label}</Text>
      <View style={style.flatten(["flex-1", "items-end"]) as ViewStyle}>
        <Text style={style.flatten(["color-gray-200"]) as ViewStyle}>
          {value}
        </Text>
      </View>
    </View>
  );
};
