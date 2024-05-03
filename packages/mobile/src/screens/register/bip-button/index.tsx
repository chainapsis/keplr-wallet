import { BlurButton } from "components/new/button/blur-button";
import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";

export const BipButtons: FunctionComponent<{
  selected: boolean;
  clearButtonDisable?: boolean;
  setIsSelected: any;
  onPressClearButton?: () => void;
}> = ({ selected, setIsSelected, onPressClearButton, clearButtonDisable }) => {
  const style = useStyle();
  return (
    <View style={style.flatten(["flex-row", "items-center"]) as ViewStyle}>
      <BlurButton
        text="Advanced Settings"
        blurIntensity={16}
        borderRadius={32}
        backgroundBlur={selected ? true : false}
        containerStyle={
          [
            style.flatten(
              ["justify-center", "margin-y-18"],
              [
                "border-width-1",
                "border-radius-64",
                selected ? "border-color-indigo" : "border-color-white@40%",
              ]
            ),
            { width: 150 },
          ] as ViewStyle
        }
        textStyle={style.flatten(["text-caption2"]) as ViewStyle}
        onPress={() => setIsSelected(!selected)}
      />

      <BlurButton
        text="Clear all"
        blurIntensity={16}
        borderRadius={32}
        backgroundBlur={false}
        disable={clearButtonDisable}
        containerStyle={
          [
            style.flatten(
              [
                "justify-center",
                "margin-y-18",
                "border-width-1",
                "border-radius-64",

                "margin-left-10",
              ],
              [
                clearButtonDisable
                  ? "border-color-white@20%"
                  : "border-color-white@40%",
              ]
            ),
            { width: 70 },
          ] as ViewStyle
        }
        textStyle={style.flatten(["text-caption2"]) as ViewStyle}
        onPress={onPressClearButton}
      />
    </View>
  );
};
