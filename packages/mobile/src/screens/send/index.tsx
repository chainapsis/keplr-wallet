import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { Button, Input } from "react-native-elements";
import { Page } from "../../components/page";
import { createStackNavigator } from "@react-navigation/stack";

const SendStack = createStackNavigator();

export const SendStackScreen: FunctionComponent = () => {
  return (
    <SendStack.Navigator>
      <SendStack.Screen name="Send" component={SendScreen} />
    </SendStack.Navigator>
  );
};

const SendScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const accountInfo = accountStore.getAccount("secret-2");

  const queries = queriesStore.get("secret-2");

  const sendConfigs = useSendTxConfig(
    chainStore,
    "secret-2",
    accountInfo.msgOpts.send,
    accountInfo.bech32Address,
    queries.getQueryBalances()
  );

  sendConfigs.feeConfig.setFeeType("average");

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const sendConfigIsValid = sendConfigError == null;

  return (
    <Page>
      <Input
        label="Recipient"
        value={sendConfigs.recipientConfig.rawRecipient}
        onChangeText={(value) => {
          sendConfigs.recipientConfig.setRawRecipient(value);
        }}
      />
      <Input
        label="Amount"
        value={sendConfigs.amountConfig.amount}
        onChangeText={(value) => {
          sendConfigs.amountConfig.setAmount(value);
        }}
      />
      <Button
        title="Send"
        disabled={!sendConfigIsValid || !accountInfo.isReadyToSendMsgs}
        onPress={async () => {
          await accountInfo.sendToken(
            sendConfigs.amountConfig.amount,
            sendConfigs.amountConfig.sendCurrency,
            sendConfigs.recipientConfig.recipient,
            sendConfigs.memoConfig.memo,
            sendConfigs.feeConfig.toStdFee(),
            (tx) => {
              console.log(tx);
            }
          );
        }}
      />
    </Page>
  );
});
