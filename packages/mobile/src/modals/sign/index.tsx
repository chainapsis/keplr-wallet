import React, { FunctionComponent, useEffect, useState } from "react";
import { CardModal } from "../card";
import { Animated, ScrollView, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { useStore } from "stores/index";
import {
  useFeeConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
  useZeroAllowedGasConfig,
} from "@keplr-wallet/hooks";
import { Button } from "components/button";
import { Msg as AminoMsg, EthSignType } from "@keplr-wallet/types";
import { Msg } from "./msg";
import { observer } from "mobx-react-lite";
import { WCMessageRequester } from "stores/wallet-connect/msg-requester";
import { WCAppLogoAndName } from "components/wallet-connect";
import WalletConnect from "@walletconnect/client";
import { renderAminoMessage } from "./amino";
import { renderDirectMessage } from "./direct";
import { AnyWithUnpacked } from "@keplr-wallet/cosmos";
import { unescapeHTML } from "@keplr-wallet/common";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useUnmount } from "hooks/use-unmount";
import { MemoInputView } from "components/new/card-view/memo-input";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { FeeInSign } from "modals/sign/fee";
import { TabBarView } from "components/new/tab-bar/tab-bar";
import { DataTab } from "./data-tab";
const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(
  KeyboardAwareScrollView
);

enum TransactionTabEnum {
  Details = "Details",
  Data = "Data",
}

