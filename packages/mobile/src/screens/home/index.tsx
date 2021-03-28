import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { Button, Input, Text } from "react-native-elements";
import { Page } from "../../components/page";

export const HomeScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const accountInfo = accountStore.getAccount("secret-2");

  const queries = queriesStore.get("secret-2");

  const delegated = queries
    .getQueryDelegations()
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const unbonding = queries
    .getQueryUnbondingDelegations()
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const stakedSum = delegated.add(unbonding);

  const balances = queries
    .getQueryBalances()
    .getQueryBech32Address(accountInfo.bech32Address);
  const stakable = balances.stakable;

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
      <Text h3>Name</Text>
      <Text>{accountInfo.name}</Text>
      <Text h3>Address</Text>
      <Text>{accountInfo.bech32Address}</Text>
      <Text h3>Stakable</Text>
      <Text>{stakable.balance.toString()}</Text>
      <Text h3>Staked</Text>
      <Text>{stakedSum.toString()}</Text>
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
        disabled={!sendConfigIsValid}
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
