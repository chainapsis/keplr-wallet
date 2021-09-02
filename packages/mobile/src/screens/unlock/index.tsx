import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../styles";
import FastImage from "react-native-fast-image";
import * as SplashScreen from "expo-splash-screen";
import { TextInput } from "../../components/staging/input";
import { Button } from "../../components/staging/button";
import delay from "delay";
import { useStore } from "../../stores";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { StackActions, useNavigation } from "@react-navigation/native";
import { KeyRingStatus } from "@keplr-wallet/background";

/**
 * UnlockScreen is expected to be opened when the keyring store's state is "not loaded (yet)" or "locked" at launch.
 * And, this screen has continuity with the splash screen
 * @constructor
 */
export const UnlockScreen: FunctionComponent = observer(() => {
  const { keyRingStore, keychainStore } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const tryKeychainOnce = useRef(false);
  useEffect(() => {
    if (!tryKeychainOnce.current && keychainStore.isBiometryOn) {
      tryKeychainOnce.current = true;

      (async () => {
        setIsLoading(true);
        try {
          // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
          // So to make sure that the loading state changes, just wait very short time.
          await delay(10);
          await keychainStore.tryUnlockWithBiometry();

          // Splash screen is not hided automatically. (See app.tsx)
          console.log("Will hide splash screen");
          await SplashScreen.hideAsync();

          navigation.dispatch(StackActions.replace("MainTabDrawer"));
        } catch (e) {
          console.log(e);
          setIsLoading(false);
        }
      })();
    }
  }, [keychainStore, keychainStore.isBiometryOn, navigation]);

  const tryUnlock = async () => {
    try {
      setIsLoading(true);
      // Decryption needs slightly huge computation.
      // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
      // before the actually decryption is complete.
      // So to make sure that the loading state changes, just wait very short time.
      await delay(10);
      await keyRingStore.unlock(password);

      navigation.dispatch(StackActions.replace("MainTabDrawer"));
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      setIsFailed(true);
      return;
    }
  };

  const routeToRegisterOnce = useRef(false);
  useEffect(() => {
    // If the keyring is empty,
    // route to the register screen.
    if (
      !routeToRegisterOnce.current &&
      keyRingStore.status === KeyRingStatus.EMPTY
    ) {
      routeToRegisterOnce.current = true;
      navigation.dispatch(
        StackActions.replace("Register", {
          screen: "Register.Intro",
        })
      );
    }
  }, [keyRingStore.status, navigation]);

  return (
    <View
      style={style.flatten(["flex-1", "background-color-splash-background"])}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={style.flatten(["flex-grow-1"])}
      >
        <View style={style.get("flex-5")} />
        <Image
          style={StyleSheet.flatten([style.flatten(["width-full"])])}
          fadeDuration={0}
          resizeMode={FastImage.resizeMode.contain}
          source={require("../../assets/logo/splash-image.png")}
          onLoadEnd={async () => {
            // Splash screen is not hided automatically. (See app.tsx)
            // To prevent the fickering, hide the splash screen right after the mocking splash image is fully loaded.
            console.log("Will hide splash screen");
            await SplashScreen.hideAsync();
          }}
        />
        <View style={style.get("flex-3")} />
        <View style={style.flatten(["padding-x-page"])}>
          <TextInput
            label="Password"
            returnKeyType="done"
            secureTextEntry={true}
            value={password}
            error={isFailed ? "Invalid password" : undefined}
            onChangeText={setPassword}
            onSubmitEditing={tryUnlock}
          />
          <Button text="Sign in" loading={isLoading} onPress={tryUnlock} />
        </View>
        <View style={style.get("flex-7")} />
      </KeyboardAwareScrollView>
    </View>
  );
});
