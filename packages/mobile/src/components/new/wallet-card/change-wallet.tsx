import React, { FunctionComponent } from "react";
import { CardModal } from "modals/card";
import { ScrollView, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { RectButton } from "components/rect-button";
import { CheckIcon } from "components/new/icon/check";
import { useStore } from "stores/index";
import { MultiKeyStoreInfoWithSelectedElem } from "@keplr-wallet/background";
import { observer } from "mobx-react-lite";
import { KeyRingStore } from "@keplr-wallet/stores";
import { BlurBackground } from "../blur-background/blur-background";
import { Bech32Address } from "@keplr-wallet/cosmos";

export const ChangeWalletCardModel: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  keyRingStore: KeyRingStore;
  onChangeAccount: (
    keyStore: MultiKeyStoreInfoWithSelectedElem
  ) => Promise<void>;
}> = observer(({ close, title, isOpen, keyRingStore, onChangeAccount }) => {
  const style = useStyle();
  const { analyticsStore, accountStore, chainStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  if (!isOpen) {
    return null;
  }

  return (
    <CardModal
      isOpen={isOpen}
      title={title}
      cardStyle={style.flatten(["padding-bottom-32"]) as ViewStyle}
      disableGesture={true}
      close={() => close()}
    >
      <ScrollView
        style={style.flatten(["max-height-600"]) as ViewStyle}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {keyRingStore.multiKeyStoreInfo.map((keyStore, i) => {
          return (
            <BlurBackground
              key={i.toString()}
              borderRadius={12}
              blurIntensity={15}
              containerStyle={style.flatten(["margin-y-4"]) as ViewStyle}
            >
              <RectButton
                onPress={async () => {
                  if (!keyStore?.selected) {
                    close();
                    analyticsStore.logEvent("Account changed");
                    await onChangeAccount(keyStore);
                  }
                }}
                activeOpacity={0.5}
                style={
                  style.flatten(
                    [
                      "flex-row",
                      "items-center",
                      "padding-x-18",
                      "padding-y-12",

                      "border-radius-12",
                    ],
                    [keyStore.selected && "background-color-indigo"]
                  ) as ViewStyle
                }
                underlayColor={style.flatten(["color-gray-50"]).color}
              >
                <View style={style.flatten(["flex-5"]) as ViewStyle}>
                  <Text
                    style={
                      style.flatten([
                        keyStore?.selected ? "h7" : "body3",
                        "color-white",
                      ]) as ViewStyle
                    }
                  >
                    {keyStore.meta?.["name"] || "Fetch Account"}
                  </Text>
                  {keyStore.selected ? (
                    <Text
                      style={
                        style.flatten([
                          "text-caption2",
                          "color-white",
                        ]) as ViewStyle
                      }
                    >
                      {Bech32Address.shortenAddress(
                        accountInfo.bech32Address,
                        32
                      )}
                    </Text>
                  ) : null}
                </View>
                <View
                  style={style.flatten(["flex-1", "items-end"]) as ViewStyle}
                >
                  {keyStore.selected ? <CheckIcon /> : null}
                </View>
              </RectButton>
            </BlurBackground>
          );
        })}
      </ScrollView>
    </CardModal>
  );
});
