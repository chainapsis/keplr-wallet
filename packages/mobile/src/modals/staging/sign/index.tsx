import React, { FunctionComponent, useEffect, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { ScrollView, Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { useInteractionInfo } from "../../../hooks";
import { useStore } from "../../../stores";
import { FeeButtons, MemoInput } from "../../../components/staging/input";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
} from "@keplr-wallet/hooks";
import { Button } from "../../../components/staging/button";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { Msg } from "./msg";

export const SignModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  () => {
    const {
      chainStore,
      accountStore,
      queriesStore,
      interactionModalStore,
      signInteractionStore,
    } = useStore();
    useInteractionInfo(() => {
      signInteractionStore.rejectAll();
    });

    const style = useStyle();

    const [signer, setSigner] = useState("");

    const current = chainStore.getChain(chainStore.current.chainId);
    // Make the gas config with 1 gas initially to prevent the temporary 0 gas error at the beginning.
    const gasConfig = useGasConfig(chainStore, current.chainId, 1);
    const amountConfig = useSignDocAmountConfig(
      chainStore,
      current.chainId,
      accountStore.getAccount(current.chainId).msgOpts
    );
    const feeConfig = useFeeConfig(
      chainStore,
      current.chainId,
      signer,
      queriesStore.get(current.chainId).queryBalances,
      amountConfig,
      gasConfig
    );
    const memoConfig = useMemoConfig(chainStore, current.chainId);

    const signDocWapper = signInteractionStore.waitingData?.data.signDocWrapper;
    const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
    amountConfig.setSignDocHelper(signDocHelper);

    useEffect(() => {
      if (signInteractionStore.waitingData) {
        const data = signInteractionStore.waitingData;
        signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
        gasConfig.setGas(data.data.signDocWrapper.gas);
        memoConfig.setMemo(data.data.signDocWrapper.memo);
        setSigner(data.data.signer);
      }
    }, [
      gasConfig,
      memoConfig,
      signDocHelper,
      signInteractionStore.waitingData,
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
          return (
            <View key={i.toString()}>
              <Msg title={msg.type}>
                <Text
                  style={style.flatten(["body3", "color-text-black-medium"])}
                >
                  TODO: Amino msg format
                </Text>
              </Msg>
              {msgs.length - 1 !== i ? (
                <View
                  style={style.flatten([
                    "height-1",
                    "background-color-border-white",
                    "margin-x-16",
                  ])}
                />
              ) : null}
            </View>
          );
        });
      } else if (mode === "direct") {
        return (msgs as any[]).map((msg, i) => {
          return (
            <View key={i.toString()}>
              <Msg title="Proto Msg">
                <Text
                  style={style.flatten(["body3", "color-text-black-medium"])}
                >
                  TODO: Proto msg format
                </Text>
              </Msg>
              {msgs.length - 1 !== i ? (
                <View
                  style={style.flatten([
                    "height-1",
                    "background-color-border-white",
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
        <View style={style.flatten(["padding-bottom-16"])}>
          <Text
            style={style.flatten([
              "subtitle2",
              "color-text-black-medium",
              "margin-bottom-3",
            ])}
          >
            Messages
          </Text>
          <View
            style={style.flatten([
              "border-radius-8",
              "border-width-1",
              "border-color-border-white",
              "overflow-hidden",
            ])}
          >
            <ScrollView
              style={style.flatten(["max-height-214"])}
              persistentScrollbar={true}
            >
              {renderedMsgs}
            </ScrollView>
          </View>
        </View>
        <MemoInput label="Memo" memoConfig={memoConfig} />
        <FeeButtons
          label="Fee"
          gasLabel="Gas"
          feeConfig={feeConfig}
          gasConfig={gasConfig}
        />
        <View style={style.flatten(["flex-row"])}>
          <Button
            containerStyle={style.flatten(["flex-1"])}
            text="Reject"
            mode="outline"
            disabled={
              signDocWapper == null || signDocHelper.signDocWrapper == null
            }
            loading={signInteractionStore.isLoading}
            onPress={async () => {
              await signInteractionStore.reject();
              interactionModalStore.popUrl();
            }}
          />
          <View style={style.flatten(["width-12"])} />
          <Button
            containerStyle={style.flatten(["flex-1"])}
            text="Approve"
            disabled={
              signDocWapper == null || signDocHelper.signDocWrapper == null
            }
            loading={signInteractionStore.isLoading}
            onPress={async () => {
              try {
                if (signDocHelper.signDocWrapper) {
                  // TODO: ledger need await for user approve
                  signInteractionStore.approveAndWaitEnd(
                    signDocHelper.signDocWrapper
                  );
                }
              } catch (error) {
                console.log(error);
              } finally {
                interactionModalStore.popUrl();
              }
            }}
          />
        </View>
      </CardModal>
    );
  },
  {
    transitionVelocity: 1500,
    disableSafeArea: true,
  }
);
