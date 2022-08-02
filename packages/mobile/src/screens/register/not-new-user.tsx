import React, { FunctionComponent } from "react";
import { useHeaderHeight } from "@react-navigation/stack";
import { PageWithScrollView } from "../../components/page";
import { GoogleIcon, AppleIcon } from "../../components/icon";
import { useStyle } from "../../styles";
import {
  View,
  Text,
  Dimensions,
  Platform,
  StyleSheet,
  Image,
} from "react-native";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const RegisterNotNewUserScreen: FunctionComponent = observer(() => {
  const { keyRingStore, analyticsStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig = useRegisterConfig(keyRingStore, []);

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeightHeight = headerHeight - safeAreaInsets.top;

  return (
    <PageWithScrollView
      backgroundMode="gradient"
      contentContainerStyle={style.get("flex-grow-1")}
      style={StyleSheet.flatten([
        style.flatten(["padding-x-42"]),
        {
          paddingTop:
            Dimensions.get("window").height * 0.22 - actualHeightHeight,
          paddingBottom: Dimensions.get("window").height * 0.11,
        },
      ])}
    >
      <View
        style={style.flatten(["flex-grow-1", "items-center", "padding-x-18"])}
      >
        <Image
          source={
            style.theme === "dark"
              ? require("../../assets/logo/keplr-logo-dark-mode.png")
              : require("../../assets/logo/keplr-logo.png")
          }
          style={{
            height: 90,
            aspectRatio: 2.977,
          }}
          resizeMode="contain"
          fadeDuration={0}
        />
      </View>
      {Platform.OS === "ios" ? (
        <Button
          containerStyle={style.flatten([
            "margin-bottom-20",
            "border-width-1",
            "border-color-gray-50",
            "dark:border-color-platinum-400",
          ])}
          text="Sign in with Apple"
          leftIcon={
            <View style={style.flatten(["margin-right-6", "margin-bottom-4"])}>
              <AppleIcon />
            </View>
          }
          style={style.flatten(["background-color-white"])}
          textStyle={style.flatten(["color-black"])}
          underlayColor={
            style.flatten(["color-gray-50", "dark:color-gray-100"]).color
          }
          size="large"
          mode="light"
          onPress={() => {
            analyticsStore.logEvent("OAuth sign in started", {
              registerType: "apple",
            });
            smartNavigation.navigateSmart("Register.TorusSignIn", {
              registerConfig,
              type: "apple",
            });
          }}
        />
      ) : null}
      <Button
        containerStyle={style.flatten(["margin-bottom-20"])}
        text="Sign in with Google"
        leftIcon={
          <View style={style.flatten(["margin-right-6"])}>
            <GoogleIcon />
          </View>
        }
        size="large"
        mode="light"
        onPress={() => {
          analyticsStore.logEvent("OAuth sign in started", {
            registerType: "google",
          });
          smartNavigation.navigateSmart("Register.TorusSignIn", {
            registerConfig,
            type: "google",
          });
        }}
      />
      <Text
        style={style.flatten([
          "margin-bottom-20",
          "text-center",
          "color-text-low",
        ])}
      >
        Powered by Torus
      </Text>
      <Button
        containerStyle={style.flatten(["margin-bottom-16"])}
        text="Import existing wallet"
        size="large"
        mode="light"
        onPress={() => {
          analyticsStore.logEvent("Import account started", {
            registerType: "seed",
          });
          smartNavigation.navigateSmart("Register.RecoverMnemonic", {
            registerConfig,
          });
        }}
      />
      <Button
        text="Import from Keplr Extension"
        size="large"
        onPress={() => {
          analyticsStore.logEvent("Import account started", {
            registerType: "qr",
          });
          smartNavigation.navigateSmart("Register.ImportFromExtension.Intro", {
            registerConfig,
          });
        }}
      />
    </PageWithScrollView>
  );
});
