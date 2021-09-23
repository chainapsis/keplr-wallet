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
import { useLogScreenView } from "../../hooks";
import { View } from "react-native";

export const SettingScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  useLogScreenView("Setting");

  return (
    <PageWithScrollViewInBottomTabView
      backgroundColor={style.get("color-setting-screen-background").color}
    >
      <SettingSelectAccountItem />
      <SettingSectionTitle title="General" />
      <SettingFiatCurrencyItem topBorder={true} />
      <SettingItem
        label="Address book"
        right={<RightArrow />}
        onPress={() => {
          smartNavigation.navigateSmart("AddressBook", {});
        }}
      />
      <SettingSectionTitle title="Security" />
      {canShowPrivateData(keyRingStore.keyRingType) && (
        <SettingViewPrivateDataItem topBorder={true} />
      )}
      {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
        <SettingBiometricLockItem
          topBorder={!canShowPrivateData(keyRingStore.keyRingType)}
        />
      ) : null}
      <SettingSectionTitle title="Others" />
      <SettingItem
        label="Keplr version"
        topBorder={true}
        onPress={() => {
          smartNavigation.navigateSmart("Setting.Version", {});
        }}
      />
      <SettingRemoveAccountItem topBorder={true} />
      {/* Mock element for padding bottom */}
      <View style={style.get("height-16")} />
    </PageWithScrollViewInBottomTabView>
  );
});
