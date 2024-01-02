import LottieView from "lottie-react-native";
import { PageWithView } from "../page";
import { Button } from "../button";
import { useStyle } from "../../styles";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import React, { FunctionComponent } from "react";
import { HeaderLeftButton } from "../header";
import { HeaderBackButtonIcon } from "../header/icon";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const CameraPermissionView: FunctionComponent<{
  onPress?: () => void;
}> = ({ onPress }) => {
  const style = useStyle();
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <PageWithView
      backgroundMode={null}
      disableSafeArea
      style={style.flatten(["flex-grow-1", "items-center"])}
    >
      <View
        style={{
          position: "absolute",
          zIndex: 100,
          top: safeAreaInsets.top,
          left: 8,
        }}
      >
        <HeaderLeftButton
          onPress={() => {
            navigation.goBack();
          }}
        >
          <HeaderBackButtonIcon />
        </HeaderLeftButton>
      </View>
      <View style={style.flatten(["flex-3"])} />
      <View style={style.flatten(["width-300", "height-400"]) as ViewStyle}>
        <View
          style={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            ...style.flatten(["absolute", "justify-center", "items-center"]),
          }}
        >
          <LottieView
            source={require("../../assets/lottie/camera.json")}
            autoPlay
            loop={true}
          />
        </View>
      </View>

      <Text
        style={
          style.flatten([
            "h2",
            "color-text-high",
            "margin-bottom-12",
          ]) as ViewStyle
        }
      >
        Camera Permission
      </Text>
      <View
        style={StyleSheet.flatten([
          style.flatten(["padding-x-36"]) as ViewStyle,
          {
            height: style.get("body2").lineHeight * 3,
            overflow: "visible",
          },
        ])}
      >
        <Text style={style.flatten(["body2", "text-center", "color-text-low"])}>
          We need your permission to show the camera.
        </Text>
      </View>

      <View
        style={
          style.flatten([
            "padding-x-48",
            "height-116",
            "margin-top-10",
          ]) as ViewStyle
        }
      >
        <View style={style.flatten(["flex-row", "width-full"]) as ViewStyle}>
          <Button
            containerStyle={style.flatten(["flex-1"]) as ViewStyle}
            size="large"
            text="Request Permission"
            onPress={onPress}
          />
        </View>
      </View>
      <View style={style.flatten(["flex-2"])} />
    </PageWithView>
  );
};
