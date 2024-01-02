import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithView } from "../../components/page";
import { useStyle } from "../../styles";
import { View, Text, ViewStyle, Image } from "react-native";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Toggle } from "../../components/toggle";
import delay from "delay";

export const RegisterEndScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          password?: string;
        }
      >,
      string
    >
  >();

  const password = route.params?.password;

  const [isBiometricOn, setIsBiometricOn] = useState(false);

  useEffect(() => {
    if (password && keychainStore.isBiometrySupported) {
      setIsBiometricOn(true);
    }
  }, [keychainStore.isBiometrySupported, password]);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <PageWithView
      backgroundMode="gradient"
      style={style.flatten(["padding-x-20"]) as ViewStyle}
    >
      <View style={style.get("flex-8")} />
      <View style={style.flatten(["items-center"])}>
        {style.theme === "dark" ? (
          <Image
            style={{ width: 400, height: 260, marginRight: -80 }}
            source={require("../../assets/image/wallet.png")}
            fadeDuration={0}
            resizeMode="stretch"
          />
        ) : (
          <Image
            style={{ width: 400, height: 260, marginRight: -80 }}
            source={require("../../assets/image/all-set.png")}
            fadeDuration={0}
            resizeMode="contain"
          />
        )}

        <Text style={style.flatten(["h2", "color-text-middle"]) as ViewStyle}>
          You’re all set!
        </Text>
        <Text
          style={
            style.flatten([
              "h4",
              "color-text-low",
              "text-center",
              "margin-top-10",
            ]) as ViewStyle
          }
        >
          Your Fetch journey now begins.
        </Text>
      </View>
      {password && keychainStore.isBiometrySupported ? (
        <View
          style={
            style.flatten([
              "flex-row",
              "margin-top-58",
              "items-center",
            ]) as ViewStyle
          }
        >
          <Text style={style.flatten(["subtitle1", "color-text-middle"])}>
            Enable Biometric
          </Text>
          <View style={style.get("flex-1")} />
          <Toggle
            on={isBiometricOn}
            onChange={(value) => setIsBiometricOn(value)}
          />
        </View>
      ) : null}
      <View style={style.get("flex-8")} />
      <Button
        containerStyle={
          style.flatten(["margin-top-44", "margin-bottom-20"]) as ViewStyle
        }
        size="large"
        text="Continue"
        loading={isLoading}
        onPress={async () => {
          setIsLoading(true);
          try {
            // Because javascript is synchronous language, the loading state change would not be delivered to the UI thread
            // So to make sure that the loading state changes, just wait very short time.
            await delay(10);

            if (password && isBiometricOn) {
              keychainStore.turnOnBiometry(password);
            }

            // Definitely, the last key is the newest keyring.
            if (keyRingStore.multiKeyStoreInfo.length > 0) {
              keyRingStore.changeKeyRing(
                keyRingStore.multiKeyStoreInfo.length - 1
              );
            }

            smartNavigation.reset({
              index: 0,
              routes: [
                {
                  name: "MainTabDrawer",
                },
              ],
            });
          } catch (e) {
            console.log(e);
            setIsLoading(false);
          }
        }}
      />
    </PageWithView>
  );
});
