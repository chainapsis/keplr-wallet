import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/staging/page";
import { RightArrow, SettingItem, SettingSectionTitle } from "./components";
import { SettingSelectAccountItem } from "./items/select-account";
import { useSmartNavigation } from "../../../navigation";
import { SettingFiatCurrencyItem } from "./items/fiat-currency";
import { SettingBiometricLockItem } from "./items/biometric-lock";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

export const SettingScreen: FunctionComponent = observer(() => {
  const { keychainStore } = useStore();

  const smartNavigation = useSmartNavigation();

  return (
    <PageWithScrollView>
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
      {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
        <SettingBiometricLockItem />
      ) : null}
    </PageWithScrollView>
  );
});
