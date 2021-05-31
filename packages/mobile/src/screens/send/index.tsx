/* eslint-disable react/display-name */
import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { FlexButton } from "../../components/buttons";
import { SafeAreaPage } from "../../components/page";
import { createStackNavigator } from "@react-navigation/stack";
import {
  AddressInput,
  CoinInput,
  MemoInput,
  FeeButtons,
} from "../../components/form";
import { GradientBackground } from "../../components/svg";
import { fcHigh, h3, sf } from "../../styles";
import { useNavigation } from "@react-navigation/native";

const SendStack = createStackNavigator();

export const SendStackScreen: FunctionComponent = () => {
  return (
    <SendStack.Navigator
      screenOptions={{
        headerBackground: () => <GradientBackground />,
        headerBackTitleVisible: false,
        headerTitleStyle: sf([h3, fcHigh]),
      }}
    >
      <SendStack.Screen name="Send" component={SendScreen} />
    </SendStack.Navigator>
  );
};

type SendScreenProps = {
  route: {
    params: {
      initAddress: string;
      initMemo: string;
    };
  };
};

const SendScreen: FunctionComponent<SendScreenProps> = observer(({ route }) => {
  const { initAddress, initMemo } = route.params;

  const navigation = useNavigation();
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const queries = queriesStore.get(chainStore.current.chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainStore.current.chainId,
    accountInfo.msgOpts.send,
    accountInfo.bech32Address,
    queries.queryBalances
  );

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const sendConfigIsValid = sendConfigError == null;

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      sendConfigs.recipientConfig.setRawRecipient(initAddress || "");
      sendConfigs.memoConfig.setMemo(initMemo || "");
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation, route.params]);

  return (
    <SafeAreaPage>
      <AddressInput
        recipientConfig={sendConfigs.recipientConfig}
        hasAddressBook
      />
      <CoinInput
        amountConfig={sendConfigs.amountConfig}
        feeConfig={sendConfigs.feeConfig}
      />
      <MemoInput memoConfig={sendConfigs.memoConfig} />
      <FeeButtons feeConfig={sendConfigs.feeConfig} priceStore={priceStore} />
      <FlexButton
        title="Submit"
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
    </SafeAreaPage>
  );
});
