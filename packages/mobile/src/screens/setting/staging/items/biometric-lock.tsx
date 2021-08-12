import React, { FunctionComponent, useState } from "react";
import { SettingItem } from "../components";
import { Toggle } from "../../../../components/staging/toggle";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { registerModal } from "../../../../modals/staging/base";
import { Text, View } from "react-native";
import { CardModal } from "../../../../modals/staging/card";
import { useStyle } from "../../../../styles";
import { TextInput } from "../../../../components/staging/input";
import { Button } from "../../../../components/staging/button";
import delay from "delay";

export const SettingBiometricLockItem: FunctionComponent = observer(() => {
  const { keychainStore } = useStore();

  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <React.Fragment>
      <TurnOnBiometryModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
      />
      <SettingItem
        label="Biometric"
        right={
          <Toggle
            on={keychainStore.isBiometryOn}
            onChange={(value) => {
              if (value) {
                setIsOpenModal(true);
              } else {
                keychainStore.turnOffBiometry();
              }
            }}
          />
        }
      />
    </React.Fragment>
  );
});

export const TurnOnBiometryModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(({ close }: { isOpen: boolean; close: () => void }) => {
    const { keychainStore } = useStore();

    const style = useStyle();

    const [password, setPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);

    const tryTurnOnBiometry = async () => {
      try {
        setIsLoading(true);
        // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
        // So to make sure that the loading state changes, just wait very short time.
        await delay(10);
        await keychainStore.turnOnBiometry(password);
        setIsInvalid(false);
        close();
      } catch (e) {
        console.log(e);

        setIsLoading(false);
        setIsInvalid(true);
      }
    };

    return (
      <CardModal title="Biometry">
        <Text style={style.flatten(["h6", "color-text-black-medium"])}>
          Type password to turn on biometry
        </Text>
        <View style={style.get("height-40")} />
        <TextInput
          label="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
          }}
          error={isInvalid ? "Invalid password" : undefined}
          returnKeyType="done"
          onSubmitEditing={tryTurnOnBiometry}
        />
        <View style={style.get("height-40")} />
        <Button
          text="Confirm"
          size="large"
          loading={isLoading}
          onPress={tryTurnOnBiometry}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
