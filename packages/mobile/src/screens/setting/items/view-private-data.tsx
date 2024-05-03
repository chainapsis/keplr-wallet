import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { SettingItem } from "screens/setting/components";
import { PasswordInputModal } from "modals/password-input/modal";
import { useStore } from "stores/index";
import { useSmartNavigation } from "navigation/smart-navigation";
import { getPrivateDataTitle } from "screens/setting/screens/view-private-data";
import { useStyle } from "styles/index";
import { ViewStyle } from "react-native";
import { KeyIcon } from "components/new/icon/key";

export const SettingViewPrivateDataItem: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <React.Fragment>
      <SettingItem
        label={getPrivateDataTitle(keyRingStore.keyRingType)}
        left={<KeyIcon size={16} />}
        onPress={() => {
          setIsOpenModal(true);
        }}
        style={style.flatten(["height-72", "padding-18"]) as ViewStyle}
      />
      <PasswordInputModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        title={"Enter your password to view your mnemonic seed"}
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
