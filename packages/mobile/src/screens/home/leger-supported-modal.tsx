import React, { FunctionComponent } from "react";
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
  size: number;
  color: string;
}> = ({ size, color }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 24 25">
      <Path
        d="M13.0625 5.25L19.8125 12L13.0625 18.75M18.875 12L5.1875 12"
        stroke={color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
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

    return (
      <CardModal
        childrenContainerStyle={style.flatten(["padding-x-32", "padding-y-22"])}
        disableGesture={true}
      >
        <Text style={style.flatten(["h3", "color-text-middle"])}>
          Ledger is supported{"\n"}
          for this chain now
        </Text>
        <Text
          style={style.flatten(["margin-y-16", "body3", "color-text-label"])}
        >
          Ledger users can connect with Ledger now.
        </Text>
        <View style={style.flatten(["flex-row"])}>
          <RectButton
            style={style.flatten(["items-start", "padding-y-11", "flex-1"])}
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
          >
            <Text
              style={style.flatten([
                "text-button3",
                "color-text-low",
                "normal-case",
              ])}
            >
              Go to back
            </Text>
          </RectButton>

          <Button
            color="primary"
            mode="fill"
            text="Connect"
            containerStyle={style.flatten(["flex-1"])}
            rightIcon={(color) => (
              <View style={style.flatten(["margin-left-10"])}>
                <RightArrowIcon color={color} size={24} />
              </View>
            )}
            onPress={async () => {
              try {
                await new RNMessageRequesterInternal().sendMessage(
                  BACKGROUND_PORT,
                  new InitNonDefaultLedgerAppMsg(LedgerApp.Ethereum)
                );

                account.disconnect();

                await account.init();
              } catch (e) {
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
