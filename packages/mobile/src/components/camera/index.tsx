import React, { FunctionComponent } from "react";
import { RNCamera } from "react-native-camera";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useStyle } from "../../styles";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CloseIcon } from "../icon";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingSpinner } from "../spinner";

export const FullScreenCameraView: FunctionComponent<
  React.ComponentProps<typeof RNCamera> & {
    containerBottom?: React.ReactElement;
    isLoading?: boolean;
  }
> = (props) => {
  const style = useStyle();

  const navigation = useNavigation();

  const isFocused = useIsFocused();

  const {
    children,
    containerBottom,
    isLoading,
    style: propStyle,
    ...rest
  } = props;

  return (
    <React.Fragment>
      {isFocused ? (
        <RNCamera
          style={StyleSheet.flatten([
            style.flatten(["absolute-fill"]),
            propStyle,
          ])}
          {...rest}
        />
      ) : null}
      <SafeAreaView style={style.flatten(["absolute-fill", "items-center"])}>
        <View style={style.flatten(["flex-row"])}>
          <View style={style.get("flex-1")} />
          {navigation.canGoBack() ? (
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
            >
              <View
                style={style.flatten([
                  "width-38",
                  "height-38",
                  "border-radius-64",
                  "background-color-primary-50",
                  "opacity-90",
                  "margin-top-8",
                  "margin-right-16",
                  "items-center",
                  "justify-center",
                ])}
              >
                <CloseIcon
                  size={28}
                  color={style.get("color-primary-300").color}
                />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={style.get("flex-1")} />
        <View>
          <Svg width="217" height="217" fill="none" viewBox="0 0 217 217">
            <Path
              stroke={style.get("color-primary").color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="6"
              d="M34 3H3v31M3 183v31h31M183 3h31v31M214 183v31h-31"
            />
          </Svg>
          {isLoading ? (
            <View
              style={style.flatten([
                "absolute-fill",
                "items-center",
                "justify-center",
              ])}
            >
              <View
                style={style.flatten([
                  "padding-x-32",
                  "padding-top-48",
                  "padding-bottom-31",
                  "background-color-camera-loading-background",
                  "border-radius-8",
                  "items-center",
                ])}
              >
                <LoadingSpinner
                  size={42}
                  color={style.get("color-primary").color}
                />
                <Text
                  style={style.flatten([
                    "subtitle1",
                    "color-text-black-low",
                    "margin-top-34",
                  ])}
                >
                  Loading...
                </Text>
              </View>
            </View>
          ) : null}
        </View>
        {containerBottom}
        <View style={style.get("flex-1")} />
      </SafeAreaView>
      {children}
    </React.Fragment>
  );
};
