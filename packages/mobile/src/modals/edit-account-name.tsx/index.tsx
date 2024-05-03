import React, { FunctionComponent, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { TextInput } from "components/input";
import { Button } from "components/button";
import { KeyboardSpacerView } from "components/keyboard";
import { ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { BorderlessButton } from "react-native-gesture-handler";
import { IconButton } from "components/new/button/icon";
import { XmarkIcon } from "components/new/icon/xmark";

export const EditAccountNameModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  isReadOnly: boolean;
  paragraph?: string;
  onEnterName: (password: string) => Promise<void>;
}> = registerModal(
  ({ close, title, onEnterName, isOpen, isReadOnly }) => {
    const [newName, setNewName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isInvalidName, setIsInvalidName] = useState(false);
    const style = useStyle();

    const submitNewName = async () => {
      if (newName.length == 0) {
        setIsInvalidName(true);
        return;
      }

      setIsLoading(true);
      try {
        await onEnterName(newName);
        setIsInvalidName(false);
        setNewName("");
        close();
      } catch (e) {
        console.log(e);
        setIsInvalidName(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isOpen) {
      return null;
    }

    return (
      <CardModal
        title={title}
        cardStyle={style.flatten(["padding-bottom-32"]) as ViewStyle}
        right={
          <BorderlessButton
            rippleColor={style.get("color-rect-button-default-ripple").color}
            activeOpacity={0.3}
            onPress={() => close()}
          >
            <IconButton
              icon={<XmarkIcon color={"white"} />}
              backgroundBlur={false}
              blurIntensity={20}
              borderRadius={50}
              iconStyle={
                style.flatten([
                  "padding-12",
                  "border-width-1",
                  "border-color-gray-400",
                ]) as ViewStyle
              }
            />
          </BorderlessButton>
        }
      >
        <TextInput
          label="New account name"
          onChangeText={(text) => {
            if (!isReadOnly) setNewName(text);
          }}
          value={newName}
          maxLength={30}
          error={isInvalidName ? "Name is required" : undefined}
          returnKeyType="done"
          onSubmitEditing={submitNewName}
        />
        <Button
          text="Save"
          size="large"
          loading={isLoading}
          onPress={submitNewName}
          disabled={!newName}
        />
        <KeyboardSpacerView />
      </CardModal>
    );
  },
  {
    disableSafeArea: true,
    blurBackdropOnIOS: true,
  }
);
