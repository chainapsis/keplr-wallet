import React, { FunctionComponent } from "react";
import { CardModal } from "modals/card";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { BlurButton } from "components/new/button/blur-button";

export const ConfirmCardModel: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  subtitle: string;
  select: (confirm: boolean) => void;
}> = ({ close, title, isOpen, select, subtitle }) => {
  const style = useStyle();

  if (!isOpen) {
    return null;
  }

  return (
    <CardModal
      isOpen={isOpen}
      showCloseButton={false}
      title={title}
      cardStyle={style.flatten(["padding-bottom-12"]) as ViewStyle}
      disableGesture={true}
      titleStyle={style.flatten(["text-center"]) as ViewStyle}
    >
      <Text style={style.flatten(["text-center", "color-white"]) as ViewStyle}>
        {subtitle}
      </Text>
      <View
        style={
          style.flatten([
            "flex-row",
            "justify-between",
            "margin-y-24",
          ]) as ViewStyle
        }
      >
        <BlurButton
          text="Cancel"
          backgroundBlur={false}
          borderRadius={32}
          onPress={() => {
            select(false);
            close();
          }}
          containerStyle={
            style.flatten([
              "border-width-1",
              "padding-y-6",
              "margin-y-2",
              "border-color-gray-300",
              "width-160",
              "justify-center",
            ]) as ViewStyle
          }
          textStyle={style.flatten(["body3", "color-white"]) as ViewStyle}
        />
        <BlurButton
          text="Remove"
          backgroundBlur={false}
          borderRadius={32}
          onPress={() => {
            select(true);
            close();
          }}
          containerStyle={
            style.flatten([
              "border-width-1",
              "border-color-gray-300",
              "padding-x-20",
              "padding-y-6",
              "margin-y-2",
              "width-160",
              "justify-center",
            ]) as ViewStyle
          }
          textStyle={style.flatten(["body3", "color-white"]) as ViewStyle}
        />
      </View>
    </CardModal>
  );
};
