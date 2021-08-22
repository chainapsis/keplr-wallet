import React, { FunctionComponent } from "react";
import { registerModal } from "../../modals/staging/base";
import { CardModal } from "../../modals/staging/card";
import { ScrollView, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { RectButton } from "../staging/rect-button";

export const ChainSelectorModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  chainIds: string[];
  onSelectChain: (chainId: string) => void;
}> = registerModal(
  observer(({ chainIds, onSelectChain }) => {
    const { chainStore } = useStore();

    const style = useStyle();

    return (
      <CardModal
        title="Select Chain"
        childrenContainerStyle={style.flatten(["padding-0"])}
      >
        <ScrollView style={style.flatten(["max-height-600"])}>
          {chainIds.map((chainId) => {
            const chainName = chainStore.hasChain(chainId)
              ? chainStore.getChain(chainId).chainName
              : chainId;

            return (
              <RectButton
                key={chainId}
                style={style.flatten([
                  "padding-x-20",
                  "padding-y-15",
                  "flex-row",
                  "items-center",
                ])}
                onPress={() => {
                  onSelectChain(chainId);
                }}
              >
                <View
                  style={style.flatten([
                    "width-40",
                    "height-40",
                    "border-radius-64",
                    "margin-right-12",
                    "background-color-text-black-very-very-low",
                  ])}
                />
                <Text style={style.flatten(["h5", "color-text-black-medium"])}>
                  {chainName}
                </Text>
              </RectButton>
            );
          })}
        </ScrollView>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
