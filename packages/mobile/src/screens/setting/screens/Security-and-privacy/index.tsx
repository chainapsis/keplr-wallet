import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "components/page";
import { useStyle } from "styles/index";

import { useStore } from "stores/index";
import { canShowPrivateData } from "../view-private-data";
import { SettingViewPrivateDataItem } from "screens/setting/items/view-private-data";
import { SettingBiometricLockItem } from "screens/setting/items/biometric-lock";
import { ViewStyle } from "react-native";

export const SecurityAndPrivacyScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore } = useStore();

  const showPrivateData = canShowPrivateData(keyRingStore.keyRingType);

  const style = useStyle();

  return (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.flatten(["flex-grow-1"])}
      style={style.flatten(["padding-x-page", "margin-top-16"]) as ViewStyle}
      scrollEnabled={false}
    >
      {showPrivateData && <SettingViewPrivateDataItem />}
      {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
        <SettingBiometricLockItem />
      ) : null}
    </PageWithScrollView>
  );
});
