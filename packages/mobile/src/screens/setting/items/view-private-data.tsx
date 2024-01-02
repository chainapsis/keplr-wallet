import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { SettingItem } from "../components";
import { PasswordInputModal } from "../../../modals/password-input/modal";
import { useStore } from "../../../stores";
import { getPrivateDataTitle } from "../screens/view-private-data";
import { useSmartNavigation } from "../../../navigation";

export const SettingViewPrivateDataItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { keyRingStore } = useStore();

  const smartNavigation = useSmartNavigation();

  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <React.Fragment>
      <SettingItem
        label={getPrivateDataTitle(keyRingStore.keyRingType)}
        onPress={() => {
          setIsOpenModal(true);
        }}
        topBorder={topBorder}
      />
      <PasswordInputModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        title={getPrivateDataTitle(keyRingStore.keyRingType, true)}
        onEnterPassword={async (password) => {
          const index = keyRingStore.multiKeyStoreInfo.findIndex(
            (keyStore) => keyStore.selected
          );

          if (index >= 0) {
            const privateData = await keyRingStore.showKeyRing(index, password);
            smartNavigation.navigateSmart("Setting.ViewPrivateData", {
              privateData,
              privateDataType: keyRingStore.keyRingType,
            });
          }
        }}
      />
    </React.Fragment>
  );
});
