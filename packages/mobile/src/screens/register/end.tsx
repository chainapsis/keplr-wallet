import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithView } from "../../components/page";
import { useStyle } from "../../styles";
import { View, Text } from "react-native";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Toggle } from "../../components/toggle";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WelcomeRocket from "../../assets/svg/welcome-rocket.svg";

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
    <PageWithView style={style.flatten(["padding-x-42"])}>
      <View style={style.get("flex-1")} />
      <View style={style.flatten(["items-center"])}>
        <WelcomeRocket width={358} height={254} />

        <Text
          style={style.flatten([
            "h2",
            "color-text-black-medium",
            "margin-top-18",
          ])}
        >
          You’re all set!
        </Text>
        <Text
          style={style.flatten([
            "subtitle1",
            "color-text-black-low",
            "text-center",
            "margin-top-10",
          ])}
        >
          Your cosmic interchain journey now begins.
        </Text>
      </View>
      {password && keychainStore.isBiometrySupported ? (
        <View
          style={style.flatten(["flex-row", "margin-top-58", "items-center"])}
        >
          <Text style={style.flatten(["subtitle1", "color-text-black-medium"])}>
            Enable Biometric
          </Text>
          <View style={style.get("flex-1")} />
          <Toggle
            on={isBiometricOn}
            onChange={(value) => setIsBiometricOn(value)}
          />
        </View>
      ) : null}
      <Button
        containerStyle={style.flatten(["margin-top-44"])}
        size="large"
        text="Done"
        loading={isLoading}
        onPress={async () => {
          setIsLoading(true);
          try {
            if (password && isBiometricOn) {
              await keychainStore.turnOnBiometry(password);
            }

            // Definetly, the last key is newest keyring.
            if (keyRingStore.multiKeyStoreInfo.length > 0) {
              await keyRingStore.changeKeyRing(
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
      <View style={style.get("flex-1")} />
    </PageWithView>
  );
});
