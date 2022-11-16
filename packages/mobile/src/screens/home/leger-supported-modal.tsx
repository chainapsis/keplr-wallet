import React, { FunctionComponent, useState } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../styles";
import { registerModal } from "../../modals/base";
import { CardModal } from "../../modals/card";
import { Button } from "../../components/button";
import Svg, { Path } from "react-native-svg";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  InitNonDefaultLedgerAppMsg,
  LedgerApp,
} from "@keplr-wallet/background";
import { RNMessageRequesterInternal } from "../../router";
import { RectButton } from "../../components/rect-button";

const RightArrowIcon: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      width={(25 / 24) * height}
      height={height}
      fill="none"
      viewBox="0 0 25 24"
    >
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13.063 5.25l6.75 6.75-6.75 6.75M18.875 12H5.187"
      />
    </Svg>
  );
};

export const LedgerSupportedModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const { chainStore, accountStore } = useStore();
    const account = accountStore.getAccount(chainStore.current.chainId);

    const style = useStyle();

    const [isLoading, setIsLoading] = useState(false);

    return (
      <CardModal
        childrenContainerStyle={style.flatten(["padding-x-32", "padding-y-22"])}
        disableGesture={true}
      >
        <Text style={style.flatten(["h3", "color-text-high"])}>
          Ledger is supported{"\n"}
          for this chain now
        </Text>
        <Text
          style={style.flatten([
            "margin-top-16",
            "margin-bottom-36",
            "body2",
            "color-text-middle",
          ])}
        >
          Ledger users can connect with Ledger now.
        </Text>
        <View
          style={style.flatten(["flex-row", "items-center", "justify-between"])}
        >
          <RectButton
            style={style.flatten(["padding-8", "border-radius-8"])}
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
            enabled={!isLoading}
          >
            <Text style={style.flatten(["text-button2", "color-text-low"])}>
              Go to back
            </Text>
          </RectButton>

          <View style={style.get("flex-1")} />

          <Button
            color="primary"
            mode="fill"
            text="Connect"
            style={style.flatten(["padding-x-36"])}
            rightIcon={(color) => (
              <View style={style.flatten(["margin-left-10"])}>
                <RightArrowIcon color={color} height={24} />
              </View>
            )}
            loading={isLoading}
            onPress={async () => {
              setIsLoading(true);

              try {
                await new RNMessageRequesterInternal().sendMessage(
                  BACKGROUND_PORT,
                  new InitNonDefaultLedgerAppMsg(LedgerApp.Ethereum)
                );

                account.disconnect();

                await account.init();
              } catch (e) {
                // Do not set "isLoading" to false in "finally" block.
                // After succeeding initialization, modal should disappear with showing this as loading even though it is not actually in loading.
                // This is the decision for UI.
                setIsLoading(false);

                console.log(e);
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
