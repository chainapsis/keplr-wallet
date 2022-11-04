import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../styles";
import { registerModal } from "../../modals/base";
import { CardModal } from "../../modals/card";
import { Button } from "../../components/button";
import Svg, { Path } from "react-native-svg";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

const LeftArrowIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11.438 18.75L4.688 12l6.75-6.75M5.625 12h13.688"
      />
    </Svg>
  );
};

export const LedgerNotSupportedModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const { chainStore } = useStore();

    const style = useStyle();

    return (
      <CardModal
        childrenContainerStyle={style.flatten(["padding-x-32", "padding-y-22"])}
        disableGesture={true}
      >
        <Text style={style.flatten(["h3", "color-text-middle"])}>
          Ledger is not supported on this chain.
        </Text>
        <Text
          style={style.flatten(["margin-y-16", "body3", "color-text-label"])}
        >
          We ask for your patience while we work on supporting more chains.
        </Text>
        <View style={style.flatten(["flex-row"])}>
          <Button
            style={style.flatten(["padding-left-8", "padding-right-16"])}
            color="primary"
            mode="text"
            text="Go back"
            leftIcon={(color) => (
              <View style={style.flatten(["margin-right-12"])}>
                <LeftArrowIcon color={color} size={24} />
              </View>
            )}
            onPress={() => {
              // Select the previous chain id with giving priority to the chain info which can be shown on UI.
              if (
                chainStore.previousSelectedChainId &&
                chainStore.previousSelectedChainId !==
                  chainStore.current.chainId &&
                chainStore.chainInfosInUI.find(
                  (chainInfo) =>
                    chainInfo.chainId === chainStore.previousSelectedChainId
                ) != null
              ) {
                chainStore.selectChain(chainStore.previousSelectedChainId);
              } else {
                const other =
                  chainStore.chainInfosInUI.find(
                    (chainInfo) =>
                      chainInfo.chainId !== chainStore.current.chainId
                  ) || chainStore.chainInfos[0];

                chainStore.selectChain(other.chainId);
              }
            }}
          />
        </View>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
