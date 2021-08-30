import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { PageWithScrollView } from "../../../../../components/staging/page";
import { KeyStoreItem, KeyStoreSectionTitle } from "../../components";
import Svg, { Path } from "react-native-svg";
import { useStyle } from "../../../../../styles";
import { useLoadingScreen } from "../../../../../providers/loading-screen";
import {
  MultiKeyStoreInfoElem,
  MultiKeyStoreInfoWithSelectedElem,
} from "@keplr-wallet/background";
import { View } from "react-native";

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

export const getKeyStoreParagraph = (keyStore: MultiKeyStoreInfoElem) => {
  const bip44HDPath = keyStore.bip44HDPath
    ? keyStore.bip44HDPath
    : {
        account: 0,
        change: 0,
        addressIndex: 0,
      };

  return keyStore.type === "ledger"
    ? `Ledger - m/44'/118'/${bip44HDPath.account}'${
        bip44HDPath.change !== 0 || bip44HDPath.addressIndex !== 0
          ? `/${bip44HDPath.change}/${bip44HDPath.addressIndex}`
          : ""
      }`
    : keyStore.meta?.email
    ? keyStore.meta.email
    : undefined;
};

export const SettingSelectAccountScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const style = useStyle();

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
      await loadingScreen.openAsync();
      await keyRingStore.changeKeyRing(index);
      loadingScreen.setIsLoading(false);
    }
  };

  const renderKeyStores = (
    title: string,
    keyStores: MultiKeyStoreInfoWithSelectedElem[]
  ) => {
    return (
      <React.Fragment>
        {keyStores.length > 0 ? (
          <React.Fragment>
            <KeyStoreSectionTitle title={title} />
            {keyStores.map((keyStore, i) => {
              return (
                <KeyStoreItem
                  key={i.toString()}
                  label={keyStore.meta?.name || "Keplr Account"}
                  paragraph={getKeyStoreParagraph(keyStore)}
                  topBorder={i === 0}
                  bottomBorder={keyStores.length - 1 !== i}
                  right={
                    keyStore.selected ? (
                      <CheckIcon
                        color={style.get("color-primary").color}
                        height={16}
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
      </React.Fragment>
    );
  };

  return (
    <PageWithScrollView>
      {renderKeyStores("torus", torusKeyStores)}
      {renderKeyStores("mnemonic seed", mnemonicKeyStores)}
      {renderKeyStores("ledger", ledgerKeyStores)}
      {renderKeyStores("private key", privateKeyStores)}
      {/* Margin bottom for last */}
      <View style={style.get("height-16")} />
    </PageWithScrollView>
  );
});
