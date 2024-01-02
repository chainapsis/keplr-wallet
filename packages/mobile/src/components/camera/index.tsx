import React, { FunctionComponent } from "react";
import { Camera, CameraProps, PermissionStatus } from "expo-camera";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useStyle } from "../../styles";
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CloseIcon } from "../icon";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingSpinner } from "../spinner";
import { CameraPermissionView } from "./camera-permission-view";

interface CameraProp extends CameraProps {
  containerBottom?: React.ReactElement;
  isLoading?: boolean;
}

export const FullScreenCameraView: FunctionComponent<CameraProp> = (props) => {
  const style = useStyle();

  const navigation = useNavigation();

  const isFocused = useIsFocused();

  const { children, containerBottom, isLoading, ...rest } = props;

  const [permission, requestPermission] = Camera.useCameraPermissions();

  const handleOpenSettings = async () => {
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:");
    } else {
      await Linking.openSettings();
    }
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <CameraPermissionView
        onPress={async () => {
          const permissionStatus = await requestPermission();
          if (
            !permission?.granted &&
            permissionStatus.status === PermissionStatus.DENIED
          ) {
            await handleOpenSettings();
          }
        }}
      />
    );
  }

  return (
    <React.Fragment>
      {isFocused ? (
        <Camera
          style={StyleSheet.flatten([style.flatten(["absolute-fill"])])}
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
                style={
                  style.flatten([
                    "width-38",
                    "height-38",
                    "border-radius-64",
                    "background-color-blue-100",
                    "dark:background-color-platinum-500",
                    "opacity-90",
                    "margin-top-8",
                    "margin-right-16",
                    "items-center",
                    "justify-center",
                  ]) as ViewStyle
                }
              >
                <CloseIcon
                  size={28}
                  color={
                    style.flatten(["color-blue-400", "dark:color-platinum-50"])
                      .color
                  }
                />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={style.get("flex-1")} />
        <View>
          <Svg width="217" height="217" fill="none" viewBox="0 0 217 217">
            <Path
              stroke={style.get("color-blue-400").color}
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
                style={
                  style.flatten([
                    "padding-x-32",
                    "padding-top-48",
                    "padding-bottom-31",
                    "background-color-card",
                    "border-radius-8",
                    "items-center",
                  ]) as ViewStyle
                }
              >
                <LoadingSpinner
                  size={42}
                  color={
                    style.flatten(["color-blue-400", "dark:color-platinum-100"])
                      .color
                  }
                />
                <Text
                  style={
                    style.flatten([
                      "subtitle1",
                      "color-text-low",
                      "margin-top-34",
                    ]) as ViewStyle
                  }
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
