import React, { FunctionComponent, useState } from "react";
import { SettingItem } from "screens/setting/components";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import delay from "delay";
import { PasswordInputModal } from "modals/password-input/modal";
import { Platform, Switch, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { FingerPrintIconWithoutCircle } from "components/new/icon/finger-print";

export const SettingBiometricLockItem: FunctionComponent = observer(() => {
  const { keychainStore } = useStore();

  const style = useStyle();

  const [isOpenModal, setIsOpenModal] = useState(false);
  /*
    isTurnOffBiometryFallback indicates that the modal is for turning off the biometry
    when failing to check the password to turn off by the biometry.
    This is mainly used to give the chance to the user when the biometry information changed after turning on the biometry sign-in.
   */
  const [isTurnOffBiometryFallback, setIsTurnOffBiometryFallback] =
    useState(false);

  return (
    <React.Fragment>
      <PasswordInputModal
        title={
          !isTurnOffBiometryFallback
            ? "Enable Biometric Authentication"
            : "Disable Biometric Authentication"
        }
        isOpen={isOpenModal}
        close={() => {
          setIsOpenModal(false);
          setIsTurnOffBiometryFallback(false);
        }}
        onEnterPassword={async (password) => {
          // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
          // So to make sure that the loading state changes, just wait very short time.
          await delay(10);

          if (!isTurnOffBiometryFallback) {
            await keychainStore.turnOnBiometry(password);
          } else {
            await keychainStore.turnOffBiometryWithPassword(password);
          }
        }}
      />
      <SettingItem
        label="Use biometric authentication"
        left={<FingerPrintIconWithoutCircle size={16} />}
        right={
          <Switch
            trackColor={{
              false: "#767577",
              true: Platform.OS === "ios" ? "#ffffff00" : "#767577",
            }}
            thumbColor={keychainStore.isBiometryOn ? "#5F38FB" : "#D0BCFF66"}
            style={[
              {
                borderRadius: 16,
                borderWidth: 1,
                // transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
              },
              style.flatten(["border-color-pink-light@40%"]),
            ]}
            onValueChange={async (value) => {
              if (value) {
                setIsOpenModal(true);
                setIsTurnOffBiometryFallback(false);
              } else {
                try {
                  await keychainStore.turnOffBiometry();
                } catch (e) {
                  console.log(e);
                  setIsOpenModal(true);
                  setIsTurnOffBiometryFallback(true);
                }
              }
            }}
            value={keychainStore.isBiometryOn}
          />
        }
        style={style.flatten(["height-72", "padding-18"]) as ViewStyle}
      />
    </React.Fragment>
  );
});
