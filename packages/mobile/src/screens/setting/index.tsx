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
import { View } from "react-native";
import { SettingThemeItem } from "./items/theme";

export const SettingScreen: FunctionComponent = observer(() => {
  const { chainStore, keychainStore, keyRingStore, tokensStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const showManageTokenButton = (() => {
    if (!chainStore.current.features) {
      return false;
    }

    if (chainStore.current.features.includes("cosmwasm")) {
      return true;
    }
  })();

  return (
    <PageWithScrollViewInBottomTabView backgroundMode="secondary">
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
      {showManageTokenButton ? (
        <SettingItem
          label="Manage tokens"
          right={
            <RightArrow
              paragraph={tokensStore
                .getTokensOf(chainStore.current.chainId)
                .tokens.length.toString()}
            />
          }
          onPress={() => {
            smartNavigation.navigateSmart("Setting.ManageTokens", {});
          }}
        />
      ) : null}
      <SettingThemeItem />
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
