import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PanGestureHandler } from "react-native-gesture-handler";

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
        "padding-16",
        "padding-top-0",
        "overflow-hidden",
      ])}
    >
      <View
        style={{
          paddingBottom: safeAreaInsets.bottom,
        }}
      >
        <PanGestureHandler
          onGestureEvent={(e) => {}}
          onHandlerStateChange={(e) => {}}
        >
          <View>
            <View
              style={style.flatten([
                "items-center",
                "margin-top-8",
                "margin-bottom-15",
              ])}
            >
              <View
                style={style.flatten([
                  "width-58",
                  "height-5",
                  "border-radius-16",
                  "background-color-card-modal-handle",
                ])}
              />
            </View>
            <Text
              style={style.flatten([
                "h4",
                "color-text-black-high",
                "margin-bottom-15",
              ])}
            >
              {title}
            </Text>
          </View>
        </PanGestureHandler>
        <View
          style={style.flatten([
            "margin-bottom-15",
            "height-1",
            "background-color-border-white",
          ])}
        />
        {children}
      </View>
    </View>
  );
};
