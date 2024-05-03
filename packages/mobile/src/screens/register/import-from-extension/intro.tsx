import React, { FunctionComponent, useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { PageWithView } from "components/page";
import { Linking, Platform, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { Button } from "components/button";
import ImportFromExtensionSvg from "assets/svg/import-from-extension.svg";
import { useSmartNavigation } from "navigation/smart-navigation";
import { IconWithText } from "components/new/icon-with-text/icon-with-text";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { Camera, PermissionStatus } from "expo-camera";
import { CameraPermissionModal } from "components/new/camera-permission-model/camera-permission";
import { observer } from "mobx-react-lite";
import { CameraPermissionOffIcon } from "components/new/icon/camerapermission-off";
import { CameraPermissionOnIcon } from "components/new/icon/camerapermission-on";

export enum ModelStatus {
  First = "first",
  Second = "second",
}

export const handleOpenSettings = async () => {
  if (Platform.OS === "ios") {
    await Linking.openURL("app-settings:");
  } else {
    await Linking.openSettings();
  }
};

export const ImportFromExtensionIntroScreen: FunctionComponent = observer(
  () => {
    const route = useRoute<
      RouteProp<
        Record<
          string,
          {
            registerConfig: RegisterConfig;
          }
        >,
        string
      >
    >();

    const smartNavigation = useSmartNavigation();
    const style = useStyle();
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [openCameraModel, setIsOpenCameraModel] = useState(false);
    const [modelStatus, setModelStatus] = useState(ModelStatus.First);

    return (
      <PageWithView backgroundMode="image">
        <View
          style={style.flatten(["padding-page", "flex-grow-1"]) as ViewStyle}
        >
          <View style={style.get("flex-2")} />
          <IconWithText
            icon={<ImportFromExtensionSvg />}
            title={"Import from Fetch extension"}
            subtitle={`Import your account(s) by going to\n‘Settings > Link Fetch Mobile’ on Fetch Extension and scanning the QR Code`}
            iconStyle={style.flatten(["margin-bottom-24"]) as ViewStyle}
            titleStyle={
              style.flatten([
                "h3",
                "margin-x-20",
                "text-center",
                "font-medium",
              ]) as ViewStyle
            }
            subtitleStyle={style.flatten(["subtitle3"]) as ViewStyle}
          />
          <BlurBackground
            borderRadius={12}
            backgroundBlur={false}
            containerStyle={
              style.flatten([
                "margin-x-10",
                "margin-top-10",
                "background-color-cardColor@25%",
              ]) as ViewStyle
            }
          >
            <Text
              style={
                style.flatten([
                  "subtitle3",
                  "color-white",
                  "text-center",
                  "margin-x-24",
                  "margin-y-14",
                ]) as ViewStyle
              }
            >
              Ledger accounts need to be imported separately
            </Text>
          </BlurBackground>
          <View style={style.get("flex-3")} />
          <Button
            text="Continue"
            size="large"
            containerStyle={style.flatten(["border-radius-32"]) as ViewStyle}
            onPress={() => {
              if (permission?.status == PermissionStatus.UNDETERMINED) {
                setIsOpenCameraModel(true);
              } else {
                if (!permission?.granted) {
                  setModelStatus(ModelStatus.Second);
                  setIsOpenCameraModel(true);
                } else {
                  smartNavigation.navigateSmart(
                    "Register.ImportFromExtension",
                    {
                      registerConfig: route.params.registerConfig,
                    }
                  );
                }
              }
            }}
          />
        </View>
        <CameraPermissionModal
          title={
            modelStatus == ModelStatus.First
              ? "Camera permission"
              : "Camera permission is disabled"
          }
          icon={
            modelStatus == ModelStatus.First ? (
              <CameraPermissionOffIcon />
            ) : (
              <CameraPermissionOnIcon />
            )
          }
          buttonText={
            modelStatus == ModelStatus.First
              ? "Allow Fetch to use camera"
              : "Enable camera permission in settings"
          }
          isOpen={openCameraModel}
          close={() => setIsOpenCameraModel(false)}
          onPress={async () => {
            const permissionStatus = await requestPermission();
            if (
              !permission?.granted &&
              permissionStatus.status === PermissionStatus.DENIED
            ) {
              if (permissionStatus.canAskAgain) {
                setIsOpenCameraModel(false);
              } else {
                await handleOpenSettings();
                setIsOpenCameraModel(false);
              }
            } else {
              setIsOpenCameraModel(false);
              if (permissionStatus.status === PermissionStatus.GRANTED) {
                smartNavigation.navigateSmart("Register.ImportFromExtension", {
                  registerConfig: route.params.registerConfig,
                });
              }
            }
          }}
        />
      </PageWithView>
    );
  }
);
