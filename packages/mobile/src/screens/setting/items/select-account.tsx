import React, { FunctionComponent } from "react";
import { KeyStoreItem, RightArrow } from "../components";
import { useStyle } from "../../../styles";
import { useSmartNavigation } from "../../../navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { View } from "react-native";
import { getKeyStoreParagraph } from "../screens/select-account";

export const SettingSelectAccountItem: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const selected = keyRingStore.multiKeyStoreInfo.find(
    (keyStore) => keyStore.selected
  );

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  return (
    <React.Fragment>
      <View
        style={style.flatten(["height-1", "background-color-border-white"])}
      />
      <KeyStoreItem
        containerStyle={style.flatten(["padding-left-10"])}
        defaultRightWalletIconStyle={style.flatten(["margin-right-2"])}
        label={selected ? selected.meta?.name || "Keplr Account" : "No Account"}
        paragraph={selected ? getKeyStoreParagraph(selected) : undefined}
        right={<RightArrow />}
        topBorder={false}
        bottomBorder={false}
        onPress={() => {
          smartNavigation.navigateSmart("SettingSelectAccount", {});
        }}
      />
      <View
        style={style.flatten(["height-1", "background-color-border-white"])}
      />
    </React.Fragment>
  );
});
