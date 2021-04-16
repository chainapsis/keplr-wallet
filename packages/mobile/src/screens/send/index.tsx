/* eslint-disable react/display-name */
import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { Button } from "react-native-elements";
import { Page } from "../../components/page";
import { createStackNavigator } from "@react-navigation/stack";
import { AddressInput, CoinInput } from "../../components/form";
import { FeeButtons } from "../../components/form/fee-buttons";
import { GradientBackground } from "../../components/svg";

const SendStack = createStackNavigator();

export const SendStackScreen: FunctionComponent = () => {
  return (
    <SendStack.Navigator
      screenOptions={{ headerBackground: () => <GradientBackground /> }}
    >
      <SendStack.Screen name="Send" component={SendScreen} />
    </SendStack.Navigator>
  );
};

const SendScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const queries = queriesStore.get(chainStore.current.chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainStore.current.chainId,
    accountInfo.msgOpts.send,
    accountInfo.bech32Address,
    queries.getQueryBalances()
  );

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const sendConfigIsValid = sendConfigError == null;

  return (
    <Page>
      <AddressInput recipientConfig={sendConfigs.recipientConfig} />
      <CoinInput amountConfig={sendConfigs.amountConfig} />
      <FeeButtons feeConfig={sendConfigs.feeConfig} priceStore={priceStore} />
      <Button
        title="Send"
        disabled={!sendConfigIsValid || !accountInfo.isReadyToSendMsgs}
        loading={accountInfo.isSendingMsg === "send"}
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
