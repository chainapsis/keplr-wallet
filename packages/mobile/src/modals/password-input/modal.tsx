import React, { FunctionComponent, useState } from "react";
import { ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { CardModal } from "../card";
import { Button } from "components/button";
import { KeyboardSpacerView } from "components/keyboard";
import { InputCardView } from "components/new/card-view/input-card";
import { IconButton } from "components/new/button/icon";
import { EyeIcon } from "components/new/icon/eye";
import { HideEyeIcon } from "components/new/icon/hide-eye-icon";

export const PasswordInputModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  /**
   * If any error thrown in the `onEnterPassword`, the password considered as invalid password.
   * @param password
   */
  onEnterPassword: (password: string) => Promise<void>;
}> = ({ close, title, onEnterPassword, isOpen }) => {
  const style = useStyle();

  const [password, setPassword] = useState("");
  const [isInvalidPassword, setIsInvalidPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <CardModal
      isOpen={isOpen}
      close={close}
      title={title}
      cardStyle={style.flatten(["padding-bottom-12"]) as ViewStyle}
    >
      <InputCardView
        label="Password"
        keyboardType={"default"}
        rightIcon={
          !showPassword ? (
            <IconButton
              icon={<EyeIcon />}
              backgroundBlur={false}
              onPress={() => {
                setShowPassword(!showPassword);
              }}
            />
          ) : (
            <IconButton
              icon={<HideEyeIcon />}
              backgroundBlur={false}
              onPress={() => {
                setShowPassword(!showPassword);
              }}
            />
          )
        }
        secureTextEntry={!showPassword}
        error={isInvalidPassword ? "Invalid password" : undefined}
        onChangeText={(text: string) => {
          setPassword(text.trim());
          setIsInvalidPassword(false);
        }}
        value={password}
        returnKeyType="done"
        onSubmitEditing={submitPassword}
        containerStyle={style.flatten(["margin-bottom-8"]) as ViewStyle}
      />
      <Button
        text="Continue"
        size="large"
        loading={isLoading}
        onPress={submitPassword}
        disabled={!password}
        containerStyle={
          style.flatten(["border-radius-32", "margin-y-20"]) as ViewStyle
        }
      />
      <KeyboardSpacerView />
    </CardModal>
  );
};
