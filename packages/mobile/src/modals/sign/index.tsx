import React, { FunctionComponent, useEffect, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { ScrollView, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { useInteractionInfo } from "../../hooks";
import { useStore } from "../../stores";
import { FeeButtons, MemoInput } from "../../components/input";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
} from "@keplr-wallet/hooks";
import { Button } from "../../components/button";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { Msg } from "./msg";
import { observer } from "mobx-react-lite";

export const SignModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
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

    const [chainId, setChainId] = useState(chainStore.current.chainId);

    // Make the gas config with 1 gas initially to prevent the temporary 0 gas error at the beginning.
    const gasConfig = useGasConfig(chainStore, chainId, 1);
    const amountConfig = useSignDocAmountConfig(
      chainStore,
      chainId,
      accountStore.getAccount(chainId).msgOpts
    );
    const feeConfig = useFeeConfig(
      chainStore,
      chainId,
      signer,
      queriesStore.get(chainId).queryBalances,
      amountConfig,
      gasConfig
    );
    const memoConfig = useMemoConfig(chainStore, chainId);

    const signDocWapper = signInteractionStore.waitingData?.data.signDocWrapper;
    const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
    amountConfig.setSignDocHelper(signDocHelper);

    useEffect(() => {
      if (signInteractionStore.waitingData) {
        const data = signInteractionStore.waitingData;
        signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
        setChainId(data.data.signDocWrapper.chainId);
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
        <View style={style.flatten(["margin-bottom-16"])}>
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
        <Button
          text="Approve"
          disabled={
            signDocWapper == null ||
            signDocHelper.signDocWrapper == null ||
            memoConfig.getError() != null ||
            feeConfig.getError() != null
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
            } finally {
              interactionModalStore.popUrl();
            }
          }}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
