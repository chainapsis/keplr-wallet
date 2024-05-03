import { IconButton } from "components/new/button/icon";
import { XmarkIcon } from "components/new/icon/xmark";
import React, { FunctionComponent } from "react";
import { Dimensions, StyleSheet, Text, View, ViewStyle } from "react-native";
import Modal from "react-native-modal";
import { useStyle } from "styles/index";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export const CardModal: FunctionComponent<{
  isOpen: boolean;
  title?: string;
  close?: () => void;
  showCloseButton?: boolean;
  childrenContainerStyle?: ViewStyle;
  cardStyle?: ViewStyle;
  titleStyle?: ViewStyle;
  disableGesture?: boolean;
}> = ({
  isOpen,
  title,
  close,
  showCloseButton = true,
  children,
  childrenContainerStyle,
  disableGesture = false,
  cardStyle,
  titleStyle,
}) => {
  const style = useStyle();
  const windowHeight = Dimensions.get("window").height;

  return (
    <Modal
      testID={"modal"}
      isVisible={isOpen}
      style={{
        justifyContent: "flex-end",
        margin: 0,
      }}
      onBackButtonPress={close}
      onBackdropPress={close}
      animationType="slide"
      animationInTiming={500}
      animationOutTiming={500}
      backdropColor={style.get("color-indigo-backdrop").color}
    >
      <GestureHandlerRootView>
        <View
          style={[
            StyleSheet.flatten([
              style.flatten([
                "background-color-indigo-900",
                "border-radius-top-left-32",
                "border-radius-top-right-32",
                "overflow-hidden",
              ]),
            ]) as ViewStyle,
            cardStyle,
            {
              maxHeight: windowHeight - 24,
            },
          ]}
        >
          <View
            style={style.flatten(["padding-x-10", "margin-y-12"]) as ViewStyle}
          >
            <View
              style={
                style.flatten(["items-center", "margin-bottom-16"]) as ViewStyle
              }
            >
              {!disableGesture ? (
                <View style={style.flatten(["margin-top-10"]) as ViewStyle} />
              ) : null}
            </View>

            <View
              style={
                style.flatten([
                  "flex-row",
                  "items-center",
                  "justify-between",
                  "margin-x-10",
                ]) as ViewStyle
              }
            >
              {title ? (
                <Text
                  style={
                    [
                      style.flatten([
                        "subtitle2",
                        "color-text-high",
                        "color-white",
                        "flex-3",
                      ]),
                      titleStyle,
                    ] as ViewStyle
                  }
                >
                  {title}
                </Text>
              ) : null}
              {showCloseButton && close ? (
                <View style={style.flatten(["flex-1", "items-end"])}>
                  <IconButton
                    icon={<XmarkIcon color={"white"} />}
                    backgroundBlur={false}
                    blurIntensity={20}
                    borderRadius={50}
                    iconStyle={
                      style.flatten([
                        "width-32",
                        "height-32",
                        "items-center",
                        "justify-center",
                        "border-width-1",
                        "border-color-white@20%",
                      ]) as ViewStyle
                    }
                    onPress={() => close()}
                  />
                </View>
              ) : null}
            </View>
          </View>
          <KeyboardAwareScrollView
            style={StyleSheet.flatten([
              style.flatten(["padding-x-20", "padding-top-12"]) as ViewStyle,
              childrenContainerStyle,
            ])}
          >
            {children}
            <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
          </KeyboardAwareScrollView>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};
