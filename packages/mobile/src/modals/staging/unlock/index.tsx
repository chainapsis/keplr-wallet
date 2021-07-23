import React, { FunctionComponent, useState } from "react";
import { registerModal } from "../base";
import { SafeAreaView, View } from "react-native";
import { useStyle } from "../../../styles";
import { GradientBackground } from "../../../components/svg";
import { useStore } from "../../../stores";
import { observer } from "mobx-react-lite";
import { TextInput } from "../../../components/staging/input";
import { Button } from "../../../components/staging/button";
import delay from "delay";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export const UnlockModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const { keyRingStore, interactionModalStore } = useStore();

    const style = useStyle();

    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFailed, setIsFailed] = useState(false);

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
      <View style={style.flatten(["padding-12", "flex-1"])}>
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
    openTransitionDuration: 0,
    disableBackdrop: true,
    disableClosingOnBackdropPress: true,
    disableSafeArea: true,
    containerStyle: {
      flex: 1,
    },
  }
);
