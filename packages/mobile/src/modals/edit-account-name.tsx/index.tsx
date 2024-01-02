import React, { FunctionComponent, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { TextInput } from "../../components/input";
import { Button } from "../../components/button";
import { KeyboardSpacerView } from "../../components/keyboard";

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
      <CardModal title={title}>
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
  }
);
