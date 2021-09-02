import React, { FunctionComponent } from "react";
import { PageWithScrollViewInBottomTabView } from "../../../components/staging/page";
import { RightArrow, SettingItem, SettingSectionTitle } from "./components";
import { SettingSelectAccountItem } from "./items/select-account";
import { useSmartNavigation } from "../../../navigation";
import { SettingFiatCurrencyItem } from "./items/fiat-currency";
import { SettingBiometricLockItem } from "./items/biometric-lock";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { PasswordModal } from "../../../modals/staging/password";

export const SettingScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore } = useStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  const smartNavigation = useSmartNavigation();

  const passwordModalTitle = `View ${
    keyRingStore.keyRingType === "mnemonic" ? "Mnemonic Seed" : "Private key"
  }`;

  return (
    <PageWithScrollViewInBottomTabView>
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
      {keyRingStore.keyRingType !== "ledger" && (
        <SettingItem
          label={passwordModalTitle}
          onPress={() => {
            setIsPasswordModalOpen(true);
          }}
        />
      )}
      {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
        <SettingBiometricLockItem />
      ) : null}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        close={() => setIsPasswordModalOpen(false)}
        title={passwordModalTitle}
        smartNavigation={smartNavigation}
      />
    </PageWithScrollViewInBottomTabView>
  );
});
