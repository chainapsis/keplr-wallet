import React, { FunctionComponent, useEffect, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { ScrollView, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { useStore } from "../../stores";
import { MemoInput } from "../../components/input";
import {
  useFeeConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
  useZeroAllowedGasConfig,
} from "@keplr-wallet/hooks";
import { Button } from "../../components/button";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { Msg } from "./msg";
import { observer } from "mobx-react-lite";
import { useUnmount } from "../../hooks";
import { FeeInSign } from "./fee";
import { WCMessageRequester } from "../../stores/wallet-connect/msg-requester";
import { WCAppLogoAndName } from "../../components/wallet-connect";
import WalletConnect from "@walletconnect/client";
import { renderAminoMessage } from "./amino";
import { renderDirectMessage } from "./direct";
import { AnyWithUnpacked } from "@keplr-wallet/cosmos";
import { unescapeHTML } from "@keplr-wallet/common";

export const SignModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
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
                    horizontal={true}
                    indicatorStyle={style.theme === "dark" ? "white" : "black"}
                  >
                    <Text style={style.flatten(["body3", "color-text-low"])}>
                      {content}
                    </Text>
                  </ScrollView>
                ) : (
                  <Text style={style.flatten(["body3", "color-text-low"])}>
                    {content}
                  </Text>
                )}
              </Msg>
              {msgs.length - 1 !== i ? (
                <View
                  style={style.flatten([
                    "height-1",
                    "background-color-gray-50",
                    "dark:background-color-platinum-400",
                    "margin-x-16",
                  ])}
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
                  style={style.flatten([
                    "height-1",
                    "background-color-gray-50",
                    "dark:background-color-platinum-400",
                    "margin-x-16",
                  ])}
                />
              ) : null}
            </View>
          );
        });
      } else {
        return null;
      }
    })();

    return (
      <CardModal title="Confirm Transaction">
        {wcSession ? (
          <WCAppLogoAndName
            containerStyle={style.flatten(["margin-y-14"])}
            peerMeta={wcSession.peerMeta}
          />
        ) : null}
        <View style={style.flatten(["margin-bottom-16"])}>
          <Text style={style.flatten(["margin-bottom-3"])}>
            <Text style={style.flatten(["subtitle3", "color-blue-400"])}>
              {`${msgs.length.toString()} `}
            </Text>
            <Text style={style.flatten(["subtitle3", "color-text-middle"])}>
              Messages
            </Text>
          </Text>
          <View
            style={style.flatten([
              "border-radius-8",
              "border-width-1",
              "border-color-gray-50",
              "dark:border-color-platinum-400",
              "overflow-hidden",
            ])}
          >
            <ScrollView
              style={style.flatten([
                "max-height-214",
                "background-color-white",
                "dark:background-color-platinum-500",
              ])}
              persistentScrollbar={true}
              indicatorStyle={style.theme === "dark" ? "white" : "black"}
            >
              {renderedMsgs}
            </ScrollView>
          </View>
        </View>
        <MemoInput label="Memo" memoConfig={memoConfig} />
        <FeeInSign
          feeConfig={feeConfig}
          gasConfig={gasConfig}
          signOptions={signInteractionStore.waitingData?.data.signOptions}
          isInternal={isInternal}
        />
        <Button
          text="Approve"
          size="large"
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
                await signInteractionStore.approveAndWaitEnd(
                  signDocHelper.signDocWrapper
                );
              }
            } catch (error) {
              console.log(error);
            }
          }}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
    blurBackdropOnIOS: true,
  }
);
