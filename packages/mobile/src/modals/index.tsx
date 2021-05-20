import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import Modal from "react-native-modal";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { View } from "react-native";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
} from "@keplr-wallet/hooks";
import { Text } from "react-native-elements";
import {
  flexDirectionRow,
  justifyContentEnd,
  m0,
  sf,
  h4,
  fAlignCenter,
  my3,
} from "../styles";
import { FlexButton, FlexWhiteButton } from "../components/buttons";
import { TransactionDetails } from "./transaction-details";
import { FullPage } from "../components/page";
import { useInteractionInfo } from "../hooks";
import { Input } from "../components/input";

export const ModalsRenderer: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    interactionModalStore,
    keyRingStore,
    signInteractionStore,
  } = useStore();
  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });

  const [password, setPassword] = useState("");

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

  const isSignDocInternalSend = (() => {
    if (signDocWapper && signDocWapper.mode === "amino") {
      const signDoc = signDocWapper.aminoSignDoc;
      return (
        interactionInfo.interaction &&
        interactionInfo.interactionInternal &&
        signDoc.msgs.length === 1 &&
        (signDoc.msgs[0].type === "cosmos-sdk/MsgSend" ||
          signDoc.msgs[0].type === "cosmos-sdk/MsgTransfer")
      );
    }
    return false;
  })();

  useEffect(() => {
    if (signInteractionStore.waitingData) {
      const data = signInteractionStore.waitingData;
      signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
      gasConfig.setGas(data.data.signDocWrapper.gas);
      memoConfig.setMemo(data.data.signDocWrapper.memo);
      setSigner(data.data.signer);
    }
  }, [gasConfig, memoConfig, signDocHelper, signInteractionStore.waitingData]);

  const [
    isLoadingSignDocInternalSend,
    setIsLoadingSignDocInternalSend,
  ] = useState(false);

  const disableInputs = isSignDocInternalSend || isLoadingSignDocInternalSend;

  // RectButton in Modal only working in HOC on android
  const UnlockButtonWithHoc = gestureHandlerRootHOC(() => {
    return (
      <FlexButton
        title="Unlock"
        onPress={async () => {
          await keyRingStore.unlock(password);
          interactionModalStore.popUrl();
        }}
      />
    );
  });

  const ApproveButtonWithHoc = gestureHandlerRootHOC(() => {
    return (
      <FlexButton
        title="Approve"
        onPress={async () => {
          if (signDocHelper.signDocWrapper) {
            await signInteractionStore.approveAndWaitEnd(
              signDocHelper.signDocWrapper
            );
          }
          interactionModalStore.popUrl();
        }}
      />
    );
  });

  const RejectButtonWithHoc = gestureHandlerRootHOC(() => {
    return (
      <FlexWhiteButton
        title="Reject"
        color="error"
        onPress={async () => {
          await signInteractionStore.reject();
          interactionModalStore.popUrl();
        }}
      />
    );
  });

  return (
    <React.Fragment>
      <Modal
        isVisible={interactionModalStore.lastUrl != null}
        style={sf([justifyContentEnd, m0])}
      >
        <View style={{ height: 600 }}>
          <FullPage>
            {interactionModalStore.lastUrl === "/unlock" ? (
              <React.Fragment>
                <Text style={sf([h4, fAlignCenter, my3])}>Unlock</Text>
                <Input
                  label="Password"
                  autoCompleteType="password"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                />
                <UnlockButtonWithHoc />
              </React.Fragment>
            ) : null}
            {interactionModalStore.lastUrl === "/sign" ? (
              <React.Fragment>
                <Text style={sf([h4, fAlignCenter, my3])}>
                  Confirm Transaction
                </Text>
                {/* <ScrollView>
                <Text>
                  {JSON.stringify(signDocHelper.signDocJson, null, 2)}
                </Text>
              </ScrollView> */}
                <TransactionDetails
                  signDocHelper={signDocHelper}
                  memoConfig={memoConfig}
                  feeConfig={feeConfig}
                  gasConfig={gasConfig}
                  disableInputs={disableInputs}
                />
                <View style={flexDirectionRow}>
                  <RejectButtonWithHoc />
                  <ApproveButtonWithHoc />
                </View>
              </React.Fragment>
            ) : null}
          </FullPage>
        </View>
      </Modal>
    </React.Fragment>
  );
});
