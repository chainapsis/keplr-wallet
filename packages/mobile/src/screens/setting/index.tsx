import React, { FunctionComponent } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { RightArrow, SettingItem, SettingSectionTitle } from "./components";
import { SettingSelectAccountItem } from "./items/select-account";
import { useSmartNavigation } from "../../navigation";
import { SettingFiatCurrencyItem } from "./items/fiat-currency";
import { SettingBiometricLockItem } from "./items/biometric-lock";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SettingRemoveAccountItem } from "./items/remove-account";
import { canShowPrivateData } from "./screens/view-private-data";
import { SettingViewPrivateDataItem } from "./items/view-private-data";
import { useStyle } from "../../styles";

export const SettingScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  return (
    <PageWithScrollViewInBottomTabView
      backgroundColor={style.get("color-setting-screen-background").color}
    >
      <SettingSelectAccountItem />
      <SettingSectionTitle title="General" />
      <SettingFiatCurrencyItem topBorder={true} />
      <SettingItem
        label="Address Book"
        right={<RightArrow />}
        onPress={() => {
          smartNavigation.navigateSmart("AddressBook", {});
        }}
      />
      <SettingSectionTitle title="General" />
      {canShowPrivateData(keyRingStore.keyRingType) && (
        <SettingViewPrivateDataItem topBorder={true} />
      )}
      {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
        <SettingBiometricLockItem
          topBorder={!canShowPrivateData(keyRingStore.keyRingType)}
        />
      ) : null}
      <SettingRemoveAccountItem topBorder={true} />
    </PageWithScrollViewInBottomTabView>
  );
});
