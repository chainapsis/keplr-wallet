import React, { FunctionComponent } from "react";
import { CardModal } from "modals/card";
import { ScrollView, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/index";
import { RectButton } from "components/rect-button";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "components/vector-character";

export const ChainSelectorModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  chainIds: string[];
  onSelectChain: (chainId: string) => void;
}> = observer(({ chainIds, onSelectChain, isOpen }) => {
  const { chainStore } = useStore();

  const style = useStyle();

  if (!isOpen) {
    return null;
  }

  return (
    <CardModal
      isOpen={isOpen}
      title="Select Chain"
      childrenContainerStyle={style.flatten(["padding-0"]) as ViewStyle}
    >
      <ScrollView
        style={style.flatten(["max-height-600"]) as ViewStyle}
        indicatorStyle={style.theme === "dark" ? "white" : "black"}
      >
        {chainIds.map((chainId) => {
          const chainName = chainStore.hasChain(chainId)
            ? chainStore.getChain(chainId).chainName
            : chainId;

          const chainImage = chainStore.hasChain(chainId)
            ? chainStore.getChain(chainId).raw.chainSymbolImageUrl
            : undefined;

          return (
            <RectButton
              key={chainId}
              style={
                style.flatten([
                  "padding-x-20",
                  "padding-y-15",
                  "flex-row",
                  "items-center",
                ]) as ViewStyle
              }
              onPress={() => {
                onSelectChain(chainId);
              }}
            >
              <View
                style={
                  style.flatten([
                    "width-40",
                    "height-40",
                    "border-radius-64",
                    "items-center",
                    "justify-center",
                    "background-color-blue-400",
                    "margin-right-12",
                  ]) as ViewStyle
                }
              >
                {chainImage ? (
                  <FastImage
                    style={{
                      width: 30,
                      height: 30,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                    source={{
                      uri: chainImage,
                    }}
                  />
                ) : (
                  <VectorCharacter char={chainName} color="white" height={14} />
                )}
              </View>
              <Text style={style.flatten(["h5", "color-text-middle"])}>
                {chainName}
              </Text>
            </RectButton>
          );
        })}
      </ScrollView>
    </CardModal>
  );
});
