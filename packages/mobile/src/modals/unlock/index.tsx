export {};
/*
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { registerModal, useModalState } from "../base";
import { SafeAreaView, View } from "react-native";
import { useStyle } from "../../styles";
import { GradientBackground } from "../../components/svg";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { TextInput } from "../../components/input";
import { Button } from "../../components/button";
import delay from "delay";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export const UnlockModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const { keyRingStore, interactionModalStore, keychainStore } = useStore();

    const style = useStyle();

    const modalState = useModalState();

    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFailed, setIsFailed] = useState(false);

    const tryKeychainOnce = useRef(false);
    useEffect(() => {
      if (
        !tryKeychainOnce.current &&
        !modalState.isTransitionOpening &&
        keychainStore.isBiometryOn
      ) {
        tryKeychainOnce.current = true;
        (async () => {
          setIsLoading(true);
          try {
            // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
            // So to make sure that the loading state changes, just wait very short time.
            await delay(10);
            await keychainStore.tryUnlockWithBiometry();
            interactionModalStore.popAll("/unlock");
          } catch (e) {
            console.log(e);
            setIsLoading(false);
          }
        })();
      }
    }, [
      interactionModalStore,
      keychainStore,
      keychainStore.isBiometryOn,
      modalState.isTransitionOpening,
    ]);

    const tryUnlock = async () => {
      try {
        setIsLoading(true);
        // Decryption needs slightly huge computation.
        // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
        // before the actually decryption is complete.
        // So to make sure that the loading state changes, just wait very short time.
        await delay(10);
        await keyRingStore.unlock(password);
      } catch (e) {
        console.log(e);
        setIsLoading(false);
        setIsFailed(true);
        return;
      }

      interactionModalStore.popAll("/unlock");
    };

    return (
      <View style={style.flatten(["padding-page", "flex-1"])}>
        <View style={style.flatten(["absolute-fill"])}>
          <GradientBackground />
        </View>
        <SafeAreaView style={style.flatten(["flex-1"])}>
          <KeyboardAwareScrollView
            contentContainerStyle={style.get("flex-grow-1")}
          >
            <View style={style.flatten(["flex-1"])} />
            <View>
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
            <View style={style.flatten(["flex-1"])} />
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </View>
    );
  }),
  {
    openTransitionVelocity: 0,
    closeTransitionVelocity: 1500,
    transitionAcceleration: 1,
    disableBackdrop: true,
    disableClosingOnBackdropPress: true,
    disableSafeArea: true,
    containerStyle: {
      flex: 1,
    },
  }
);
 */
