import React, { FunctionComponent, useState } from "react";
import { SettingItem } from "../components";
import { Toggle } from "../../../../components/staging/toggle";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import delay from "delay";
import { PasswordInputModal } from "../../../../modals/staging/password-input/modal";

export const SettingBiometricLockItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { keychainStore } = useStore();

  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <React.Fragment>
      <PasswordInputModal
        title="Turn On Biometry"
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        onEnterPassword={async (password) => {
          // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread
          // So to make sure that the loading state changes, just wait very short time.
          await delay(10);
          await keychainStore.turnOnBiometry(password);
        }}
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
        topBorder={topBorder}
      />
    </React.Fragment>
  );
});
