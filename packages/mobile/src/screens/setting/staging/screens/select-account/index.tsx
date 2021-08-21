import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { PageWithScrollView } from "../../../../../components/staging/page";
import { SettingItem, SettingSectionTitle } from "../../components";
import Svg, { Path } from "react-native-svg";
import FeatherIcon from "react-native-vector-icons/Feather";
import { Text, View } from "react-native";
import { useStyle } from "../../../../../styles";
import { useSmartNavigation } from "../../../../../navigation";
import { useLoadingScreen } from "../../../../../providers/loading-screen";
import { MultiKeyStoreInfoWithSelectedElem } from "@keplr-wallet/background";
import delay from "delay";
import { RectButton } from "../../../../../components/staging/rect-button";

const CheckIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 19 17"
      style={{
        height,
        aspectRatio: 19 / 17,
      }}
    >
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M18 1L7.448 16 1 7.923"
      />
    </Svg>
  );
};

export const SettingSelectAccountScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const torusKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) =>
        keyStore.type === "privateKey" && keyStore.meta && keyStore.meta.email
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const mnemonicKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => !keyStore.type || keyStore.type === "mnemonic"
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const ledgerKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => keyStore.type === "ledger"
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const privateKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) => keyStore.type === "privateKey" && !keyStore.meta?.email
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const loadingScreen = useLoadingScreen();

  const selectKeyStore = async (
    keyStore: MultiKeyStoreInfoWithSelectedElem
  ) => {
    const index = keyRingStore.multiKeyStoreInfo.indexOf(keyStore);
    if (index >= 0) {
      loadingScreen.setIsLoading(true);
      // Because javascript is synchronous language, the loadnig state change would not delivered to the UI thread.
      // So to make sure that the loading state changes, just wait very short time.
      await delay(10);
      await keyRingStore.changeKeyRing(index);
      loadingScreen.setIsLoading(false);
    }
  };

  return (
    <PageWithScrollView>
      <View style={style.flatten(["background-color-white"])}>
        {torusKeyStores.length > 0 ? (
          <React.Fragment>
            <SettingSectionTitle title={"torus".toUpperCase()} />
            {torusKeyStores.map((keyStore, i) => {
              return (
                <SettingItem
                  key={i.toString()}
                  label={keyStore.meta?.name || "Keplr Account"}
                  topBorder={i === 0}
                  right={
                    keyStore.selected ? (
                      <CheckIcon
                        color={style.get("color-primary").color}
                        height={13}
                      />
                    ) : undefined
                  }
                  onPress={async () => {
                    await selectKeyStore(keyStore);
                  }}
                />
              );
            })}
          </React.Fragment>
        ) : null}
        {mnemonicKeyStores.length > 0 ? (
          <React.Fragment>
            <SettingSectionTitle title={"mnemonic seed".toUpperCase()} />
            {mnemonicKeyStores.map((keyStore, i) => {
              return (
                <SettingItem
                  key={i.toString()}
                  label={keyStore.meta?.name || "Keplr Account"}
                  topBorder={i === 0}
                  right={
                    keyStore.selected ? (
                      <CheckIcon
                        color={style.get("color-primary").color}
                        height={13}
                      />
                    ) : undefined
                  }
                  onPress={async () => {
                    await selectKeyStore(keyStore);
                  }}
                />
              );
            })}
          </React.Fragment>
        ) : null}
        {ledgerKeyStores.length > 0 ? (
          <React.Fragment>
            <SettingSectionTitle title={"ledger".toUpperCase()} />
            {ledgerKeyStores.map((keyStore, i) => {
              return (
                <SettingItem
                  key={i.toString()}
                  label={keyStore.meta?.name || "Keplr Account"}
                  topBorder={i === 0}
                  right={
                    keyStore.selected ? (
                      <CheckIcon
                        color={style.get("color-primary").color}
                        height={13}
                      />
                    ) : undefined
                  }
                  onPress={async () => {
                    await selectKeyStore(keyStore);
                  }}
                />
              );
            })}
          </React.Fragment>
        ) : null}
        {privateKeyStores.length > 0 ? (
          <React.Fragment>
            <SettingSectionTitle title={"private key".toUpperCase()} />
            {privateKeyStores.map((keyStore, i) => {
              return (
                <SettingItem
                  key={i.toString()}
                  label={keyStore.meta?.name || "Keplr Account"}
                  topBorder={i === 0}
                  right={
                    keyStore.selected ? (
                      <CheckIcon
                        color={style.get("color-primary").color}
                        height={13}
                      />
                    ) : undefined
                  }
                  onPress={async () => {
                    await selectKeyStore(keyStore);
                  }}
                />
              );
            })}
          </React.Fragment>
        ) : null}
        <RectButton
          style={style.flatten(["height-80", "justify-center", "padding-x-16"])}
          onPress={() => {
            smartNavigation.navigateSmart("Register.Intro", {});
          }}
        >
          <View style={style.flatten(["flex-row"])}>
            <Text
              style={style.flatten(["h4", "color-text-black-very-very-low"])}
            >
              Add Account
            </Text>
            <View style={style.flatten(["flex-1"])} />
            <FeatherIcon
              name="plus"
              color={style.get("color-text-black-very-very-low").color}
              size={24}
            />
          </View>
        </RectButton>
      </View>
    </PageWithScrollView>
  );
});
