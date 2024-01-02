import React, { FunctionComponent, useState } from "react";
import { registerModal } from "../base";
import { Text, ViewStyle } from "react-native";
import { useStyle } from "../../styles";
import { CardModal } from "../card";
import { TextInput } from "../../components/input";
import { Button } from "../../components/button";
import { KeyboardSpacerView } from "../../components/keyboard";

export const PasswordInputModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  paragraph?: string;
  /**
   * If any error thrown in the `onEnterPassword`, the password considered as invalid password.
   * @param password
   */
  onEnterPassword: (password: string) => Promise<void>;
}> = registerModal(
  ({ close, title, paragraph, onEnterPassword, isOpen }) => {
    const style = useStyle();

    const [password, setPassword] = useState("");
    const [isInvalidPassword, setIsInvalidPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const submitPassword = async () => {
      setIsLoading(true);
      try {
        await onEnterPassword(password);
        setIsInvalidPassword(false);
        setPassword("");
        close();
      } catch (e) {
        console.log(e);
        setIsInvalidPassword(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isOpen) {
      return null;
    }

    return (
      <CardModal title={title}>
        <Text
          style={
            style.flatten([
              "body2",
              "color-text-middle",
              "margin-bottom-32",
            ]) as ViewStyle
          }
        >
          {paragraph || "Enter your password to continue"}
        </Text>
        <TextInput
          label="Password"
          error={isInvalidPassword ? "Invalid password" : undefined}
          onChangeText={(text) => {
            setPassword(text);
          }}
          value={password}
          returnKeyType="done"
          secureTextEntry={true}
          onSubmitEditing={submitPassword}
        />
        <Button
          text="Approve"
          size="large"
          loading={isLoading}
          onPress={submitPassword}
          disabled={!password}
        />
        <KeyboardSpacerView />
      </CardModal>
    );
  },
  {
    disableSafeArea: true,
    // disableClosingOnBackdropPress: true,
  }
);
