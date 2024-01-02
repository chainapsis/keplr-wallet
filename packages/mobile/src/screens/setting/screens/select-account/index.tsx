import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { PageWithScrollViewInBottomTabView } from "../../../../components/page";
import { KeyStoreItem, KeyStoreSectionTitle } from "../../components";
import Svg, { Path } from "react-native-svg";
import { useStyle } from "../../../../styles";
import { useLoadingScreen } from "../../../../providers/loading-screen";
import {
  MultiKeyStoreInfoElem,
  MultiKeyStoreInfoWithSelectedElem,
} from "@keplr-wallet/background";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import { useSmartNavigation } from "../../../../navigation";
import { EditAccountNameModal } from "../../../../modals/edit-account-name.tsx";
import { EditIcon } from "../../../../components/icon";

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

  switch (keyStore.type) {
    case "ledger":
      return `Ledger - m/44'/118'/${bip44HDPath.account}'${
        bip44HDPath.change !== 0 || bip44HDPath.addressIndex !== 0
          ? `/${bip44HDPath.change}/${bip44HDPath.addressIndex}`
          : ""
      }`;
    case "mnemonic":
      if (
        bip44HDPath.account !== 0 ||
        bip44HDPath.change !== 0 ||
        bip44HDPath.addressIndex !== 0
      ) {
        return `Mnemonic - m/44'/-/${bip44HDPath.account}'${
          bip44HDPath.change !== 0 || bip44HDPath.addressIndex !== 0
            ? `/${bip44HDPath.change}/${bip44HDPath.addressIndex}`
            : ""
        }`;
      }
      return;
    case "privateKey":
      // Torus key
      if (keyStore.meta?.["email"]) {
        return keyStore.meta["email"];
      }
      return;
  }
};

export const SettingSelectAccountScreen: FunctionComponent = observer(() => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedKeyStore, setSelectedKeyStore] =
    useState<MultiKeyStoreInfoWithSelectedElem>();

  const { keyRingStore, analyticsStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const waitingNameData = keyRingStore.waitingNameData?.data;

  const googleTorusKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) =>
        keyStore.type === "privateKey" &&
        keyStore.meta &&
        keyStore.meta["email"] &&
        // In prior version, only the google sign in option exists.
        // But, now, there are two types of sign in (google, apple).
        // `socialType` in meta is introduced to determine which social sign in was used.
        // If there is no `socialType` field in meta, just assume that it was google sign in.
        (!keyStore.meta["socialType"] ||
          keyStore.meta["socialType"] === "google")
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const appleTorusKeyStores = useMemo(() => {
    return keyRingStore.multiKeyStoreInfo.filter(
      (keyStore) =>
        keyStore.type === "privateKey" &&
        keyStore.meta &&
        keyStore.meta["email"] &&
        keyStore.meta["socialType"] === "apple"
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
      (keyStore) => keyStore.type === "privateKey" && !keyStore.meta?.["email"]
    );
  }, [keyRingStore.multiKeyStoreInfo]);

  const loadingScreen = useLoadingScreen();

  const selectKeyStore = async (
    keyStore: MultiKeyStoreInfoWithSelectedElem
  ) => {
    const index = keyRingStore.multiKeyStoreInfo.indexOf(keyStore);
    if (index >= 0) {
      loadingScreen.setIsLoading(true);
      await keyRingStore.changeKeyRing(index);
      loadingScreen.setIsLoading(false);

      smartNavigation.navigateSmart("Home", {});
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
                  label={keyStore.meta?.["name"] || "Fetch Account"}
                  paragraph={getKeyStoreParagraph(keyStore)}
                  topBorder={i === 0}
                  bottomBorder={keyStores.length - 1 !== i}
                  containerStyle={style.flatten(["flex-1"])}
                  right={
                    keyStore.selected ? (
                      <CheckIcon
                        color={style.get("color-blue-400").color}
                        height={16}
                      />
                    ) : undefined
                  }
                  onPress={async () => {
                    if (!keyStore?.selected) {
                      analyticsStore.logEvent("Account changed");
                      await selectKeyStore(keyStore);
                    }
                  }}
                  unClickableChildren={
                    <TouchableOpacity
                      style={
                        style.flatten([
                          "background-color-white",
                          "padding-top-15",
                          "padding-bottom-15",
                          "padding-right-24",
                          "height-87",
                          "flex",
                          "justify-center",
                        ]) as ViewStyle
                      }
                      onPress={() => {
                        setSelectedKeyStore(keyStore);
                        setIsOpenModal(true);
                      }}
                    >
                      <EditIcon
                        color={
                          style.flatten([
                            "color-black",
                            "dark:color-platinum-300",
                          ]).color
                        }
                        size={24}
                      />
                    </TouchableOpacity>
                  }
                />
              );
            })}
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <PageWithScrollViewInBottomTabView backgroundMode="secondary">
      {renderKeyStores("apple id", appleTorusKeyStores)}
      {renderKeyStores("google account", googleTorusKeyStores)}
      {renderKeyStores("mnemonic seed", mnemonicKeyStores)}
      {renderKeyStores("hardware wallet", ledgerKeyStores)}
      {renderKeyStores("private key", privateKeyStores)}
      {/* Margin bottom for last */}
      <View style={style.get("height-16") as ViewStyle} />
      <EditAccountNameModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        title="Edit Account Name"
        isReadOnly={waitingNameData !== undefined && !waitingNameData?.editable}
        onEnterName={async (name) => {
          try {
            const selectedIndex = keyRingStore.multiKeyStoreInfo.findIndex(
              (keyStore) => keyStore == selectedKeyStore
            );

            await keyRingStore.updateNameKeyRing(selectedIndex, name.trim());
            setSelectedKeyStore(undefined);
            setIsOpenModal(false);
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
          }
        }}
      />
    </PageWithScrollViewInBottomTabView>
  );
});
