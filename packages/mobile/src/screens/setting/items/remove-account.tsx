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
  const { keyRingStore } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <React.Fragment>
      <SettingItem
        label="Remove Account"
        onPress={() => {
          setIsOpenModal(true);
        }}
        containerStyle={style.flatten(["margin-top-16"])}
        labelStyle={style.flatten(["subtitle1", "color-danger"])}
        style={style.flatten(["justify-center"])}
        topBorder={topBorder}
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

            if (keyRingStore.multiKeyStoreInfo.length === 0) {
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
