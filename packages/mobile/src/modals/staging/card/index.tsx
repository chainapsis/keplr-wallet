import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// CONTRACT: Use with { disableSafeArea: true, align: "bottom" } modal options.
export const CardModal: FunctionComponent<{
  title: string;
}> = ({ title, children }) => {
  const style = useStyle();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View
      style={style.flatten([
        "background-color-white",
        "border-radius-top-left-8",
        "border-radius-top-right-8",
        "padding-12",
        "padding-top-16",
        "overflow-hidden",
      ])}
    >
      <View
        style={{
          paddingBottom: safeAreaInsets.bottom,
        }}
      >
        <Text
          style={style.flatten([
            "h3",
            "color-text-black-high",
            "text-center",
            "margin-bottom-14",
          ])}
        >
          {title}
        </Text>
        {children}
      </View>
    </View>
  );
};
