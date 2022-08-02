import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { SettingItem } from "../components";
import { useStyle } from "../../../styles";
import { PasswordInputModal } from "../../../modals/password-input/modal";
import { useStore } from "../../../stores";
import { useNavigation } from "@react-navigation/native";

export const SettingRemoveAccountItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { keychainStore, keyRingStore, analyticsStore } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <React.Fragment>
      <SettingItem
        label="Delete this wallet"
        onPress={() => {
          setIsOpenModal(true);
        }}
        containerStyle={style.flatten(["margin-top-16"])}
        labelStyle={style.flatten(["subtitle1", "color-red-400"])}
        style={style.flatten([
          "justify-center",
          "dark:background-color-red-700@30%",
        ])}
        topBorder={topBorder}
        borderColor={style.flatten(["dark:color-red-600@50%"]).color}
        rippleColor={style.flatten(["dark:color-red-700"]).color}
        underlayColor={style.flatten(["dark:color-red-700"]).color}
      />
      <PasswordInputModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        title="Remove Account"
        onEnterPassword={async (password) => {
          const index = keyRingStore.multiKeyStoreInfo.findIndex(
            (keyStore) => keyStore.selected
          );

          if (index >= 0) {
            await keyRingStore.deleteKeyRing(index, password);
            analyticsStore.logEvent("Account removed");

            if (keyRingStore.multiKeyStoreInfo.length === 0) {
              await keychainStore.reset();

              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Unlock",
                  },
                ],
              });
            }
          }
        }}
      />
    </React.Fragment>
  );
});