export const SignModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = observer(({ isOpen, close }) => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    walletConnectStore,
    signInteractionStore,
  } = useStore();
  useUnmount(() => {
    signInteractionStore.rejectAll();
  });

  // Check that the request is from the wallet connect.
  // If this is undefiend, the request is not from the wallet connect.
  const [wcSession, setWCSession] = useState<
    WalletConnect["session"] | undefined
  >();

  const style = useStyle();

  const [signer, setSigner] = useState("");

  const [chainId, setChainId] = useState(chainStore.current.chainId);
  const [ethSignType, setEthSignType] = useState<EthSignType | undefined>();

  // There are services that sometimes use invalid tx to sign arbitrary data on the sign page.
  // In this case, there is no obligation to deal with it, but 0 gas is favorably allowed.
  const gasConfig = useZeroAllowedGasConfig(chainStore, chainId, 0);
  const amountConfig = useSignDocAmountConfig(
    chainStore,
    accountStore,
    chainId,
    signer
  );
  const feeConfig = useFeeConfig(
    chainStore,
    queriesStore,
    chainId,
    signer,
    amountConfig,
    gasConfig
  );
  const memoConfig = useMemoConfig(chainStore, chainId);

  const signDocWapper = signInteractionStore.waitingData?.data.signDocWrapper;
  const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
  amountConfig.setSignDocHelper(signDocHelper);

  const [isInternal, setIsInternal] = useState(false);
  const [selectedId, setSelectedId] = useState(TransactionTabEnum.Details);

  useEffect(() => {
    if (signInteractionStore.waitingData) {
      const data = signInteractionStore.waitingData;
      setIsInternal(data.isInternal);
      signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
      setChainId(data.data.signDocWrapper.chainId);
      gasConfig.setGas(data.data.signDocWrapper.gas);
      let memo = data.data.signDocWrapper.memo;
      if (data.data.signDocWrapper.mode === "amino") {
        // For amino-json sign doc, the memo is escaped by default behavior of golang's json marshaller.
        // For normal users, show the escaped characters with unescaped form.
        // Make sure that the actual sign doc's memo should be escaped.
        // In this logic, memo should be escaped from account store or background's request signing function.
        memo = unescapeHTML(memo);
      }
      memoConfig.setMemo(memo);
      if (
        data.data.signOptions.preferNoSetFee &&
        data.data.signDocWrapper.fees[0]
      ) {
        feeConfig.setManualFee(data.data.signDocWrapper.fees[0]);
      } else {
        feeConfig.setFeeType("average");
      }
      setSigner(data.data.signer);

      if (
        data.data.msgOrigin &&
        WCMessageRequester.isVirtualSessionURL(data.data.msgOrigin)
      ) {
        const sessionId = WCMessageRequester.getSessionIdFromVirtualURL(
          data.data.msgOrigin
        );
        setWCSession(walletConnectStore.getSession(sessionId));
      } else {
        setWCSession(undefined);
      }
      if (data.data.ethSignType) {
        setEthSignType(data.data.ethSignType);
      }
    }
  }, [
    feeConfig,
    gasConfig,
    memoConfig,
    signDocHelper,
    signInteractionStore.waitingData,
    walletConnectStore,
  ]);

  const mode = signDocHelper.signDocWrapper
    ? signDocHelper.signDocWrapper.mode
    : "none";
  const msgs = signDocHelper.signDocWrapper
    ? signDocHelper.signDocWrapper.mode === "amino"
      ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
      : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
    : [];

  const renderedMsgs = (() => {
    if (mode === "amino") {
      return (msgs as readonly AminoMsg[]).map((msg, i) => {
        const account = accountStore.getAccount(chainId);
        const chainInfo = chainStore.getChain(chainId);
        const { title, content, scrollViewHorizontal } = renderAminoMessage(
          account,
          msg,
          chainInfo.currencies
        );

        return (
          <View key={i.toString()}>
            <Msg title={title}>
              {scrollViewHorizontal ? (
                <ScrollView
                  showsHorizontalScrollIndicator={false}
                  indicatorStyle={"white"}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={style.flatten(["body3", "color-text-low"])}>
                    {content}
                  </Text>
                </ScrollView>
              ) : (
                <Text
                  style={style.flatten(["text-caption2", "color-gray-300"])}
                >
                  {content}
                </Text>
              )}
            </Msg>
            {msgs.length - 1 !== i ? (
              <View
                style={
                  style.flatten([
                    "height-1",
                    "background-color-gray-50",
                    "dark:background-color-platinum-400",
                    "margin-x-16",
                  ]) as ViewStyle
                }
              />
            ) : null}
          </View>
        );
      });
    } else if (mode === "direct") {
      return (msgs as AnyWithUnpacked[]).map((msg, i) => {
        const chainInfo = chainStore.getChain(chainId);
        const { title, content } = renderDirectMessage(
          msg,
          chainInfo.currencies
        );

        return (
          <View key={i.toString()}>
            <Msg title={title}>
              <Text style={style.flatten(["body3", "color-text-low"])}>
                {content}
              </Text>
            </Msg>
            {msgs.length - 1 !== i ? (
              <View
                style={
                  style.flatten([
                    "height-1",
                    "background-color-gray-50",
                    "dark:background-color-platinum-400",
                    "margin-x-16",
                  ]) as ViewStyle
                }
              />
            ) : null}
          </View>
        );
      });
    } else {
      return null;
    }
  })();

  if (!isOpen) {
    return null;
  }

  return (
    <CardModal
      isOpen={isOpen}
      title="Confirm transaction"
      close={() => close()}
    >
      <TabBarView
        listItem={TransactionTabEnum}
        selected={selectedId}
        setSelected={setSelectedId}
      />
      {wcSession ? (
        <WCAppLogoAndName
          containerStyle={style.flatten(["margin-y-14"]) as ViewStyle}
          peerMeta={wcSession.peerMeta}
        />
      ) : null}
      {selectedId === TransactionTabEnum.Details ? (
        <React.Fragment>
          <View style={style.flatten(["margin-y-16"]) as ViewStyle}>
            <Text style={style.flatten(["margin-bottom-3"]) as ViewStyle}>
              <Text style={style.flatten(["subtitle3", "color-gray-300"])}>
                {`${msgs.length.toString()} `}
              </Text>
              <Text style={style.flatten(["subtitle3", "color-gray-300"])}>
                {msgs.length > 1 ? "Messages" : "Message"}
              </Text>
            </Text>
            <BlurBackground
              borderRadius={12}
              blurIntensity={16}
              containerStyle={
                [
                  style.flatten(["border-radius-8", "overflow-hidden"]),
                ] as ViewStyle
              }
            >
              <ScrollView
                indicatorStyle={"white"}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
                style={[
                  style.flatten(["max-height-180"]) as ViewStyle,
                  { overflow: "scroll" },
                ]}
              >
                {renderedMsgs}
              </ScrollView>
            </BlurBackground>
          </View>
          <MemoInputView label="Memo" memoConfig={memoConfig} />
          <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
          <FeeInSign
            feeConfig={feeConfig}
            gasConfig={gasConfig}
            signOptions={signInteractionStore.waitingData?.data.signOptions}
            isInternal={isInternal}
          />
        </React.Fragment>
      ) : (
        <DataTab signDocHelper={signDocHelper} ethSignType={ethSignType} />
      )}

      <Button
        text="Approve transaction"
        size="large"
        containerStyle={
          style.flatten(["border-radius-64", "margin-top-20"]) as ViewStyle
        }
        disabled={
          signDocWapper == null ||
          signDocHelper.signDocWrapper == null ||
          memoConfig.error != null ||
          feeConfig.error != null
        }
        loading={signInteractionStore.isLoading}
        onPress={async () => {
          try {
            if (signDocHelper.signDocWrapper) {
              signInteractionStore.approveAndWaitEnd(
                signDocHelper.signDocWrapper
              );
            }
          } catch (error) {
            console.log(error);
          }
        }}
      />
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
    </CardModal>
  );
});
