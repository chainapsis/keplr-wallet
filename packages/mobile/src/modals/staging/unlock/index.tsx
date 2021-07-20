import React, { FunctionComponent, useState } from "react";
import { registerModal } from "../base";
import { View } from "react-native";
import { useStyle } from "../../../styles";
import { GradientBackground } from "../../../components/svg";
import { useStore } from "../../../stores";
import { observer } from "mobx-react-lite";
import { TextInput } from "../../../components/staging/input";
import { Button } from "../../../components/staging/button";

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
        await keyRingStore.unlock(password);
      } catch (e) {
        console.log(e);
        setIsFailed(true);
        return;
      } finally {
        setIsLoading(false);
      }
      interactionModalStore.popAll("/unlock");
    };

    return (
      <View style={style.flatten(["padding-12"])}>
        <View style={style.flatten(["absolute-fill"])}>
          <GradientBackground />
        </View>
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
      </View>
    );
  })
);
