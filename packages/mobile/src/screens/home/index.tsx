import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import {
  Button,
  Content,
  Form,
  H3,
  Input,
  Item,
  Label,
  Text,
} from "native-base";
import { useSendTxConfig } from "@keplr-wallet/hooks";

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
    <Content padder>
      <H3>Name</H3>
      <Text>{accountInfo.name}</Text>
      <H3>Address</H3>
      <Text>{accountInfo.bech32Address}</Text>
      <H3>Stakable</H3>
      <Text>{stakable.balance.toString()}</Text>
      <H3>Staked</H3>
      <Text>{stakedSum.toString()}</Text>
      <Form>
        <Item floatingLabel>
          <Label>Recipient</Label>
          <Input
            value={sendConfigs.recipientConfig.rawRecipient}
            onChangeText={(value) => {
              sendConfigs.recipientConfig.setRawRecipient(value);
            }}
          />
        </Item>
        <Item floatingLabel>
          <Label>Amount</Label>
          <Input
            value={sendConfigs.amountConfig.amount}
            onChangeText={(value) => {
              sendConfigs.amountConfig.setAmount(value);
            }}
          />
        </Item>
        <Button
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
        >
          <Text>Send</Text>
        </Button>
      </Form>
    </Content>
  );
});
