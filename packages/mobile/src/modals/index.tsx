import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import Modal from "react-native-modal";
import { Button, Form, Input, Item, Label, Text } from "native-base";
import { View } from "react-native";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
} from "@keplr-wallet/hooks";

export const ModalsRenderer: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    interactionModalStore,
    keyRingStore,
    signInteractionStore,
  } = useStore();

  const [password, setPassword] = useState("");

  const [signer, setSigner] = useState("");

  const current = chainStore.getChain("secret-2");
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
    queriesStore.get(current.chainId).getQueryBalances(),
    amountConfig,
    gasConfig
  );
  const memoConfig = useMemoConfig(chainStore, current.chainId);

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
  }, [gasConfig, memoConfig, signDocHelper, signInteractionStore.waitingData]);

  feeConfig.setFeeType("average");

  return (
    <React.Fragment>
      <Modal
        isVisible={interactionModalStore.lastUrl != null}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View
          style={{
            height: 600,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {interactionModalStore.lastUrl === "/unlock" ? (
            <Form style={{ width: "100%" }}>
              <Item floatingLabel>
                <Label>Password</Label>
                <Input
                  autoCompleteType="password"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                />
              </Item>
              <Button
                onPress={async () => {
                  await keyRingStore.unlock(password);
                  interactionModalStore.popUrl();
                }}
              >
                <Text>Unlock</Text>
              </Button>
            </Form>
          ) : null}
          {interactionModalStore.lastUrl === "/sign" ? (
            <View>
              <Text>{JSON.stringify(signDocHelper.signDocJson, null, 2)}</Text>
              <Button
                onPress={async () => {
                  if (signDocHelper.signDocWrapper) {
                    await signInteractionStore.approveAndWaitEnd(
                      signDocHelper.signDocWrapper
                    );
                  }

                  interactionModalStore.popUrl();
                }}
              >
                <Text>Approve</Text>
              </Button>
            </View>
          ) : null}
        </View>
      </Modal>
    </React.Fragment>
  );
});
