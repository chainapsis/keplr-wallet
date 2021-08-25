import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/staging/page";
import { RightArrow, SettingItem, SettingSectionTitle } from "./components";
import { SettingSelectAccountItem } from "./items/select-account";
import { useSmartNavigation } from "../../../navigation";
import { SettingFiatCurrencyItem } from "./items/fiat-currency";
import { SettingBiometricLockItem } from "./items/biometric-lock";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { ViewPrivateInfoModal } from "../../../modals/staging/view-private-info";

export const SettingScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore } = useStore();
  const [
    isViewPrivateInfoModalOpen,
    setIsViewPrivateInfoModalOpen,
  ] = React.useState(false);

  const smartNavigation = useSmartNavigation();

  const viewPrivateInfoTitle = `View ${
    keyRingStore.keyRingType === "mnemonic" ? "Mnemonic Seed" : "Private key"
  }`;

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
      <SettingSectionTitle title="General" />
      {keyRingStore.keyRingType !== "ledger" && (
        <SettingItem
          label={viewPrivateInfoTitle}
          right={<RightArrow />}
          onPress={() => {
            setIsViewPrivateInfoModalOpen(true);
          }}
        />
      )}
      {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
        <SettingBiometricLockItem />
      ) : null}
      <ViewPrivateInfoModal
        isOpen={isViewPrivateInfoModalOpen}
        close={() => setIsViewPrivateInfoModalOpen(false)}
        title={viewPrivateInfoTitle}
      />
    </PageWithScrollView>
  );
});
