import React, { FunctionComponent } from "react";
import { registerModal } from "../../modals/base";
import { useStyle } from "../../styles";
import { Text, View } from "react-native";
import { Button } from "../../components/button";

export const ConfirmModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;

  title: string;
  paragraph?: string;

  yesButtonText: string;
  noButtonText: string;

  onSelectYes: () => void;
  onSelectNo: () => void;
}> = registerModal(
  ({
    close,
    title,
    paragraph,
    yesButtonText,
    noButtonText,
    onSelectYes,
    onSelectNo,
  }) => {
    const style = useStyle();

    return (
      <View style={style.flatten(["padding-page"])}>
        <View
          style={style.flatten([
            "border-radius-8",
            "overflow-hidden",
            "background-color-white",
            "dark:background-color-platinum-600",
            "padding-x-20",
            "padding-y-28",
            "items-center",
          ])}
        >
          <Text
            style={style.flatten([
              "h3",
              "color-text-middle",
              "margin-bottom-8",
            ])}
          >
            {title}
          </Text>
          {paragraph ? (
            <Text
              style={style.flatten([
                "body2",
                "color-text-low",
                "margin-bottom-16",
                "text-center",
              ])}
            >
              {paragraph}
            </Text>
          ) : null}
          <View style={style.flatten(["flex-row"])}>
            <Button
              containerStyle={style.flatten(["flex-1"])}
              text={noButtonText}
              mode="light"
              onPress={() => {
                onSelectNo();
                close();
              }}
            />
            <View style={style.flatten(["width-12"])} />
            <Button
              containerStyle={style.flatten(["flex-1"])}
              text={yesButtonText}
              onPress={() => {
                onSelectYes();
                close();
              }}
            />
          </View>
        </View>
      </View>
    );
  },
  {
    align: "center",
  }
);
