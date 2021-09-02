import React, { FunctionComponent, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { useStore } from "../../../stores";
import { Button } from "../../../components/staging/button";
import { observer } from "mobx-react-lite";
import { TextInput } from "../../../components/staging/input";
import { flowResult } from "mobx";
import { useSmartNavigation } from "../../../navigation";

export const PasswordModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  smartNavigation: ReturnType<typeof useSmartNavigation>;
}> = registerModal(
  observer(({ close, title, smartNavigation }) => {
    const { keyRingStore } = useStore();
    const style = useStyle();

    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFailed, setIsFailed] = useState(false);

    const approve = async () => {
      try {
        setIsLoading(true);

        const keyStoreIndex = keyRingStore.multiKeyStoreInfo.findIndex(
          (keyStore) => keyStore.selected
        );
        const newKeyRing = await flowResult(
          keyRingStore.showKeyRing(keyStoreIndex, password)
        );

        smartNavigation.navigateSmart("Setting.ViewPrivateData", {
          privateData: newKeyRing,
          privateDataType: keyRingStore.keyRingType,
        });
        close();
      } catch (e) {
        console.log(e);
        setIsLoading(false);
        setIsFailed(true);
      }
    };

    return (
      <CardModal title={title}>
        <View>
          <Text
            style={style.flatten([
              "color-text-black-medium",
              "margin-bottom-32",
            ])}
          >
            Enter your password to continue.
          </Text>
          <View>
            <TextInput
              label="Password"
              returnKeyType="done"
              secureTextEntry={true}
              value={password}
              error={isFailed ? "Invalid password" : undefined}
              onChangeText={setPassword}
              onSubmitEditing={approve}
            />
            <Button text="Approve" loading={isLoading} onPress={approve} />
          </View>
        </View>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
