import React, { FunctionComponent } from "react";
import { PageWithScrollViewInBottomTabView } from "components/page";
import { Right, SettingItem, SettingSectionTitle } from "./components";
import { useSmartNavigation } from "navigation/smart-navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import { canShowPrivateData } from "./screens/view-private-data";
import { useStyle } from "styles/index";
import { Platform, Text, View, ViewStyle } from "react-native";
import { ATIcon } from "components/new/icon/at-icon";
import { CoinsIcon } from "components/new/icon/coins";
import { ShieldIcon } from "components/new/icon/shield";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CurrencyIcon } from "components/new/icon/currency";
import { BranchIcon } from "components/new/icon/branch-icon";

export const SettingScreen: FunctionComponent = observer(() => {
  const { chainStore, keychainStore, keyRingStore, tokensStore, priceStore } =
    useStore();

  const style = useStyle();

  const safeAreaInsets = useSafeAreaInsets();

  const smartNavigation = useSmartNavigation();

  const showPrivateData = canShowPrivateData(keyRingStore.keyRingType);
  const showManageTokenButton = (() => {
    if (!chainStore.current.features) {
      return false;
    }

    if (chainStore.current.features.includes("cosmwasm")) {
      return true;
    }
  })();

  return (
    <PageWithScrollViewInBottomTabView
      backgroundMode="image"
      isTransparentHeader={true}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
      contentContainerStyle={{
        paddingTop: Platform.OS === "ios" ? safeAreaInsets.top + 10 : 48,
      }}
    >
      <Text
        style={
          style.flatten([
            "h1",
            "font-normal",
            "color-white",
            "margin-y-16",
          ]) as ViewStyle
        }
      >
        More
      </Text>
      <SettingSectionTitle title="Account" />
      <SettingItem
        label="Currency"
        left={<CurrencyIcon size={16} />}
        right={<Right paragraph={priceStore.defaultVsCurrency.toUpperCase()} />}
        onPress={() => {
          smartNavigation.navigateSmart("Setting.Currency", {});
        }}
      />
      {showManageTokenButton ? (
        <SettingItem
          label="Manage tokens"
          left={<CoinsIcon size={16} />}
          right={
            <Right
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
      <SettingItem
        left={<ATIcon size={16} />}
        label="Address book"
        onPress={() => {
          smartNavigation.navigateSmart("AddressBook", {});
        }}
      />
      {showPrivateData ||
      keychainStore.isBiometrySupported ||
      keychainStore.isBiometryOn ? (
        <SettingItem
          label="Security & privacy"
          left={<ShieldIcon size={16} />}
          onPress={() => {
            smartNavigation.navigateSmart("SecurityAndPrivacy", {});
          }}
        />
      ) : null}
      <SettingSectionTitle title="Others" />
      <SettingItem
        label="Fetch Wallet version"
        left={<BranchIcon size={16} />}
        onPress={() => {
          smartNavigation.navigateSmart("Setting.Version", {});
        }}
      />
      {/* Mock element for padding bottom */}
      <View style={style.get("height-16") as ViewStyle} />
    </PageWithScrollViewInBottomTabView>
  );
});
